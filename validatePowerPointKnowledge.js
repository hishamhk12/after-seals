// Offline validation of the PowerPoint knowledge source (no API calls):
//   - the committed extraction matches the approved deck (file hash)
//   - every slide is mapped (or deliberately excluded) and parses without anomalies
//   - every mapped page exists in pageKnowledge
//   - the embedding store covers every active chunk with fresh hashes (model / dimension match)
const path = require("node:path");
const { extractPresentation } = require("./powerpointExtractor");
const { SOURCE_FILE } = require("./knowledge/powerpoint/manifest");
const { loadGlobalEmbeddingStore } = require("./globalKnowledgeStore");
const { pageKnowledge } = require("./pageKnowledge");
const { getPowerPointAnalysis, validatePowerPointEmbeddingStore } = require("./powerpointKnowledge");

function main() {
  const errors = [];
  const warnings = [];
  const { extraction, deck, facts, chunks } = getPowerPointAnalysis();

  if (!extraction) {
    console.error("No extraction found. Run: node buildPowerPointKnowledge.js");
    process.exitCode = 1;
    return;
  }

  const current = extractPresentation(path.join(__dirname, SOURCE_FILE), { previous: extraction });
  if (current.fileHash !== extraction.fileHash) errors.push(`${SOURCE_FILE} changed since extraction; run node buildPowerPointKnowledge.js`);

  for (const item of deck.excluded.filter((excluded) => excluded.review)) errors.push(`slide ${item.slideNumber}: ${item.reason}`);
  for (const item of deck.anomalies) errors.push(`slide ${item.slideNumber} parse anomaly: ${item.message}`);
  for (const slide of deck.slides) {
    if (slide.pageId && !pageKnowledge[slide.pageId]) errors.push(`slide ${slide.slideNumber} maps to unknown page ${slide.pageId}`);
    if (slide.review) warnings.push(`slide ${slide.slideNumber} (${slide.slideTitle}): ${slide.review}`);
  }

  const ids = new Set();
  for (const chunk of chunks) {
    if (ids.has(chunk.id)) errors.push(`duplicate chunk id ${chunk.id}`);
    ids.add(chunk.id);
  }

  const model = loadGlobalEmbeddingStore()?.model;
  const store = validatePowerPointEmbeddingStore({ chunks, expectedModel: model, expectedDimension: 768 });
  if (!store.ok) warnings.push(...store.errors.map((error) => `embedding store: ${error}`));

  const counts = facts.reduce((all, fact) => ({ ...all, [fact.classification]: (all[fact.classification] || 0) + 1 }), {});
  console.log(`source=${SOURCE_FILE}`);
  console.log(`slidesInspected=${extraction.slideCount}; included=${deck.slides.length}; excluded=${deck.excluded.length}`);
  console.log(`facts=${facts.length} ${JSON.stringify(counts)}`);
  console.log(`chunks=${chunks.length}; embeddedRecords=${store.recordCount}; storeOk=${store.ok}`);
  for (const warning of warnings) console.log(`WARN ${warning}`);
  for (const error of errors) console.log(`ERROR ${error}`);
  console.log(`result=${errors.length === 0 ? "PASS" : "FAIL"}`);
  if (errors.length) process.exitCode = 1;
}

main();
