const { getEmbeddingModel, loadEnvFile } = require("./embeddingService");
const {
  GLOBAL_PAGE_ID,
  GLOBAL_STORE_PATH,
  buildGlobalKnowledgeChunks,
  createGlobalEmbeddingRecord,
  findReusableGlobalRecord,
  formatGlobalChunkForEmbedding,
  loadGlobalEmbeddingStore,
  saveGlobalEmbeddingStore,
} = require("./globalKnowledgeStore");
const { validateGlobalKnowledge } = require("./validateGlobalKnowledge");
const { globalKnowledgeItems } = require("./knowledge/globalKnowledge");

const EMBEDDING_DIMENSION = 768;
const DEFAULT_SUCCESS_DELAY_MS = 750;
const DEFAULT_MAX_429_RETRIES = 5;
const DEFAULT_INITIAL_429_BACKOFF_MS = 2000;

async function main() {
  loadEnvFile();

  const knowledgeValidation = validateGlobalKnowledge(globalKnowledgeItems, []);
  if (!knowledgeValidation.ok) {
    console.error(knowledgeValidation.errors.join("\n"));
    process.exitCode = 1;
    return;
  }

  const model = getEmbeddingModel();
  const chunks = buildGlobalKnowledgeChunks();
  const existingStore = loadGlobalEmbeddingStore();
  const expectedDimension = existingStore?.model === model ? Number(existingStore.embeddingDimension) || EMBEDDING_DIMENSION : EMBEDDING_DIMENSION;
  const recordsById = new Map();
  const failedChunks = [];
  const options = getBuildOptions();
  let generated = 0;
  let reused = 0;
  let retries = 0;

  for (const [index, chunk] of chunks.entries()) {
    const reusableRecord = findReusableGlobalRecord(existingStore, chunk, model, expectedDimension);

    if (reusableRecord) {
      recordsById.set(chunk.id, reusableRecord);
      reused += 1;
      console.log(`[${index + 1}/${chunks.length}] reused ${chunk.id}`);
    } else {
      try {
        const result = await createEmbeddingWithRateLimitRetry(formatGlobalChunkForEmbedding(chunk), {
          model,
          outputDimensionality: EMBEDDING_DIMENSION,
          chunkId: chunk.id,
          ...options,
        });
        retries += result.retries;
        recordsById.set(chunk.id, createGlobalEmbeddingRecord(chunk, result.embedding));
        generated += 1;
        saveProgress({ chunks, recordsById, model });
        console.log(`[${index + 1}/${chunks.length}] generated ${chunk.id}`);
        await delay(options.successDelayMs);
      } catch (error) {
        if (error.authFailure) {
          console.error(`[${index + 1}/${chunks.length}] auth failure ${chunk.id}: ${error.message}`);
          printSummary({ chunks: chunks.length, generated, reused, failed: chunks.length - recordsById.size, retries, dimension: EMBEDDING_DIMENSION, model });
          process.exitCode = 1;
          return;
        }

        failedChunks.push({ id: chunk.id, error: error.message });
        console.error(`[${index + 1}/${chunks.length}] failed ${chunk.id}: ${error.message}`);
      }
    }
  }

  saveProgress({ chunks, recordsById, model });

  if (failedChunks.length > 0) {
    printSummary({ chunks: chunks.length, generated, reused, failed: failedChunks.length, retries, dimension: EMBEDDING_DIMENSION, model });
    for (const failure of failedChunks) {
      console.error(`failedChunk=${failure.id}; error=${failure.error}`);
    }
    process.exitCode = 1;
    return;
  }

  printSummary({ chunks: chunks.length, generated, reused, failed: 0, retries, dimension: EMBEDDING_DIMENSION, model });
  console.log(`pageId=${GLOBAL_PAGE_ID}`);
  console.log(`store=${GLOBAL_STORE_PATH}`);
}

async function createEmbeddingWithRateLimitRetry(text, options) {
  let retryCount = 0;

  for (let attempt = 1; attempt <= options.max429Retries + 1; attempt += 1) {
    try {
      const embedding = await callGeminiEmbedding(text, options);
      return { embedding, retries: retryCount };
    } catch (error) {
      if (isAuthError(error)) {
        error.authFailure = true;
        throw error;
      }

      if (!isRateLimitError(error) || attempt > options.max429Retries) {
        throw error;
      }

      retryCount += 1;
      const waitMs = calculateBackoffMs(retryCount, options.initial429BackoffMs);
      console.warn(`429 received for ${options.chunkId} - retrying in ${Math.round(waitMs / 1000)}s (attempt ${retryCount}/${options.max429Retries})`);
      await delay(waitMs);
    }
  }

  throw new Error("Exceeded retry limit.");
}

async function callGeminiEmbedding(text, { model, outputDimensionality }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:batchEmbedContents`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": process.env.ai,
    },
    body: JSON.stringify({
      requests: [
        {
          model: `models/${model}`,
          content: { parts: [{ text }] },
          output_dimensionality: outputDimensionality,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Gemini embedding API failure: status=${response.status} ${response.statusText}; body=${limitLogText(errorText)}`);
    error.status = response.status;
    error.body = errorText;
    throw error;
  }

  const data = await response.json();
  const embedding = data?.embeddings?.[0]?.values;

  if (!Array.isArray(embedding)) {
    throw new Error("Malformed Gemini embedding response: missing embedding vector.");
  }

  if (embedding.length !== outputDimensionality || !embedding.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new Error(`Malformed Gemini embedding vector: expected dimension ${outputDimensionality}.`);
  }

  return embedding;
}

function saveProgress({ chunks, recordsById, model }) {
  const records = chunks.map((chunk) => recordsById.get(chunk.id)).filter(Boolean);
  saveGlobalEmbeddingStore({ model, embeddingDimension: EMBEDDING_DIMENSION, records });
}

function getBuildOptions() {
  return {
    max429Retries: readIntegerEnv("GLOBAL_EMBEDDING_MAX_429_RETRIES", DEFAULT_MAX_429_RETRIES),
    successDelayMs: readIntegerEnv("GLOBAL_EMBEDDING_SUCCESS_DELAY_MS", DEFAULT_SUCCESS_DELAY_MS),
    initial429BackoffMs: readIntegerEnv("GLOBAL_EMBEDDING_INITIAL_429_BACKOFF_MS", DEFAULT_INITIAL_429_BACKOFF_MS),
  };
}

function readIntegerEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function calculateBackoffMs(retryCount, initialBackoffMs) {
  const baseDelay = initialBackoffMs * 2 ** Math.max(0, retryCount - 1);
  const jitter = Math.floor(Math.random() * 250);
  return baseDelay + jitter;
}

function isRateLimitError(error) {
  return error?.status === 429 || /RESOURCE_EXHAUSTED|Too Many Requests|status=429/i.test(error?.message || "") || /RESOURCE_EXHAUSTED/i.test(error?.body || "");
}

function isAuthError(error) {
  return [401, 403].includes(error?.status) || /API_KEY_INVALID|PERMISSION_DENIED|Forbidden|Unauthorized|status=401|status=403/i.test(error?.message || "");
}

function limitLogText(text) {
  return String(text || "").replace(/\s+/g, " ").slice(0, 700);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printSummary({ chunks, generated, reused, failed, retries, dimension, model }) {
  console.log(`model=${model}`);
  console.log(`chunks=${chunks}`);
  console.log(`generated=${generated}`);
  console.log(`reused=${reused}`);
  console.log(`failed=${failed}`);
  console.log(`retries=${retries}`);
  console.log(`dimension=${dimension}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
