const { createEmbedding, getEmbeddingModel } = require("./embeddingService");
const { isValidEmbedding, loadEmbeddingStore, validateEmbeddingStore } = require("./embeddingStore");
const { GLOBAL_PAGE_ID, buildGlobalKnowledgeChunks, loadGlobalEmbeddingStore, validateGlobalEmbeddingStore } = require("./globalKnowledgeStore");
const { buildKnowledgeChunks, pageKnowledge } = require("./pageKnowledge");
const { calculateLexicalBoost, cosineSimilarity } = require("./retrievalService");
const { calculateNluRecordBoost, understandQuery } = require("./queryUnderstanding");

const DEFAULT_PAGE_TOP_K = 5;
const DEFAULT_GLOBAL_TOP_K = 5;
const DEFAULT_MERGED_TOP_K = 7;
const DEFAULT_MIN_SCORE = 0.72;
const DEFAULT_LEXICAL_FALLBACK_MIN_SCORE = 0.08;
const DEFAULT_PAGE_PRIORITY_BOOST = 0.045;
const DEFAULT_SERVICE_BOOST = 0.035;
const DEFAULT_GLOBAL_INTENT_BOOST = 0.09;

const DEFAULT_EMBEDDING_DIMENSION = 768;

const RETRIEVAL_MODE_SEMANTIC = "semantic";
const RETRIEVAL_MODE_LEXICAL_FALLBACK = "lexical_fallback";
const RETRIEVAL_MODE_PAGE_STORE_MISSING_FALLBACK = "page_store_missing_fallback";

async function retrieveHybridChunks({
  pageId,
  question,
  pageTopK = DEFAULT_PAGE_TOP_K,
  globalTopK = DEFAULT_GLOBAL_TOP_K,
  mergedTopK = DEFAULT_MERGED_TOP_K,
  minScore = DEFAULT_MIN_SCORE,
  lexicalFallbackMinScore = readNumberEnv("HYBRID_LEXICAL_FALLBACK_MIN_SCORE", DEFAULT_LEXICAL_FALLBACK_MIN_SCORE),
  pagePriorityBoost = readNumberEnv("HYBRID_PAGE_PRIORITY_BOOST", DEFAULT_PAGE_PRIORITY_BOOST),
  serviceBoost = readNumberEnv("HYBRID_SERVICE_BOOST", DEFAULT_SERVICE_BOOST),
  globalIntentBoost = readNumberEnv("HYBRID_GLOBAL_INTENT_BOOST", DEFAULT_GLOBAL_INTENT_BOOST),
  queryUnderstanding = null,
} = {}) {
  const understanding = queryUnderstanding || understandQuery(question);
  const retrievalQuery = understanding.retrievalQuery || question;

  // Document vectors are always read from the existing on-disk stores below —
  // Gemini is only ever called (and only may fail) for the query embedding further down.
  const pageStore = loadEmbeddingStore(pageId);
  const pageChunks = buildKnowledgeChunks(pageId);
  const currentWorkflow = pageKnowledge[pageId]?.currentWorkflow || [];

  // A missing page embedding store (e.g. still pending generation) is not the same as a
  // corrupt/stale one. pageKnowledge[pageId] is still a fully supported page, so this falls
  // back to lexical/structured ranking over the freshly built pageChunks instead of failing
  // the whole request the way a real validation error (stale hash, dimension mismatch, etc.) does.
  const pageStoreMissing = !pageStore;

  if (!pageStoreMissing) {
    const pageValidation = validateEmbeddingStore(pageId, pageChunks, pageStore);

    if (!pageValidation.ok) {
      throw new Error(`Page embedding store validation failed: ${pageValidation.errors.join("; ")}`);
    }
  }

  const globalStore = loadGlobalEmbeddingStore();
  const globalChunks = buildGlobalKnowledgeChunks();
  const referenceModel = pageStore?.model || globalStore?.model || getEmbeddingModel();
  const referenceDimension = Number(pageStore?.embeddingDimension) || Number(globalStore?.embeddingDimension) || DEFAULT_EMBEDDING_DIMENSION;
  const globalValidation = validateGlobalEmbeddingStore({
    chunks: globalChunks,
    store: globalStore,
    expectedModel: referenceModel,
    expectedDimension: referenceDimension,
  });

  if (!globalValidation.ok) {
    throw new Error(`Global embedding store validation failed: ${globalValidation.errors.join("; ")}`);
  }

  let queryEmbedding = null;
  let embeddingUnavailableReason = pageStoreMissing ? "page_store_missing" : null;

  if (!pageStoreMissing) {
    try {
      const candidateEmbedding = await createEmbedding(["task: retrieval_query", retrievalQuery].join("\n"), {
        model: referenceModel,
        outputDimensionality: referenceDimension,
      });

      if (!isValidEmbedding(candidateEmbedding, referenceDimension)) {
        embeddingUnavailableReason = "invalid_embedding";
      } else {
        queryEmbedding = candidateEmbedding;
      }
    } catch (error) {
      embeddingUnavailableReason = isGeminiRateLimitError(error) ? "rate_limited" : "embedding_error";
    }
  }

  const retrievalMode = queryEmbedding
    ? RETRIEVAL_MODE_SEMANTIC
    : pageStoreMissing
      ? RETRIEVAL_MODE_PAGE_STORE_MISSING_FALLBACK
      : RETRIEVAL_MODE_LEXICAL_FALLBACK;
  const effectiveMinScore = queryEmbedding ? minScore : lexicalFallbackMinScore;

  const mentionedServices = detectMentionedServices(retrievalQuery);
  const hasGlobalIntent = understanding.primaryIntent === "service_list" || detectGlobalIntent(retrievalQuery);
  const pageCandidates = rankRecords({
    records: pageStoreMissing ? pageChunks : pageStore.records,
    queryEmbedding,
    question: retrievalQuery,
    topK: pageTopK,
    sourceType: "page",
    sourceBoost: hasGlobalIntent ? 0 : pagePriorityBoost,
    serviceBoost: 0,
    mentionedServices,
    understanding,
    currentWorkflow,
  });
  const globalCandidates = rankRecords({
    records: globalStore.records,
    queryEmbedding,
    question: retrievalQuery,
    topK: globalTopK,
    sourceType: "global",
    sourceBoost: hasGlobalIntent ? globalIntentBoost : 0,
    serviceBoost,
    mentionedServices,
    understanding,
    currentWorkflow: [],
  });

  const chunks = mergeCandidates([...pageCandidates, ...globalCandidates], mergedTopK);
  const topScore = chunks[0]?.score || 0;

  return {
    chunks: topScore >= effectiveMinScore ? chunks : [],
    topScore,
    thresholdTriggered: topScore < effectiveMinScore,
    queryEmbeddingDimension: queryEmbedding?.length || 0,
    retrievalMode,
    embeddingUnavailableReason,
    pageStoreMissing,
    pageTopK,
    globalTopK,
    mergedTopK,
    minScore,
    lexicalFallbackMinScore,
    effectiveMinScore,
    pagePriorityBoost,
    serviceBoost,
    globalIntentBoost,
    hasGlobalIntent,
    mentionedServices,
    understanding,
  };
}

