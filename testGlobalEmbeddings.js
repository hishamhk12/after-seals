const { createEmbedding, getEmbeddingModel } = require("./embeddingService");
const { GLOBAL_PAGE_ID, formatGlobalChunkForEmbedding, loadGlobalEmbeddingStore } = require("./globalKnowledgeStore");

const TEST_QUERIES = [
  "شو دور SAP و Odoo؟",
  "شو الفرق بين Delivery Only و Delivery + Installation؟",
  "شو يعني تكملة لاحقًا؟",
  "ليش Product-Service Mapping مهم؟",
  "شو مشكلة No eligible Operational Team؟",
  "شو هو ZCF2؟",
];

async function main() {
  const store = loadGlobalEmbeddingStore();

  if (!store || !Array.isArray(store.records)) {
    throw new Error("Global embedding store is missing or invalid. Run npm run global-embeddings:build first.");
  }

  console.log(`pageId=${GLOBAL_PAGE_ID}`);
  console.log(`model=${store.model}`);
  console.log(`dimension=${store.embeddingDimension}`);

  for (const query of TEST_QUERIES) {
    const queryEmbedding = await createEmbedding(["task: retrieval_query", query].join("\n"), {
      model: getEmbeddingModel(),
      outputDimensionality: store.embeddingDimension,
    });

    const ranked = store.records
      .map((record) => ({
        id: record.id,
        title: record.title,
        status: record.status,
        service: record.service,
        score: roundScore(cosineSimilarity(queryEmbedding, record.embedding)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log("");
    console.log(`query=${query}`);
    for (const result of ranked) {
      console.log(
        `- id=${result.id}; score=${result.score}; title=${result.title}; status=${result.status}; service=${result.service.length ? result.service.join(",") : "global"}`,
      );
    }
  }
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function roundScore(value) {
  return Number(value.toFixed(6));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
