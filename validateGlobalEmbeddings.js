const { getEmbeddingModel } = require("./embeddingService");
const { validateGlobalKnowledge } = require("./validateGlobalKnowledge");
const { globalKnowledgeItems } = require("./knowledge/globalKnowledge");
const { buildGlobalKnowledgeChunks, loadGlobalEmbeddingStore, validateGlobalEmbeddingStore } = require("./globalKnowledgeStore");

function main() {
  const errors = [];
  const knowledgeValidation = validateGlobalKnowledge(globalKnowledgeItems, []);
  if (!knowledgeValidation.ok) {
    errors.push(...knowledgeValidation.errors);
  }

  const chunks = buildGlobalKnowledgeChunks();
  const store = loadGlobalEmbeddingStore();
  const storeValidation = validateGlobalEmbeddingStore({
    chunks,
    store,
    expectedModel: getEmbeddingModel(),
    expectedDimension: 768,
  });

  if (!storeValidation.ok) {
    errors.push(...storeValidation.errors);
  }

  console.log(`globalKnowledgeValid=${knowledgeValidation.ok}`);
  console.log(`chunks=${chunks.length}`);
  console.log(`records=${storeValidation.recordCount}`);
  console.log(`model=${storeValidation.model || ""}`);
  console.log(`dimension=${storeValidation.dimension || 0}`);
  console.log(`result=${errors.length === 0 ? "PASS" : "FAIL"}`);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

main();
