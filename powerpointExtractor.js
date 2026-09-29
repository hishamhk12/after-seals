// Reads a .pptx (zip + DrawingML XML) without external dependencies and turns every slide into a
// list of positioned text shapes. Group transforms are applied, so coordinates are absolute slide
// points (EMU / 12700). Parsing is cached per slide XML hash: when the deck changes, only changed
// slides are re-parsed (see extractPresentation's `previous` argument).
const crypto = require("node:crypto");
const fs = require("node:fs");
const zlib = require("node:zlib");

const EMU_PER_POINT = 12700;

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// --- zip -----------------------------------------------------------------------------------------

function readZipEntries(buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  let offset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Invalid pptx: malformed zip central directory.");
    }

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);

    entries.set(name, { method, compressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return {
    has: (name) => entries.has(name),
    read(name) {
      const entry = entries.get(name);
      if (!entry) return null;
      const local = entry.localHeaderOffset;
      const dataStart = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      const data = buffer.subarray(dataStart, dataStart + entry.compressedSize);
      if (entry.method === 0) return data.toString("utf8");
      if (entry.method === 8) return zlib.inflateRawSync(data).toString("utf8");
      throw new Error(`Unsupported zip compression method ${entry.method} for ${name}`);
    },
  };
}

function findEndOfCentralDirectory(buffer) {
  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 65557); offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("Invalid pptx: zip end of central directory not found.");
}

// --- xml -----------------------------------------------------------------------------------------

function parseXml(xml) {
  const root = { name: "#root", attrs: {}, children: [] };
  const stack = [root];
  const tokenPattern = /<!\[CDATA\[([\s\S]*?)\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[^\s=>/]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
  let match;

  while ((match = tokenPattern.exec(xml))) {
    const parent = stack[stack.length - 1];
    if (match[1] !== undefined) {
      parent.children.push({ name: "#text", text: match[1] });
    } else if (match[3]) {
      if (match[2]) {
        stack.pop();
      } else {
        const node = { name: match[3], attrs: parseAttributes(match[4]), children: [] };
        parent.children.push(node);
        if (!match[5]) stack.push(node);
      }
    } else if (match[6] !== undefined && parent !== root) {
      parent.children.push({ name: "#text", text: decodeEntities(match[6]) });
    }
  }

  return root;
}

function parseAttributes(source) {
  const attrs = {};
  const pattern = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = pattern.exec(source || ""))) {
    attrs[match[1]] = decodeEntities(match[2] ?? match[3]);
  }
  return attrs;
}

