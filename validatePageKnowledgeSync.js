// Verifies that the structured page knowledge still matches the rendered website, which is the
// business source of truth. Requires the site to be served (npm start) and a local Chrome.
//
//   SITE_URL=http://localhost:3000 CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" node validatePageKnowledgeSync.js
//
// Stage titles, execution labels, section examples and note texts must appear verbatim. Stage
// descriptions must appear verbatim unless the stage is marked `paraphrased: true` (a split sentence
// or a diagram-only stage); detail lines always must; `image` must match a screenshot's alt text.
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { LEGACY_PAGE_META, structuredPages } = require("./knowledge/pages");
const { pageKnowledge } = require("./pageKnowledge");

const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const CHROME_PATH = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function main() {
  // 1. The frontend route map (app.js PAGE_ASSISTANT_ROUTES) must match the canonical page
  //    registry (pageKnowledge) that askHandler uses to decide which pages are supported.
  const registryErrors = validateAssistantRouteRegistry();
  console.log(`registryPages=${Object.keys(pageKnowledge).length}`);
  console.log(`registryMismatches=${registryErrors.length}`);
  registryErrors.forEach((error) => console.error(error));
  if (registryErrors.length) process.exitCode = 1;

  // 2. The structured knowledge must match the rendered pages.
  if (!fs.existsSync(CHROME_PATH)) {
    console.error(`Chrome not found at ${CHROME_PATH}; set CHROME_PATH.`);
    process.exitCode = 1;
    return;
  }

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-sync-"));
  const errors = [];
  let checks = 0;

  for (const page of structuredPages) {
    const routes = page.route.split(" + ").map((route) => route.trim());
    const renderedText = routes.map((route) => renderText(`${SITE_URL}/?sync=1${route}`, profileDir)).join("\n");
    const expect = (label, value) => {
      checks += 1;
      if (!renderedText.includes(normalize(value))) errors.push(`${page.id}: ${label} not found on page: "${value}"`);
    };

    for (const stage of page.stages) {
      expect(`stage ${stage.number} title`, stage.title);
      if (stage.execution) expect(`stage ${stage.number} execution`, stage.execution);
      if (!stage.paraphrased) expect(`stage ${stage.number} description`, stripEnd(stage.description));
      for (const detail of stage.details || []) expect(`stage ${stage.number} detail`, stripEnd(afterLabel(detail)));
      if (stage.image) expect(`stage ${stage.number} image`, stage.image);
    }

    for (const section of page.sections || []) {
      expect(`section ${section.number} title`, section.title);
      expect(`section ${section.number} description`, stripEnd(section.description));
      for (const example of section.examples || []) expect(`section ${section.number} example`, example);
    }

    for (const note of page.notes || []) {
      for (const sentence of note.text.split(/(?<=\.)\s+/u)) expect(`note ${note.id}`, stripEnd(afterLabel(sentence)));
    }
  }

  fs.rmSync(profileDir, { recursive: true, force: true });
  console.log(`pages=${structuredPages.length}`);
  console.log(`checks=${checks}`);
  console.log(`mismatches=${errors.length}`);
  errors.forEach((error) => console.error(error));
  console.log(`result=${errors.length === 0 && registryErrors.length === 0 ? "PASS" : "FAIL"}`);
  if (errors.length) process.exitCode = 1;
}

function validateAssistantRouteRegistry() {
  const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  const match = source.match(/const PAGE_ASSISTANT_ROUTES = (\{[\s\S]*?\n\});/);
  if (!match) return ["app.js: PAGE_ASSISTANT_ROUTES not found"];

  // Evaluates the plain object literal from our own app.js.
  const routes = new Function(`return (${match[1]});`)();
  const routeToPage = new Map();
  for (const [type, entries] of Object.entries(routes)) {
    for (const [key, pageId] of Object.entries(entries)) routeToPage.set(`#/${type}/${key}`, pageId);
  }

  const errors = [];
  const registered = new Set(Object.keys(pageKnowledge));
  for (const [route, pageId] of routeToPage) {
    if (!registered.has(pageId)) errors.push(`app.js: route ${route} sends unknown pageId "${pageId}"`);
  }

  const expectedRoutes = [
    ...structuredPages.flatMap((page) => page.route.split(" + ").map((route) => [route.trim(), page.id])),
    ...Object.entries(LEGACY_PAGE_META).map(([pageId, meta]) => [meta.route, pageId]),
  ];
  for (const [route, pageId] of expectedRoutes) {
    if (routeToPage.get(route) !== pageId) {
      errors.push(`app.js: route ${route} should send pageId "${pageId}" but sends "${routeToPage.get(route) || "(global)"}"`);
    }
  }

  const reachable = new Set(routeToPage.values());
  for (const pageId of registered) {
    if (!reachable.has(pageId)) errors.push(`app.js: no route sends the registered pageId "${pageId}"`);
  }
  return errors;
}

function renderText(url, profileDir) {
  const html = execFileSync(
    CHROME_PATH,
    ["--headless=new", "--disable-gpu", `--user-data-dir=${profileDir}`, "--virtual-time-budget=4000", "--dump-dom", url],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  return normalize(
    html
      .replace(/<script[\s\S]*?<\/script>/giu, " ")
      .replace(/<style[\s\S]*?<\/style>/giu, " ")
      .replace(/<img\b[^>]*\balt="([^"]*)"[^>]*>/giu, " $1 ")
      .replace(/<\/?(?:bdi|span|strong|b|em|i|code|small|a)\b[^>]*>/giu, "")
      .replace(/<[^>]+>/gu, " ")
      .replace(/&nbsp;/gu, " ")
      .replace(/&quot;/gu, '"')
      .replace(/&amp;/gu, "&")
      .replace(/&lt;/gu, "<")
      .replace(/&gt;/gu, ">")
      .replace(/&#39;|&#039;/gu, "'"),
  );
}

// Detail lines are stored as "عنوان الخطوة: النص"; the page renders heading and text separately.
function afterLabel(value) {
  const match = String(value).match(/^[^:]{2,60}:\s(.+)$/u);
  return match ? match[1] : value;
}

function stripEnd(value) {
  return String(value).trim().replace(/[.،:]+$/u, "");
}

// Diacritics (tashkeel) are ignored: their order can differ between sources without changing text.
// Typography-only characters are ignored too: invisible bidi isolates (U+2066–U+2069) around English
// terms, and the non-breaking hyphen (U+2011) that keeps a term on one line reads as "-".
function normalize(value) {
  return String(value)
    .replace(/[\u2066-\u2069]/gu, "")
    .replace(/\u2011/gu, "-")
    .replace(/[ً-ٰٟ]/gu, "")
    .replace(/[—–]/gu, "—")
    .replace(/\s+/gu, " ")
    .trim();
}

main();
