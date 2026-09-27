const { buildKnowledgeChunks, pageKnowledge } = require("./pageKnowledge");
const { getStorePath, loadEmbeddingStore, validateEmbeddingStore } = require("./embeddingStore");

// `node validateEmbeddings.js <pageId|all>` (or EMBEDDING_PAGE_ID) validates one page store
// (default intro-tour) or every page.
const requested = process.argv[2] || process.env.EMBEDDING_PAGE_ID || "intro-tour";
const pageIds = requested === "all" ? Object.keys(pageKnowledge) : requested.split(",").map((id) => id.trim());

for (const pageId of pageIds) {
  const chunks = buildKnowledgeChunks(pageId);
  const store = loadEmbeddingStore(pageId);
  const validation = validateEmbeddingStore(pageId, chunks, store);

  console.log(`store=${getStorePath(pageId)}`);
  console.log(`pageId=${pageId}`);
  console.log(`chunks=${validation.chunkCount}`);
  console.log(`records=${validation.recordCount}`);
  console.log(`dimension=${validation.dimension}`);
  console.log(`model=${store?.model || "(none)"}`);
  console.log(`result=${validation.ok ? "PASS" : "FAIL"}`);

  if (!validation.ok) {
    for (const error of validation.errors) {
      console.error(error);
    }

    process.exitCode = 1;
  }
}
