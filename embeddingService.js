const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-2";
const DEFAULT_OUTPUT_DIMENSIONALITY = 768;
const MAX_BATCH_SIZE = 8;
const MAX_RETRIES = 3;

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function getEmbeddingModel() {
  return process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
}

async function createEmbedding(text, options = {}) {
  const [embedding] = await createEmbeddings([text], options);
  return embedding;
}

async function createEmbeddings(texts, options = {}) {
  loadEnvFile();

  if (!process.env.ai) {
    throw new Error("Gemini API key is missing. Set process.env.ai in .env.");
  }

  const model = options.model || getEmbeddingModel();
  const outputDimensionality = Number(options.outputDimensionality || process.env.GEMINI_EMBEDDING_DIMENSION || DEFAULT_OUTPUT_DIMENSIONALITY);
  const embeddings = [];

  for (let index = 0; index < texts.length; index += MAX_BATCH_SIZE) {
    const batch = texts.slice(index, index + MAX_BATCH_SIZE);
    const batchEmbeddings = await callGeminiBatchEmbed(batch, { model, outputDimensionality });

    if (batchEmbeddings.length !== batch.length) {
      throw new Error(`Gemini returned ${batchEmbeddings.length} embeddings for ${batch.length} inputs.`);
    }

    embeddings.push(...batchEmbeddings);

    if (index + MAX_BATCH_SIZE < texts.length) {
      await delay(150);
    }
  }

  return embeddings;
}

async function createEmbeddingsForChunks(chunks, options = {}) {
  const texts = chunks.map(formatChunkForEmbedding);
  return createEmbeddings(texts, options);
}

function formatChunkForEmbedding(chunk) {
  return [
    "task: retrieval_document",
    `pageId: ${chunk.pageId}`,
    `type: ${chunk.type}`,
    `title: ${chunk.title}`,
    chunk.stageId ? `stageId: ${chunk.stageId}` : "",
    chunk.relatedTerms?.length ? `relatedTerms: ${chunk.relatedTerms.join(", ")}` : "",
    "",
    chunk.text,
  ]
    .filter(Boolean)
    .join("\n");
}

async function callGeminiBatchEmbed(texts, { model, outputDimensionality }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:batchEmbedContents`;
  const body = {
    requests: texts.map((text) => ({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      output_dimensionality: outputDimensionality,
    })),
  };

  const response = await fetchWithRetries(endpoint, body);
  const data = await response.json();
  const embeddings = data?.embeddings?.map((embedding) => embedding?.values);

  if (!Array.isArray(embeddings)) {
    throw new Error("Gemini embedding response is malformed: missing embeddings array.");
  }

  embeddings.forEach((embedding, index) => validateEmbedding(embedding, `batch item ${index + 1}`));
  return embeddings;
}

async function fetchWithRetries(endpoint, body) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.ai,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return response;
      }

      const errorText = await response.text();
      const message = `Gemini embedding API failure: status=${response.status} ${response.statusText}; body=${limitLogText(errorText)}`;

      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === MAX_RETRIES) {
        throw new Error(message);
      }

      lastError = new Error(message);
    } catch (error) {
      lastError = error;

      if (attempt === MAX_RETRIES) {
        break;
      }
    }

    await delay(500 * attempt);
  }

  throw lastError;
}

function validateEmbedding(embedding, label) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error(`Invalid embedding for ${label}: vector is empty or missing.`);
  }

  if (!embedding.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new Error(`Invalid embedding for ${label}: vector contains non-finite values.`);
  }
}

function limitLogText(text) {
  return String(text || "").replace(/\s+/g, " ").slice(0, 700);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  createEmbedding,
  createEmbeddings,
  createEmbeddingsForChunks,
  formatChunkForEmbedding,
  getEmbeddingModel,
  loadEnvFile,
};
