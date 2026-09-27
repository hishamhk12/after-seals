const { buildKnowledgeChunks, pageKnowledge } = require("./pageKnowledge");
const { createEmbeddingsForChunks, getEmbeddingModel, loadEnvFile } = require("./embeddingService");
const {
  createEmbeddingRecord,
  findReusableRecord,
  getStorePath,
  loadEmbeddingStore,
  saveEmbeddingStore,
  validateEmbeddingStore,
} = require("./embeddingStore");

// `node buildEmbeddings.js <pageId|all>` (or EMBEDDING_PAGE_ID=<pageId|all>) builds one page store
// (default intro-tour, as before) or every page in pageKnowledge.
async function main() {
  loadEnvFile();

  const requested = process.argv[2] || process.env.EMBEDDING_PAGE_ID || "intro-tour";
  const pageIds = requested === "all" ? Object.keys(pageKnowledge) : requested.split(",").map((id) => id.trim());
  const summaries = [];

  for (const pageId of pageIds) {
    if (!pageKnowledge[pageId]) {
      console.error(`Unknown pageId: ${pageId}`);
      process.exitCode = 1;
      continue;
    }

    const summary = await buildPageStore(pageId);
    summaries.push(summary);
    printSummary(summary);
    if (summary.failed > 0) process.exitCode = 1;
  }

  if (summaries.length > 1) {
    console.log("\npage | chunks | embeddings | generated | reused | failed | dimension");
    for (const s of summaries) {
      console.log(`${s.pageId} | ${s.chunks} | ${s.records} | ${s.generated} | ${s.reused} | ${s.failed} | ${s.dimension}`);
    }
  }
}

async function buildPageStore(pageId) {
  const model = getEmbeddingModel();
  const chunks = buildKnowledgeChunks(pageId);
  const existingStore = loadEmbeddingStore(pageId);
  const existingDimension = existingStore?.model === model ? Number(existingStore.embeddingDimension) || null : null;
  const reusableRecords = new Map();
  const chunksToGenerate = [];

  for (const chunk of chunks) {
    const reusableRecord = findReusableRecord(existingStore, chunk, model, existingDimension);

    if (reusableRecord) {
      // Content is unchanged; refresh the (non-hashed) metadata from the current chunk.
      reusableRecords.set(chunk.id, { ...reusableRecord, metadata: chunk.metadata || null });
    } else {
      chunksToGenerate.push(chunk);
    }
  }

  const generatedRecords = new Map();

  try {
    if (chunksToGenerate.length > 0) {
      const embeddings = await createEmbeddingsForChunks(chunksToGenerate, { model });

      chunksToGenerate.forEach((chunk, index) => {
        generatedRecords.set(chunk.id, createEmbeddingRecord(chunk, embeddings[index]));
      });
    }
  } catch (error) {
    console.error(error.message);
    return { pageId, chunks: chunks.length, records: 0, generated: 0, reused: reusableRecords.size, failed: chunksToGenerate.length, dimension: 0 };
  }

  const records = chunks.map((chunk) => generatedRecords.get(chunk.id) || reusableRecords.get(chunk.id));
  const embeddingDimension = records[0]?.embedding?.length || 0;
  const validation = validateEmbeddingStore(pageId, chunks, { pageId, model, embeddingDimension, records });

  if (!validation.ok) {
    console.error(validation.errors.join("\n"));
    return {
      pageId,
      chunks: chunks.length,
      records: 0,
      generated: generatedRecords.size,
      reused: reusableRecords.size,
      failed: validation.errors.length,
      dimension: validation.dimension,
    };
  }

  saveEmbeddingStore({ pageId, model, embeddingDimension, records });
  return {
    pageId,
    chunks: chunks.length,
    records: records.length,
    generated: generatedRecords.size,
    reused: reusableRecords.size,
    failed: 0,
    dimension: embeddingDimension,
    model,
    store: getStorePath(pageId),
  };
}

function printSummary({ pageId, chunks, generated, reused, failed, dimension, store }) {
  console.log(`pageId=${pageId}`);
  console.log(`chunks=${chunks}`);
  console.log(`generated=${generated}`);
  console.log(`reused=${reused}`);
  console.log(`failed=${failed}`);
  console.log(`dimension=${dimension}`);
  if (store) console.log(`store=${store}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
