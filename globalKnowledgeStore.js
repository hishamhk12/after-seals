const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { globalKnowledgeItems } = require("./knowledge/globalKnowledge");

const GLOBAL_PAGE_ID = "global-after-sales";
const GLOBAL_STORE_PATH = path.join(__dirname, "data", "embeddings", `${GLOBAL_PAGE_ID}.json`);

function getGlobalKnowledgeItems() {
  return globalKnowledgeItems.map((item) => ({
    ...item,
    service: normalizeService(item.service),
    relatedTerms: [...(item.relatedTerms || [])],
  }));
}

function buildGlobalKnowledgeChunks() {
  return getGlobalKnowledgeItems().map((item) => ({
    id: buildChunkId(item),
    itemId: item.id,
    pageId: GLOBAL_PAGE_ID,
    title: item.title,
    text: item.text,
    type: item.type,
    status: item.status,
    service: item.service,
    domain: item.domain,
    relatedTerms: item.relatedTerms,
    source: item.source,
  }));
}

function formatGlobalChunkForEmbedding(chunk) {
  return [
    "task: retrieval_document",
    `Collection: ${GLOBAL_PAGE_ID}`,
    `Title: ${chunk.title}`,
    `Type: ${chunk.type}`,
    `Status: ${chunk.status}`,
    chunk.service.length ? `Service: ${chunk.service.join(", ")}` : "Service: global",
    `Domain: ${chunk.domain}`,
    `Source: ${chunk.source}`,
    `Text: ${chunk.text}`,
    chunk.relatedTerms.length ? `Related terms: ${chunk.relatedTerms.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildGlobalContentHash(chunk) {
  return crypto.createHash("sha256").update(stableStringify(normalizeHashInput(chunk))).digest("hex");
}

function createGlobalEmbeddingRecord(chunk, embedding) {
  return {
    id: chunk.id,
    itemId: chunk.itemId,
    pageId: chunk.pageId,
    type: chunk.type,
    status: chunk.status,
    service: chunk.service,
    domain: chunk.domain,
    title: chunk.title,
    text: chunk.text,
    relatedTerms: chunk.relatedTerms,
    source: chunk.source,
    contentHash: buildGlobalContentHash(chunk),
    embedding,
  };
}

function loadGlobalEmbeddingStore() {
  if (!fs.existsSync(GLOBAL_STORE_PATH)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(GLOBAL_STORE_PATH, "utf8"));
}

function saveGlobalEmbeddingStore({ model, embeddingDimension, records }) {
  fs.mkdirSync(path.dirname(GLOBAL_STORE_PATH), { recursive: true });

  const payload = {
    pageId: GLOBAL_PAGE_ID,
    model,
    generatedAt: new Date().toISOString(),
    embeddingDimension,
    records,
  };

  fs.writeFileSync(GLOBAL_STORE_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return GLOBAL_STORE_PATH;
}

function findReusableGlobalRecord(store, chunk, model, expectedDimension) {
  if (!store || store.pageId !== GLOBAL_PAGE_ID || store.model !== model) {
    return null;
  }

  const record = Array.isArray(store.records) ? store.records.find((item) => item.id === chunk.id) : null;

  if (!record || record.contentHash !== buildGlobalContentHash(chunk)) {
    return null;
  }

  if (!isValidEmbedding(record.embedding, expectedDimension)) {
    return null;
  }

  return record;
}

function validateGlobalEmbeddingStore({ chunks = buildGlobalKnowledgeChunks(), store = loadGlobalEmbeddingStore(), expectedModel, expectedDimension = 768 }) {
  const errors = [];

  if (!store) {
    return { ok: false, errors: ["Global embedding store does not exist."], chunkCount: chunks.length, recordCount: 0 };
  }

  if (store.pageId !== GLOBAL_PAGE_ID) {
    errors.push(`Store pageId mismatch: expected ${GLOBAL_PAGE_ID}, got ${store.pageId}`);
  }

  if (expectedModel && store.model !== expectedModel) {
    errors.push(`Store model mismatch: expected ${expectedModel}, got ${store.model}`);
  }

  if (Number(store.embeddingDimension) !== expectedDimension) {
    errors.push(`Store dimension mismatch: expected ${expectedDimension}, got ${store.embeddingDimension}`);
  }

  const records = Array.isArray(store.records) ? store.records : [];
  if (!Array.isArray(store.records)) {
    errors.push("Store records must be an array.");
  }

  if (records.length !== chunks.length) {
    errors.push(`Record count mismatch: expected ${chunks.length}, got ${records.length}`);
  }

  const chunkIds = new Set();
  for (const chunk of chunks) {
    if (chunkIds.has(chunk.id)) {
      errors.push(`Duplicate chunk id: ${chunk.id}`);
    }
    chunkIds.add(chunk.id);
  }

  const recordsById = new Map();
  for (const record of records) {
    if (recordsById.has(record.id)) {
      errors.push(`Duplicate record id: ${record.id}`);
    }
    recordsById.set(record.id, record);
  }

  for (const chunk of chunks) {
    const record = recordsById.get(chunk.id);
    if (!record) {
      errors.push(`Missing embedding for chunk: ${chunk.id}`);
      continue;
    }

    if (record.contentHash !== buildGlobalContentHash(chunk)) {
      errors.push(`Stale content hash for chunk: ${chunk.id}`);
    }

    if (!isValidEmbedding(record.embedding, expectedDimension)) {
      errors.push(`Malformed embedding vector for chunk: ${chunk.id}`);
    }

    for (const field of ["type", "status", "domain", "source", "title", "text"]) {
      if (record[field] !== chunk[field]) {
        errors.push(`Metadata mismatch for ${chunk.id}: ${field}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    chunkCount: chunks.length,
    recordCount: records.length,
    dimension: Number(store.embeddingDimension) || 0,
    model: store.model || "",
  };
}

function buildChunkId(item) {
  return `${GLOBAL_PAGE_ID}:${slugify(item.type)}:${item.id}`;
}

function normalizeService(service) {
  if (Array.isArray(service)) {
    return service.filter(Boolean);
  }

  return service ? [service] : [];
}

function normalizeHashInput(chunk) {
  return {
    id: chunk.id,
    itemId: chunk.itemId,
    pageId: chunk.pageId,
    title: chunk.title,
    text: chunk.text,
    type: chunk.type,
    status: chunk.status,
    service: [...chunk.service].sort(),
    domain: chunk.domain,
    relatedTerms: [...chunk.relatedTerms].sort(),
    source: chunk.source,
  };
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

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = {
  GLOBAL_PAGE_ID,
  GLOBAL_STORE_PATH,
  buildGlobalContentHash,
  buildGlobalKnowledgeChunks,
  createGlobalEmbeddingRecord,
  findReusableGlobalRecord,
  formatGlobalChunkForEmbedding,
  getGlobalKnowledgeItems,
  loadGlobalEmbeddingStore,
  saveGlobalEmbeddingStore,
  validateGlobalEmbeddingStore,
};
