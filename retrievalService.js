const { createEmbedding, getEmbeddingModel } = require("./embeddingService");
const { isValidEmbedding, loadEmbeddingStore, validateEmbeddingStore } = require("./embeddingStore");
const { buildKnowledgeChunks } = require("./pageKnowledge");

const DEFAULT_TOP_K = 5;
const DEFAULT_MIN_SCORE = 0.72;
const LEXICAL_BOOST_WEIGHT = 0.08;
const EXACT_TERM_BOOST = 0.035;

async function retrieveRelevantChunks({ pageId, question, topK = DEFAULT_TOP_K, minScore = DEFAULT_MIN_SCORE }) {
  const store = loadEmbeddingStore(pageId);
  const chunks = buildKnowledgeChunks(pageId);
  const storeValidation = validateEmbeddingStore(pageId, chunks, store);

  if (!storeValidation.ok) {
    throw new Error(`Embedding store validation failed: ${storeValidation.errors.join("; ")}`);
  }

  const model = store.model || getEmbeddingModel();
  const dimension = Number(store.embeddingDimension);
  const queryEmbedding = await createEmbedding(formatQueryForEmbedding(question), {
    model,
    outputDimensionality: dimension,
  });

  if (!isValidEmbedding(queryEmbedding, dimension)) {
    throw new Error("Query embedding is invalid.");
  }

  const ranked = store.records
    .map((record) => {
      const semanticScore = cosineSimilarity(queryEmbedding, record.embedding);
      const lexicalBoost = calculateLexicalBoost(question, record);
      const score = semanticScore + lexicalBoost;

      return {
        id: record.id,
        title: record.title,
        type: record.type,
        text: record.text,
        stageId: record.stageId || null,
        relatedTerms: record.relatedTerms || [],
        score: roundScore(score),
        semanticScore: roundScore(semanticScore),
        lexicalBoost: roundScore(lexicalBoost),
      };
    })
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const topScore = ranked[0]?.score || 0;
  const relevantChunks = topScore >= minScore ? ranked : [];

  return {
    chunks: relevantChunks,
    topScore,
    thresholdTriggered: topScore < minScore,
    queryEmbeddingDimension: queryEmbedding.length,
    topK,
    minScore,
  };
}

function buildRetrievedContext(retrievedChunks) {
  return retrievedChunks
    .map((chunk) =>
      [
        `[Chunk: ${chunk.id}]`,
        `Type: ${chunk.type}`,
        `Title: ${chunk.title}`,
        chunk.stageId ? `Stage ID: ${chunk.stageId}` : "",
        chunk.relatedTerms?.length ? `Related terms: ${chunk.relatedTerms.join(", ")}` : "",
        `Retrieval score: ${chunk.score}`,
        "Content:",
        chunk.text,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}

function cosineSimilarity(a, b) {
  if (!isValidEmbedding(a) || !isValidEmbedding(b) || a.length !== b.length) {
    throw new Error("Cannot calculate cosine similarity for invalid or mismatched vectors.");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (normA === 0 || normB === 0) {
    throw new Error("Cannot calculate cosine similarity for zero-length vector magnitude.");
  }

  const score = dot / (Math.sqrt(normA) * Math.sqrt(normB));

  if (!Number.isFinite(score)) {
    throw new Error("Cosine similarity produced a non-finite score.");
  }

  return score;
}

function calculateLexicalBoost(question, record) {
  const queryTokens = tokenize(question);

  if (queryTokens.length === 0) {
    return 0;
  }

  const recordText = normalizeText([record.title, record.text, ...(record.relatedTerms || [])].join(" "));
  const recordTokens = new Set(tokenize(recordText));
  const overlapCount = [...new Set(queryTokens)].filter((token) => recordTokens.has(token)).length;
  const overlapRatio = overlapCount / Math.max(new Set(queryTokens).size, 1);
  const exactTermCount = (record.relatedTerms || []).filter((term) => {
    const normalizedTerm = normalizeText(term);
    return normalizedTerm && normalizeText(question).includes(normalizedTerm);
  }).length;

  return Math.min(0.14, overlapRatio * LEXICAL_BOOST_WEIGHT + exactTermCount * EXACT_TERM_BOOST);
}

function formatQueryForEmbedding(question) {
  return ["task: retrieval_query", question].join("\n");
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/[؟?]/g, "")
    .replace(/[،,.;:()[\]{}"'`~!@#$%^&*_+=\\/|-]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function roundScore(score) {
  return Number(score.toFixed(6));
}

const STOP_WORDS = new Set([
  "في",
  "من",
  "عن",
  "على",
  "الى",
  "إلى",
  "حتى",
  "شو",
  "ما",
  "متى",
  "كيف",
  "هذا",
  "هذه",
  "هو",
  "هي",
  "و",
  "او",
  "أو",
  "the",
  "and",
  "or",
  "is",
]);

module.exports = {
  buildRetrievedContext,
  calculateLexicalBoost,
  cosineSimilarity,
  retrieveRelevantChunks,
};
