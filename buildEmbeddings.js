const { buildKnowledgeChunks } = require("./pageKnowledge");
const { createEmbeddingsForChunks, getEmbeddingModel, loadEnvFile } = require("./embeddingService");
const {
  createEmbeddingRecord,
  findReusableRecord,
  getStorePath,
  loadEmbeddingStore,
  saveEmbeddingStore,
  validateEmbeddingStore,
} = require("./embeddingStore");

async function main() {
  loadEnvFile();

  const pageId = process.env.EMBEDDING_PAGE_ID || "intro-tour";
  const model = getEmbeddingModel();
  const chunks = buildKnowledgeChunks(pageId);
  const existingStore = loadEmbeddingStore(pageId);
  const existingDimension = existingStore?.model === model ? Number(existingStore.embeddingDimension) || null : null;
  const reusableRecords = new Map();
  const chunksToGenerate = [];

  for (const chunk of chunks) {
    const reusableRecord = findReusableRecord(existingStore, chunk, model, existingDimension);

    if (reusableRecord) {
      reusableRecords.set(chunk.id, reusableRecord);
    } else {
      chunksToGenerate.push(chunk);
    }
  }

  let failed = 0;
  const generatedRecords = new Map();

  try {
    if (chunksToGenerate.length > 0) {
      const embeddings = await createEmbeddingsForChunks(chunksToGenerate, { model });

      chunksToGenerate.forEach((chunk, index) => {
        generatedRecords.set(chunk.id, createEmbeddingRecord(chunk, embeddings[index]));
      });
    }
  } catch (error) {
    failed = chunksToGenerate.length;
    console.error(error.message);
  }

  if (failed > 0) {
    printSummary({ pageId, chunks: chunks.length, generated: generatedRecords.size, reused: reusableRecords.size, failed, dimension: 0 });
    process.exitCode = 1;
    return;
  }

  const records = chunks.map((chunk) => generatedRecords.get(chunk.id) || reusableRecords.get(chunk.id));
  const embeddingDimension = records[0]?.embedding?.length || 0;
  const candidateStore = { pageId, model, embeddingDimension, records };
  const validation = validateEmbeddingStore(pageId, chunks, candidateStore);

  if (!validation.ok) {
    console.error(validation.errors.join("\n"));
    printSummary({
      pageId,
      chunks: chunks.length,
      generated: generatedRecords.size,
      reused: reusableRecords.size,
      failed: validation.errors.length,
      dimension: validation.dimension,
    });
    process.exitCode = 1;
    return;
  }

  saveEmbeddingStore({ pageId, model, embeddingDimension, records });
  printSummary({
    pageId,
    chunks: chunks.length,
    generated: generatedRecords.size,
    reused: reusableRecords.size,
    failed: 0,
    dimension: embeddingDimension,
  });
  console.log(`store=${getStorePath(pageId)}`);
}

function printSummary({ pageId, chunks, generated, reused, failed, dimension }) {
  console.log(`pageId=${pageId}`);
  console.log(`chunks=${chunks}`);
  console.log(`generated=${generated}`);
  console.log(`reused=${reused}`);
  console.log(`failed=${failed}`);
  console.log(`dimension=${dimension}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
