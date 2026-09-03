const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const STORE_DIR = path.join(ROOT, "data", "embeddings");

function getStorePath(pageId) {
  return path.join(STORE_DIR, `${pageId}.json`);
}

function buildContentHash(chunk) {
  return crypto
    .createHash("sha256")
    .update(stableStringify(normalizeHashInput(chunk)))
    .digest("hex");
}

function loadEmbeddingStore(pageId) {
  const storePath = getStorePath(pageId);

  if (!fs.existsSync(storePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(storePath, "utf8"));
}

function saveEmbeddingStore({ pageId, model, embeddingDimension, records }) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  const storePath = getStorePath(pageId);
  const payload = {
    pageId,
    model,
    generatedAt: new Date().toISOString(),
    embeddingDimension,
    records,
  };

  fs.writeFileSync(storePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return storePath;
}

function createEmbeddingRecord(chunk, embedding) {
  return {
    id: chunk.id,
    pageId: chunk.pageId,
    type: chunk.type,
    title: chunk.title,
    text: chunk.text,
    relatedTerms: Array.isArray(chunk.relatedTerms) ? chunk.relatedTerms : [],
    stageId: chunk.stageId || null,
    contentHash: buildContentHash(chunk),
    embedding,
  };
}

function findReusableRecord(store, chunk, model, expectedDimension = null) {
  if (!store || store.model !== model || store.pageId !== chunk.pageId) {
    return null;
  }

  const record = Array.isArray(store.records) ? store.records.find((item) => item.id === chunk.id) : null;

  if (!record || record.contentHash !== buildContentHash(chunk)) {
    return null;
  }

  if (!isValidEmbedding(record.embedding, expectedDimension)) {
    return null;
  }

  return record;
}

function validateEmbeddingStore(pageId, chunks, store) {
  const errors = [];

  if (!store) {
    return { ok: false, errors: ["Embedding store does not exist."], chunkCount: chunks.length, recordCount: 0, dimension: 0 };
  }

  if (store.pageId !== pageId) {
    errors.push(`Store pageId mismatch: expected ${pageId}, got ${store.pageId}`);
  }

  if (!store.model) {
    errors.push("Store model is missing.");
  }

  if (!Array.isArray(store.records)) {
    errors.push("Store records must be an array.");
  }

  const records = Array.isArray(store.records) ? store.records : [];
  const dimension = Number(store.embeddingDimension) || getEmbeddingDimension(records[0]?.embedding);

  if (!Number.isInteger(dimension) || dimension <= 0) {
    errors.push("Embedding dimension is missing or invalid.");
  }

  if (records.length !== chunks.length) {
    errors.push(`Record count mismatch: expected ${chunks.length}, got ${records.length}`);
  }

  const recordsById = new Map(records.map((record) => [record.id, record]));
  const seenIds = new Set();

  for (const record of records) {
    if (seenIds.has(record.id)) {
      errors.push(`Duplicate record id: ${record.id}`);
    }
    seenIds.add(record.id);
  }

  for (const chunk of chunks) {
    const record = recordsById.get(chunk.id);

    if (!record) {
      errors.push(`Missing embedding for chunk: ${chunk.id}`);
      continue;
    }

    if (record.pageId !== pageId) {
      errors.push(`Record pageId mismatch for ${chunk.id}`);
    }

    if (record.contentHash !== buildContentHash(chunk)) {
      errors.push(`Stale content hash for ${chunk.id}`);
    }

    if (!isValidEmbedding(record.embedding, dimension)) {
      errors.push(`Invalid embedding vector for ${chunk.id}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    chunkCount: chunks.length,
    recordCount: records.length,
    dimension,
  };
}

function getEmbeddingDimension(embedding) {
  return Array.isArray(embedding) ? embedding.length : 0;
}

function isValidEmbedding(embedding, expectedDimension = null) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    return false;
  }

  if (expectedDimension !== null && embedding.length !== expectedDimension) {
    return false;
  }

  return embedding.every((value) => typeof value === "number" && Number.isFinite(value));
}

function normalizeHashInput(chunk) {
  return {
    id: chunk.id,
    pageId: chunk.pageId,
    type: chunk.type,
    title: chunk.title,
    text: chunk.text,
    relatedTerms: [...(chunk.relatedTerms || [])].sort(),
    stageId: chunk.stageId || null,
  };
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

module.exports = {
  buildContentHash,
  createEmbeddingRecord,
  findReusableRecord,
  getStorePath,
  isValidEmbedding,
  loadEmbeddingStore,
  saveEmbeddingStore,
  validateEmbeddingStore,
};