function buildHybridRetrievedContext(retrievedChunks) {
  return retrievedChunks
    .map((chunk) =>
      [
        `[Chunk: ${chunk.id}]`,
        `Source Type: ${chunk.sourceType}`,
        `Status: ${chunk.status}`,
        chunk.service?.length ? `Service: ${chunk.service.join(", ")}` : "",
        chunk.domain ? `Domain: ${chunk.domain}` : "",
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

function rankRecords({ records, queryEmbedding, question, topK, sourceType, sourceBoost, serviceBoost, mentionedServices, understanding, currentWorkflow }) {
  return records
    .map((record) => {
      const semanticScore = queryEmbedding ? cosineSimilarity(queryEmbedding, record.embedding) : 0;
      const lexicalBoost = calculateLexicalBoost(question, record);
      const matchedServices = sourceType === "global" ? getMatchedServices(record.service, mentionedServices) : [];
      const appliedServiceBoost = matchedServices.length > 0 ? serviceBoost : 0;
      const intentBoost = calculateIntentBoost(question, record, sourceType);
      const nluBoost = sourceType === "page" ? calculateNluRecordBoost({ record, understanding, currentWorkflow }) : 0;
      const score = semanticScore + lexicalBoost + sourceBoost + appliedServiceBoost + intentBoost + nluBoost;

      return {
        id: record.id,
        sourceType,
        status: sourceType === "page" ? "confirmed" : record.status,
        service: Array.isArray(record.service) ? record.service : [],
        domain: record.domain || (sourceType === "page" ? "current_page" : ""),
        title: record.title,
        type: record.type,
        text: record.text,
        stageId: record.stageId || null,
        relatedTerms: record.relatedTerms || [],
        score: roundScore(score),
        semanticScore: roundScore(semanticScore),
        lexicalBoost: roundScore(lexicalBoost),
        sourceBoost: roundScore(sourceBoost),
        serviceBoost: roundScore(appliedServiceBoost),
        intentBoost: roundScore(intentBoost),
        nluBoost: roundScore(nluBoost),
      };
    })
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function mergeCandidates(candidates, topK) {
  const byId = new Map();

  for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
    if (byId.has(candidate.id)) {
      continue;
    }

    byId.set(candidate.id, candidate);
  }

  return [...byId.values()].sort((a, b) => b.score - a.score).slice(0, topK);
}

function detectMentionedServices(question) {
  const normalized = normalizeText(question);
  const matches = [];

  for (const [service, terms] of Object.entries(SERVICE_TERMS)) {
    if (terms.some((term) => normalized.includes(normalizeText(term)))) {
      matches.push(service);
    }
  }

  return matches;
}

function detectGlobalIntent(question) {
  const normalized = normalizeText(question);
  return GLOBAL_INTENT_TERMS.some((term) => normalized.includes(normalizeText(term)));
}

function calculateIntentBoost(question, record, sourceType) {
  if (sourceType !== "global") {
    return 0;
  }

  if (detectServiceListIntent(question) && record.id === "global-after-sales:system-overview:overview-after-sales-001") {
    return 0.12;
  }

  if (detectBusinessRuleIntent(question) && ["business-rule", "business_rule"].includes(record.type)) {
    return 0.12;
  }

  if (detectKnownErrorIntent(question) && ["known-error", "known_error"].includes(record.type)) {
    return 0.12;
  }

  return 0;
}

function detectServiceListIntent(question) {
  const normalized = normalizeText(question);
  return SERVICE_LIST_TERMS.some((term) => normalized.includes(normalizeText(term)));
}

function detectBusinessRuleIntent(question) {
  const normalized = normalizeText(question);
  return BUSINESS_RULE_TERMS.some((term) => normalized.includes(normalizeText(term)));
}

function detectKnownErrorIntent(question) {
  const normalized = normalizeText(question);
  return KNOWN_ERROR_TERMS.some((term) => normalized.includes(normalizeText(term)));
}

function getMatchedServices(recordServices, mentionedServices) {
  const services = Array.isArray(recordServices) ? recordServices : [];
  return services.filter((service) => mentionedServices.includes(service));
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/[؟?]/g, "")
    .replace(/[،,.;:()[\]{}"'`~!@#$%^&*_+=\\/|-]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function readNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function isGeminiRateLimitError(error) {
  return error?.status === 429 || /RESOURCE_EXHAUSTED|Too Many Requests|status=429/i.test(error?.message || "");
}

function roundScore(score) {
  return Number(score.toFixed(6));
}

const SERVICE_TERMS = {
  delivery: ["خدمة التوصيل", "التوصيل", "Delivery"],
  installation: ["التركيب", "خدمة التركيب", "Installation"],
  measurement: ["رفع القياسات", "القياسات", "Measurement"],
  manufacturing: ["التصنيع", "خدمة التصنيع", "Manufacturing"],
  design: ["التصميم", "خدمة التصميم", "Design"],
  internal_transfer: ["التحويلات الداخلية", "التحويل الداخلي", "Internal Transfer"],
  maintenance: ["الصيانة الميدانية", "الصيانة", "Field Maintenance", "Maintenance"],
};

const GLOBAL_INTENT_TERMS = [
  "الخدمات الموجودة",
  "الخدمات عندنا",
  "الخدمات عنا",
  "خدمات موجودة",
  "كل الخدمات",
  "المشروع",
  "دور SAP",
  "دور Odoo",
  "SAP و Odoo",
  "ربط المنتج بالخدمة",
  "Product Service Mapping",
  "Product-Service Mapping",
  "No eligible Operational Team",
  "ZCF2",
];

const SERVICE_LIST_TERMS = [
  "الخدمات الموجودة",
  "الخدمات عندنا",
  "الخدمات عنا",
  "خدمات موجودة",
  "كل الخدمات",
];

const BUSINESS_RULE_TERMS = [
  "business rules",
  "business rule",
  "قواعد العمل",
  "قاعدة العمل",
  "أهم Business Rules",
];

const KNOWN_ERROR_TERMS = [
  "error",
  "message",
  "warning",
  "رسالة",
  "خطأ",
  "ايرور",
  "تنبيه",
];

module.exports = {
  DEFAULT_GLOBAL_TOP_K,
  DEFAULT_MERGED_TOP_K,
  DEFAULT_MIN_SCORE,
  DEFAULT_LEXICAL_FALLBACK_MIN_SCORE,
  DEFAULT_PAGE_PRIORITY_BOOST,
  DEFAULT_PAGE_TOP_K,
  DEFAULT_SERVICE_BOOST,
  RETRIEVAL_MODE_SEMANTIC,
  RETRIEVAL_MODE_LEXICAL_FALLBACK,
  RETRIEVAL_MODE_PAGE_STORE_MISSING_FALLBACK,
  buildHybridRetrievedContext,
  detectGlobalIntent,
  detectBusinessRuleIntent,
  detectKnownErrorIntent,
  detectMentionedServices,
  detectServiceListIntent,
  isGeminiRateLimitError,
  retrieveHybridChunks,
};