function decodeEntities(value) {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function child(node, name) {
  return node?.children?.find((item) => item.name === name) || null;
}

function descendants(node, name, results = []) {
  for (const item of node?.children || []) {
    if (item.name === name) results.push(item);
    descendants(item, name, results);
  }
  return results;
}

// --- presentation structure ----------------------------------------------------------------------

function readRelationships(zip, relsPath) {
  const xml = zip.read(relsPath);
  if (!xml) return new Map();
  return new Map(descendants(parseXml(xml), "Relationship").map((rel) => [rel.attrs.Id, rel.attrs]));
}

function resolveTarget(basePath, target) {
  const parts = basePath.split("/").slice(0, -1);
  for (const segment of target.split("/")) {
    if (segment === "..") parts.pop();
    else if (segment !== ".") parts.push(segment);
  }
  return parts.join("/");
}

// Slides in presentation order (p:sldIdLst), which need not match the slideN.xml file numbers.
function listSlidePaths(zip) {
  const presentation = parseXml(zip.read("ppt/presentation.xml"));
  const rels = readRelationships(zip, "ppt/_rels/presentation.xml.rels");
  return descendants(presentation, "p:sldId").map((slideId) => resolveTarget("ppt/presentation.xml", rels.get(slideId.attrs["r:id"]).Target));
}

// --- shapes --------------------------------------------------------------------------------------

const IDENTITY = { sx: 1, sy: 1, tx: 0, ty: 0 };

function applyTransform(transform, x, y) {
  return { x: transform.tx + transform.sx * x, y: transform.ty + transform.sy * y };
}

function readXfrm(xfrm) {
  const off = child(xfrm, "a:off");
  const ext = child(xfrm, "a:ext");
  return {
    x: Number(off?.attrs.x || 0),
    y: Number(off?.attrs.y || 0),
    cx: Number(ext?.attrs.cx || 0),
    cy: Number(ext?.attrs.cy || 0),
    chOff: child(xfrm, "a:chOff"),
    chExt: child(xfrm, "a:chExt"),
  };
}

function groupTransform(parent, grpSp) {
  const xfrm = readXfrm(child(child(grpSp, "p:grpSpPr"), "a:xfrm"));
  const chX = Number(xfrm.chOff?.attrs.x || 0);
  const chY = Number(xfrm.chOff?.attrs.y || 0);
  const chCx = Number(xfrm.chExt?.attrs.cx || 0) || xfrm.cx || 1;
  const chCy = Number(xfrm.chExt?.attrs.cy || 0) || xfrm.cy || 1;
  const sx = xfrm.cx ? xfrm.cx / chCx : 1;
  const sy = xfrm.cy ? xfrm.cy / chCy : 1;
  // local child point p -> group parent space: off + (p - chOff) * s
  const local = { sx, sy, tx: xfrm.x - chX * sx, ty: xfrm.y - chY * sy };
  return {
    sx: parent.sx * local.sx,
    sy: parent.sy * local.sy,
    tx: parent.tx + parent.sx * local.tx,
    ty: parent.ty + parent.sy * local.ty,
  };
}

function readParagraphs(txBody) {
  return descendants(txBody, "a:p")
    .map((paragraph) =>
      paragraph.children
        .map((item) => {
          if (item.name === "a:br") return "\n";
          if (item.name === "a:r" || item.name === "a:fld") return descendants(item, "a:t").map(textOf).join("");
          return "";
        })
        .join("")
        .replace(/[ \t ]+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

function textOf(node) {
  return (node.children || []).filter((item) => item.name === "#text").map((item) => item.text).join("");
}

function collectShapes(container, transform, groupPath, shapes) {
  for (const node of container.children || []) {
    if (node.name === "p:grpSp") {
      const name = child(child(node, "p:nvGrpSpPr"), "p:cNvPr")?.attrs.name || "Group";
      collectShapes(node, groupTransform(transform, node), [...groupPath, name], shapes);
      continue;
    }

    if (node.name !== "p:sp" && node.name !== "p:graphicFrame") continue;

    const nv = child(node, node.name === "p:sp" ? "p:nvSpPr" : "p:nvGraphicFramePr");
    const cNvPr = child(nv, "p:cNvPr");
    const xfrm = readXfrm(node.name === "p:sp" ? child(child(node, "p:spPr"), "a:xfrm") : child(node, "p:xfrm"));
    const paragraphs =
      node.name === "p:sp"
        ? readParagraphs(child(node, "p:txBody"))
        : descendants(node, "a:tr").map((row) => descendants(row, "a:tc").map((cell) => readParagraphs(cell).join(" ")).join(" | "));

    if (paragraphs.length === 0) continue;

    const topLeft = applyTransform(transform, xfrm.x, xfrm.y);
    const width = xfrm.cx * transform.sx;
    const height = xfrm.cy * transform.sy;
    shapes.push({
      id: Number(cNvPr?.attrs.id || 0),
      name: cNvPr?.attrs.name || "",
      group: groupPath.join(" > ") || null,
      x: toPoints(topLeft.x),
      y: toPoints(topLeft.y),
      width: toPoints(width),
      height: toPoints(height),
      centerX: toPoints(topLeft.x + width / 2),
      paragraphs,
      text: paragraphs.join("\n"),
    });
  }

  return shapes;
}

function toPoints(emu) {
  return Math.round(emu / EMU_PER_POINT);
}

function parseSlide(zip, slidePath, slideXml) {
  const root = parseXml(slideXml);
  const sld = child(root, "p:sld");
  const spTree = child(child(sld, "p:cSld"), "p:spTree");
  const shapes = collectShapes(spTree, IDENTITY, [], []);
  // Only the body placeholder holds speaker notes; the slide-image and number placeholders do not.
  const notes = descendants(parseXml(readNotesXml(zip, slidePath)), "p:sp")
    .filter((sp) => descendants(sp, "p:ph").some((ph) => ph.attrs.type === "body"))
    .flatMap((sp) => readParagraphs(child(sp, "p:txBody")))
    .join("\n");

  return { hidden: sld?.attrs.show === "0", notes, shapes };
}

function readNotesXml(zip, slidePath) {
  const rels = readRelationships(zip, slidePath.replace(/slides\/(slide\d+\.xml)$/, "slides/_rels/$1.rels"));
  const notesRel = [...rels.values()].find((rel) => /\/notesSlide$/.test(rel.Type));
  return notesRel ? zip.read(resolveTarget(slidePath, notesRel.Target)) || "" : "";
}

// Extracts every slide. `previous` is an earlier extraction result: slides whose XML hash did not
// change are reused as-is, so a one-slide edit re-parses one slide.
function extractPresentation(filePath, { previous = null } = {}) {
  const buffer = fs.readFileSync(filePath);
  const fileHash = sha256(buffer);
  const zip = readZipEntries(buffer);
  const previousByHash = new Map((previous?.slides || []).map((slide) => [slide.xmlHash, slide]));
  const stats = { reused: 0, parsed: 0 };

  const slides = listSlidePaths(zip).map((slidePath, index) => {
    const slideXml = zip.read(slidePath);
    const xmlHash = sha256(`${slideXml}\n${readNotesXml(zip, slidePath)}`);
    const cached = previousByHash.get(xmlHash);

    if (cached) {
      stats.reused += 1;
      return { ...cached, number: index + 1, path: slidePath };
    }

    stats.parsed += 1;
    return { number: index + 1, path: slidePath, xmlHash, ...parseSlide(zip, slidePath, slideXml) };
  });

  return { fileHash, slideCount: slides.length, slides, stats };
}

module.exports = { extractPresentation, parseXml, readZipEntries, sha256 };
