const { buildKnowledgeChunks } = require("./pageKnowledge");
const { getStorePath, loadEmbeddingStore, validateEmbeddingStore } = require("./embeddingStore");

const pageId = process.env.EMBEDDING_PAGE_ID || "intro-tour";
const chunks = buildKnowledgeChunks(pageId);
const store = loadEmbeddingStore(pageId);
const validation = validateEmbeddingStore(pageId, chunks, store);

console.log(`store=${getStorePath(pageId)}`);
console.log(`pageId=${pageId}`);
console.log(`chunks=${validation.chunkCount}`);
console.log(`records=${validation.recordCount}`);
console.log(`dimension=${validation.dimension}`);
console.log(`result=${validation.ok ? "PASS" : "FAIL"}`);

if (!validation.ok) {
  for (const error of validation.errors) {
    console.error(error);
  }

  process.exitCode = 1;
}
