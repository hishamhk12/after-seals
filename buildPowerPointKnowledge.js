// Offline step (no API calls): extracts the approved PowerPoint, reconciles it with the website
// knowledge, and prints the chunk / embedding plan.
//   node buildPowerPointKnowledge.js           extract (re-parsing only changed slides) + report
//   node buildPowerPointKnowledge.js --check   report only; fail if the deck changed since extraction
const fs = require("node:fs");
const path = require("node:path");
const { extractPresentation } = require("./powerpointExtractor");
const { EXCLUDED_FILES, SOURCE_FILE } = require("./knowledge/powerpoint/manifest");
const { EXTRACTION_PATH, analyzePowerPoint, loadExtraction, loadPowerPointEmbeddingStore } = require("./powerpointKnowledge");

const REPORT_PATH = path.join(__dirname, "data", "powerpoint", "reconciliation-report.json");
const NON_APPROVED_PATTERN = /(_backup|backup|\(\d+\)|~\$|\.tmp$|copy)/i;

function main() {
  const checkOnly = process.argv.includes("--check");
  const sourcePath = path.join(__dirname, SOURCE_FILE);

  if (NON_APPROVED_PATTERN.test(SOURCE_FILE) || EXCLUDED_FILES.some((item) => item.file === SOURCE_FILE)) {
    throw new Error(`Refusing to index ${SOURCE_FILE}: it looks like a backup / copy.`);
  }
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Approved PowerPoint not found: ${sourcePath}`);
  }

  const previous = loadExtraction();
  const extracted = extractPresentation(sourcePath, { previous });
  const changes = diffSlides(previous, extracted);
  const unchanged = previous?.fileHash === extracted.fileHash;

  console.log(`source=${SOURCE_FILE}`);
  console.log(`fileHash=${extracted.fileHash}`);
  console.log(`deckChanged=${previous ? !unchanged : "first extraction"}`);
  console.log(`slides=${extracted.slideCount}; parsed=${extracted.stats.parsed}; reusedFromCache=${extracted.stats.reused}`);
  if (changes.length) console.log(`slideChanges=${changes.join("; ")}`);

  if (checkOnly) {
    if (!unchanged) {
      console.error("The approved PowerPoint changed since the last extraction. Run: node buildPowerPointKnowledge.js");
      process.exitCode = 1;
    }
  } else if (!unchanged) {
    const payload = {
      sourceFile: SOURCE_FILE,
      fileHash: extracted.fileHash,
      extractedAt: new Date().toISOString(),
      slideCount: extracted.slideCount,
      slides: extracted.slides.map(({ number, path: slidePath, xmlHash, hidden, notes, shapes }) => ({ number, path: slidePath, xmlHash, hidden, notes, shapes })),
    };
    fs.mkdirSync(path.dirname(EXTRACTION_PATH), { recursive: true });
    fs.writeFileSync(EXTRACTION_PATH, `${JSON.stringify(payload, null, 1)}\n`, "utf8");
    console.log(`extraction=${EXTRACTION_PATH}`);
  }

  const analysis = analyzePowerPoint(checkOnly ? previous : loadExtraction());
  printReport(analysis);
  if (!checkOnly) {
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(buildReport(analysis), null, 2)}\n`, "utf8");
    console.log(`report=${REPORT_PATH}`);
  }
}

function diffSlides(previous, current) {
  if (!previous) return [];
  const before = new Map(previous.slides.map((slide) => [slide.xmlHash, slide.number]));
  const after = new Set(current.slides.map((slide) => slide.xmlHash));
  const changes = current.slides.filter((slide) => !before.has(slide.xmlHash)).map((slide) => `slide ${slide.number} new/changed`);
  const removed = previous.slides.filter((slide) => !after.has(slide.xmlHash)).map((slide) => `old slide ${slide.number} removed/changed`);
  return [...changes, ...removed];
}

function countBy(items, key) {
  return items.reduce((counts, item) => ({ ...counts, [item[key]]: (counts[item[key]] || 0) + 1 }), {});
}

function printReport({ extraction, deck, facts, chunks }) {
  console.log("");
  console.log(`slidesInspected=${extraction?.slideCount || 0}`);
  console.log(`slidesIncluded=${deck.slides.length}`);
  for (const slide of deck.slides) {
    console.log(`  slide ${slide.slideNumber}: ${slide.slideTitle} → ${slide.pageId || "(global only)"} [${slide.kind}]${slide.review ? ` REVIEW: ${slide.review}` : ""}`);
  }
  console.log(`slidesExcluded=${deck.excluded.length}`);
  for (const item of deck.excluded) console.log(`  slide ${item.slideNumber}: ${item.title || "?"} — ${item.reason}${item.review ? " (REVIEW)" : ""}`);
  console.log(`parseAnomalies=${deck.anomalies.length}`);
  for (const item of deck.anomalies) console.log(`  slide ${item.slideNumber} (${item.slideTitle}): ${item.message}`);

  console.log("");
  console.log(`facts=${facts.length} ${JSON.stringify(countBy(facts, "classification"))}`);
  for (const classification of ["conflict", "outdated", "unverified"]) {
    for (const fact of facts.filter((item) => item.classification === classification)) {
      console.log(`  ${classification.toUpperCase()} ${fact.id}: slide="${display(fact.value)}" website="${display(fact.websiteValue)}" — ${fact.reason}`);
    }
  }

  const store = loadPowerPointEmbeddingStore();
  const stored = new Map((store?.records || []).map((record) => [record.id, record.contentHash]));
  const reuse = chunks.filter((chunk) => stored.get(chunk.id) === chunk.contentHash).length;
  console.log("");
  console.log(`plannedChunks=${chunks.length} ${JSON.stringify(countBy(chunks, "type"))}`);
  console.log(`embeddingPlan: reuse=${reuse}; toEmbed=${chunks.length - reuse}; toPrune=${[...stored.keys()].filter((id) => !chunks.some((chunk) => chunk.id === id)).length}`);
}

function display(value) {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : JSON.stringify(value).slice(0, 120);
}

function buildReport({ extraction, deck, facts, chunks }) {
  return {
    sourceFile: extraction?.sourceFile,
    fileHash: extraction?.fileHash,
    slidesInspected: extraction?.slideCount || 0,
    slidesIncluded: deck.slides.map((slide) => ({ slideNumber: slide.slideNumber, title: slide.slideTitle, kind: slide.kind, service: slide.service, pageId: slide.pageId, review: slide.review })),
    slidesExcluded: deck.excluded,
    parseAnomalies: deck.anomalies,
    factCounts: countBy(facts, "classification"),
    facts: facts.map(({ id, slideNumber, pageId, factType, stageNumber, stageTitle, value, websiteValue, classification, reason }) => ({
      id,
      slideNumber,
      pageId,
      factType,
      stageNumber,
      stageTitle,
      value,
      websiteValue,
      classification,
      reason,
    })),
    chunks: chunks.map((chunk) => ({ id: chunk.id, type: chunk.type, page: chunk.metadata.page_id, slide: chunk.metadata.slide_number, status: chunk.status, contentHash: chunk.contentHash })),
  };
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
