// Embeds the active PowerPoint chunks with the project's embedding model (gemini-embedding-2, 768).
// Records whose chunk content hash is unchanged are reused; only new / changed chunks are sent to
// Gemini, and records of chunks that are no longer active are pruned.
//   node buildPowerPointEmbeddings.js --dry-run   print the plan, no API calls
const { createEmbeddings, getEmbeddingModel, loadEnvFile } = require("./embeddingService");
const { loadGlobalEmbeddingStore } = require("./globalKnowledgeStore");
const {
  POWERPOINT_STORE_PATH,
  buildPowerPointChunks,
  createPowerPointEmbeddingRecord,
  formatPowerPointChunkForEmbedding,
  getPowerPointAnalysis,
  loadPowerPointEmbeddingStore,
  savePowerPointEmbeddingStore,
} = require("./powerpointKnowledge");

const EMBEDDING_DIMENSION = 768;

async function main() {
  loadEnvFile();
  const dryRun = process.argv.includes("--dry-run");
  const { extraction } = getPowerPointAnalysis();
  if (!extraction) throw new Error("No PowerPoint extraction found. Run: node buildPowerPointKnowledge.js");

  // Same model as the existing stores, so PowerPoint vectors are comparable with page / global ones.
  const model = loadGlobalEmbeddingStore()?.model || getEmbeddingModel();
  const chunks = buildPowerPointChunks();
  const store = loadPowerPointEmbeddingStore();
  const storeCompatible = store && store.model === model && Number(store.embeddingDimension) === EMBEDDING_DIMENSION;
  const existing = new Map(storeCompatible ? store.records.map((record) => [record.id, record]) : []);

  const reused = [];
  const pending = [];
  for (const chunk of chunks) {
    const record = existing.get(chunk.id);
    if (record && record.contentHash === chunk.contentHash && record.embedding?.length === EMBEDDING_DIMENSION) {
      reused.push({ ...record, slideNumber: chunk.metadata.slide_number });
    } else {
      pending.push(chunk);
    }
  }
  const pruned = [...existing.keys()].filter((id) => !chunks.some((chunk) => chunk.id === id));

  console.log(`model=${model}`);
  console.log(`dimension=${EMBEDDING_DIMENSION}`);
  console.log(`chunks=${chunks.length}; reuse=${reused.length}; toEmbed=${pending.length}; prune=${pruned.length}`);
  for (const chunk of pending) console.log(`  embed ${chunk.id}`);
  for (const id of pruned) console.log(`  prune ${id}`);

  if (dryRun) {
    console.log("dryRun=true (no API calls)");
    return;
  }

  const generated = [];
  if (pending.length > 0) {
    const vectors = await createEmbeddings(pending.map(formatPowerPointChunkForEmbedding), { model, outputDimensionality: EMBEDDING_DIMENSION });
    pending.forEach((chunk, index) => generated.push(createPowerPointEmbeddingRecord(chunk, vectors[index])));
  }

  const byId = new Map([...reused, ...generated].map((record) => [record.id, record]));
  savePowerPointEmbeddingStore({
    model,
    embeddingDimension: EMBEDDING_DIMENSION,
    sourceFile: extraction.sourceFile,
    sourceFileHash: extraction.fileHash,
    records: chunks.map((chunk) => byId.get(chunk.id)),
  });
  console.log(`generated=${generated.length}; reused=${reused.length}; pruned=${pruned.length}`);
  console.log(`store=${POWERPOINT_STORE_PATH}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
