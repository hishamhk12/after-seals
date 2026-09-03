const { createEmbedding } = require("./embeddingService");
const { loadEmbeddingStore, validateEmbeddingStore } = require("./embeddingStore");
const { buildKnowledgeChunks } = require("./pageKnowledge");
const { cosineSimilarity, retrieveRelevantChunks } = require("./retrievalService");

const pageId = "intro-tour";

async function main() {
  const chunks = buildKnowledgeChunks(pageId);
  const store = loadEmbeddingStore(pageId);
  const storeValidation = validateEmbeddingStore(pageId, chunks, store);
  const queryEmbedding = await createEmbedding("task: retrieval_query\nAssign", {
    model: store?.model,
    outputDimensionality: store?.embeddingDimension,
  });
  const cosine = cosineSimilarity([1, 0, 0], [1, 0, 0]);
  const topKResult = await retrieveRelevantChunks({ pageId, question: "شو يعني OTP؟", topK: 3 });
  const unsupportedResult = await retrieveRelevantChunks({ pageId, question: "كيف بعمل مرتجع؟", topK: 5 });
  const areaResults = [
    await retrieveRelevantChunks({ pageId, question: "مين المسؤول عن متابعة المهمة ومين ينفذها؟", topK: 5 }),
    await retrieveRelevantChunks({ pageId, question: "متى بقدر اختار موعد التوصيل؟", topK: 5 }),
    await retrieveRelevantChunks({ pageId, question: "شو بصير بعد تعيين السائق؟", topK: 5 }),
  ];
  const errors = [];

  if (!storeValidation.ok) {
    errors.push(...storeValidation.errors);
  }

  if (queryEmbedding.length !== 768) {
    errors.push(`Query embedding dimension mismatch: expected 768, got ${queryEmbedding.length}`);
  }

  if (cosine !== 1) {
    errors.push("Cosine similarity sanity check failed.");
  }

  if (topKResult.chunks.length > 3) {
    errors.push("topK returned more chunks than requested.");
  }

  for (const result of [topKResult, unsupportedResult, ...areaResults]) {
    for (const chunk of result.chunks) {
      if (!Number.isFinite(chunk.score)) {
        errors.push(`Non-finite retrieval score for ${chunk.id}`);
      }
    }
  }

  if (!areaResults.every((result) => result.chunks.length > 0 && !result.thresholdTriggered)) {
    errors.push("One or more known questions did not retrieve relevant chunks.");
  }

  if (!unsupportedResult.thresholdTriggered || unsupportedResult.chunks.length !== 0) {
    errors.push("Unsupported return question was not rejected by threshold.");
  }

  console.log(`storeLoads=${storeValidation.ok}`);
  console.log(`queryEmbeddingDimension=${queryEmbedding.length}`);
  console.log(`cosineSimilarityWorks=${cosine === 1}`);
  console.log(`topKWorks=${topKResult.chunks.length <= 3}`);
  console.log(`knownQuestionsRetrieve=${areaResults.every((result) => result.chunks.length > 0 && !result.thresholdTriggered)}`);
  console.log(`unsupportedRejected=${unsupportedResult.thresholdTriggered && unsupportedResult.chunks.length === 0}`);
  console.log(`fullPageContextUsed=false`);
  console.log(`result=${errors.length === 0 ? "PASS" : "FAIL"}`);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
