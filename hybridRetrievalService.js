const { createEmbedding, getEmbeddingModel } = require("./embeddingService");
const { isValidEmbedding, loadEmbeddingStore, validateEmbeddingStore } = require("./embeddingStore");
const { GLOBAL_PAGE_ID, buildGlobalKnowledgeChunks, loadGlobalEmbeddingStore, validateGlobalEmbeddingStore } = require("./globalKnowledgeStore");
const { buildKnowledgeChunks } = require("./pageKnowledge");
const { calculateLexicalBoost, cosineSimilarity } = require("./retrievalService");

const DEFAULT_PAGE_TOP_K = 5;
const DEFAULT_GLOBAL_TOP_K = 5;
const DEFAULT_MERGED_TOP_K = 7;
const DEFAULT_MIN_SCORE = 0.72;
const DEFAULT_PAGE_PRIORITY_BOOST = 0.045;
const DEFAULT_SERVICE_BOOST = 0.035;
const DEFAULT_GLOBAL_INTENT_BOOST = 0.09;

async function retrieveHybridChunks({
  pageId,
  question,
  pageTopK = DEFAULT_PAGE_TOP_K,
  globalTopK = DEFAULT_GLOBAL_TOP_K,
  mergedTopK = DEFAULT_MERGED_TOP_K,
  minScore = DEFAULT_MIN_SCORE,
  pagePriorityBoost = readNumberEnv("HYBRID_PAGE_PRIORITY_BOOST", DEFAULT_PAGE_PRIORITY_BOOST),
  serviceBoost = readNumberEnv("HYBRID_SERVICE_BOOST", DEFAULT_SERVICE_BOOST),
  globalIntentBoost = readNumberEnv("HYBRID_GLOBAL_INTENT_BOOST", DEFAULT_GLOBAL_INTENT_BOOST),
} = {}) {
  const pageStore = loadEmbeddingStore(pageId);
  const pageChunks = buildKnowledgeChunks(pageId);
  const pageValidation = validateEmbeddingStore(pageId, pageChunks, pageStore);

  if (!pageValidation.ok) {
    throw new Error(`Page embedding store validation failed: ${pageValidation.errors.join("; ")}`);
  }

  const globalStore = loadGlobalEmbeddingStore();
  const globalChunks = buildGlobalKnowledgeChunks();
  const globalValidation = validateGlobalEmbeddingStore({
    chunks: globalChunks,
    store: globalStore,
    expectedModel: pageStore.model || getEmbeddingModel(),
    expectedDimension: Number(pageStore.embeddingDimension),
  });

  if (!globalValidation.ok) {
    throw new Error(`Global embedding store validation failed: ${globalValidation.errors.join("; ")}`);
  }

  const model = pageStore.model || getEmbeddingModel();
  const dimension = Number(pageStore.embeddingDimension);
  const queryEmbedding = await createEmbedding(["task: retrieval_query", question].join("\n"), {
    model,
    outputDimensionality: dimension,
  });

  if (!isValidEmbedding(queryEmbedding, dimension)) {
    throw new Error("Hybrid query embedding is invalid.");
  }

  const mentionedServices = detectMentionedServices(question);
  const hasGlobalIntent = detectGlobalIntent(question);
  const pageCandidates = rankRecords({
    records: pageStore.records,
    queryEmbedding,
    question,
    topK: pageTopK,
    sourceType: "page",
    sourceBoost: hasGlobalIntent ? 0 : pagePriorityBoost,
    serviceBoost: 0,
    mentionedServices,
  });
  const globalCandidates = rankRecords({
    records: globalStore.records,
    queryEmbedding,
    question,
    topK: globalTopK,
    sourceType: "global",
    sourceBoost: hasGlobalIntent ? globalIntentBoost : 0,
    serviceBoost,
    mentionedServices,
  });

  const chunks = mergeCandidates([...pageCandidates, ...globalCandidates], mergedTopK);
  const topScore = chunks[0]?.score || 0;

  return {
    chunks: topScore >= minScore ? chunks : [],
    topScore,
    thresholdTriggered: topScore < minScore,
    queryEmbeddingDimension: queryEmbedding.length,
    pageTopK,
    globalTopK,
    mergedTopK,
    minScore,
    pagePriorityBoost,
    serviceBoost,
    globalIntentBoost,
    hasGlobalIntent,
    mentionedServices,
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

function rankRecords({ records, queryEmbedding, question, topK, sourceType, sourceBoost, serviceBoost, mentionedServices }) {
  return records
    .map((record) => {
      const semanticScore = cosineSimilarity(queryEmbedding, record.embedding);
      const lexicalBoost = calculateLexicalBoost(question, record);
      const matchedServices = sourceType === "global" ? getMatchedServices(record.service, mentionedServices) : [];
      const appliedServiceBoost = matchedServices.length > 0 ? serviceBoost : 0;
      const intentBoost = calculateIntentBoost(question, record, sourceType);
      const score = semanticScore + lexicalBoost + sourceBoost + appliedServiceBoost + intentBoost;

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
  DEFAULT_PAGE_PRIORITY_BOOST,
  DEFAULT_PAGE_TOP_K,
  DEFAULT_SERVICE_BOOST,
  buildHybridRetrievedContext,
  detectGlobalIntent,
  detectBusinessRuleIntent,
  detectKnownErrorIntent,
  detectMentionedServices,
  detectServiceListIntent,
  retrieveHybridChunks,
};
