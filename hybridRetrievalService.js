const { createEmbedding, getEmbeddingModel } = require("./embeddingService");
const { isValidEmbedding, loadEmbeddingStore, validateEmbeddingStore } = require("./embeddingStore");
const { GLOBAL_PAGE_ID, buildGlobalKnowledgeChunks, loadGlobalEmbeddingStore, validateGlobalEmbeddingStore } = require("./globalKnowledgeStore");
const { buildKnowledgeChunks, pageKnowledge } = require("./pageKnowledge");
const { calculateLexicalBoost, cosineSimilarity } = require("./retrievalService");
const { calculateNluRecordBoost, understandQuery } = require("./queryUnderstanding");

const DEFAULT_PAGE_TOP_K = 5;
const DEFAULT_GLOBAL_TOP_K = 5;
const DEFAULT_RELATED_TOP_K = 3;
const DEFAULT_MERGED_TOP_K = 7;
const DEFAULT_GLOBAL_ASSISTANT_TOP_K = 10;
const DEFAULT_PER_SERVICE_TOP_K = 3;
const DEFAULT_MIN_SCORE = 0.72;
const DEFAULT_LEXICAL_FALLBACK_MIN_SCORE = 0.08;
const DEFAULT_PAGE_PRIORITY_BOOST = 0.045;
const DEFAULT_SERVICE_BOOST = 0.035;
const DEFAULT_GLOBAL_INTENT_BOOST = 0.09;
const DEFAULT_OFF_SERVICE_PENALTY = 0.05;

const DEFAULT_EMBEDDING_DIMENSION = 768;

const RETRIEVAL_MODE_SEMANTIC = "semantic";
const RETRIEVAL_MODE_LEXICAL_FALLBACK = "lexical_fallback";
const RETRIEVAL_MODE_PAGE_STORE_MISSING_FALLBACK = "page_store_missing_fallback";

// Page-aware retrieval for the assistant opened on a specific page:
//   1. the page's own knowledge (priority boost),
//   2. directly related pages, only when the question names their service,
//   3. global After-Sales knowledge, restricted to service-agnostic items and items tagged with the
//      page's own / related / explicitly mentioned services.
async function retrieveHybridChunks({
  pageId,
  question,
  pageTopK = DEFAULT_PAGE_TOP_K,
  globalTopK = DEFAULT_GLOBAL_TOP_K,
  relatedTopK = DEFAULT_RELATED_TOP_K,
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
  const knowledge = pageKnowledge[pageId];

  // Document vectors are always read from the existing on-disk stores below —
  // Gemini is only ever called (and only may fail) for the query embedding further down.
  const page = loadPageSource(pageId, { allowMissing: true });
  const currentWorkflow = knowledge?.currentWorkflow || [];
  const pageStoreMissing = page.storeMissing;

  const globalSource = loadGlobalSource(page.store);
  const referenceModel = page.store?.model || globalSource.store?.model || getEmbeddingModel();
  const referenceDimension = Number(page.store?.embeddingDimension) || Number(globalSource.store?.embeddingDimension) || DEFAULT_EMBEDDING_DIMENSION;

  const { queryEmbedding, embeddingUnavailableReason } = pageStoreMissing
    ? { queryEmbedding: null, embeddingUnavailableReason: "page_store_missing" }
    : await embedQuery(retrievalQuery, referenceModel, referenceDimension);

  const retrievalMode = queryEmbedding
    ? RETRIEVAL_MODE_SEMANTIC
    : pageStoreMissing
      ? RETRIEVAL_MODE_PAGE_STORE_MISSING_FALLBACK
      : RETRIEVAL_MODE_LEXICAL_FALLBACK;
  const effectiveMinScore = queryEmbedding ? minScore : lexicalFallbackMinScore;

  const mentionedServices = detectMentionedServices(retrievalQuery);
  const hasGlobalIntent = understanding.primaryIntent === "service_list" || detectGlobalIntent(retrievalQuery);
  const pageServices = getPageServices(pageId);
  const relatedServices = getRelatedServices(pageId);
  const allowedGlobalServices = new Set([...pageServices, ...mentionedServices]);

  const pageCandidates = rankRecords({
    records: page.records,
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

  const relatedCandidates = getRelatedPageIds(pageId)
    .filter((relatedId) => intersects(getPageServices(relatedId), mentionedServices))
    .flatMap((relatedId) => {
      const related = loadPageSource(relatedId, { allowMissing: true });
      if (related.storeMissing || !queryEmbedding) return [];
      return rankRecords({
        records: related.records,
        queryEmbedding,
        question: retrievalQuery,
        topK: relatedTopK,
        sourceType: "related",
        sourceBoost: 0,
        serviceBoost,
        mentionedServices,
        understanding,
        currentWorkflow: [],
      });
    });

  const globalCandidates = rankRecords({
    records: globalSource.records.filter((record) => {
      const services = Array.isArray(record.service) ? record.service : [];
      return isGlobalRecordAllowedOnPage({ record, services, pageServices, allowedGlobalServices, relatedServices, retrievalQuery });
    }),
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

  const chunks = mergeCandidates([...pageCandidates, ...relatedCandidates, ...globalCandidates], mergedTopK);
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

// Global After-Sales assistant: searches every page store plus the global store. No page gets
// priority; services named in the question are boosted, and when several services are named the
// result keeps the best chunks of each so cross-service questions see both sides.
async function retrieveGlobalAssistantChunks({
  question,
  topK = DEFAULT_GLOBAL_ASSISTANT_TOP_K,
  perServiceTopK = DEFAULT_PER_SERVICE_TOP_K,
  minScore = DEFAULT_MIN_SCORE,
  lexicalFallbackMinScore = readNumberEnv("HYBRID_LEXICAL_FALLBACK_MIN_SCORE", DEFAULT_LEXICAL_FALLBACK_MIN_SCORE),
  serviceBoost = readNumberEnv("HYBRID_SERVICE_BOOST", DEFAULT_SERVICE_BOOST),
  offServicePenalty = DEFAULT_OFF_SERVICE_PENALTY,
  queryUnderstanding = null,
} = {}) {
  const understanding = queryUnderstanding || understandQuery(question);
  const retrievalQuery = understanding.retrievalQuery || question;
  const pageSources = Object.keys(pageKnowledge).map((pageId) => loadPageSource(pageId, { allowMissing: false }));
  const globalSource = loadGlobalSource(pageSources[0]?.store);
  const referenceModel = globalSource.store?.model || getEmbeddingModel();
  const referenceDimension = Number(globalSource.store?.embeddingDimension) || DEFAULT_EMBEDDING_DIMENSION;
  const { queryEmbedding, embeddingUnavailableReason } = await embedQuery(retrievalQuery, referenceModel, referenceDimension);
  const effectiveMinScore = queryEmbedding ? minScore : lexicalFallbackMinScore;
  const mentionedServices = detectMentionedServices(retrievalQuery);

  const rankAll = (records, sourceType) =>
    rankRecords({
      records,
      queryEmbedding,
      question: retrievalQuery,
      topK: records.length,
      sourceType,
      sourceBoost: 0,
      serviceBoost,
      mentionedServices,
      understanding,
      currentWorkflow: [],
      offServicePenalty: mentionedServices.length > 0 ? offServicePenalty : 0,
    });

  const ranked = [
    ...pageSources.flatMap((source) => rankAll(source.records, "page")),
    ...rankAll(globalSource.records, "global"),
  ].sort((a, b) => b.score - a.score);

  const perService = mentionedServices.length > 1
    ? mentionedServices.flatMap((service) => ranked.filter((chunk) => chunk.service.includes(service)).slice(0, perServiceTopK))
    : [];
  const chunks = mergeCandidates([...perService, ...ranked.slice(0, topK)], topK + perService.length);
  const topScore = chunks[0]?.score || 0;

  return {
    chunks: topScore >= effectiveMinScore ? chunks : [],
    topScore,
    thresholdTriggered: topScore < effectiveMinScore,
    queryEmbeddingDimension: queryEmbedding?.length || 0,
    retrievalMode: queryEmbedding ? RETRIEVAL_MODE_SEMANTIC : RETRIEVAL_MODE_LEXICAL_FALLBACK,
    embeddingUnavailableReason,
    effectiveMinScore,
    mentionedServices,
    understanding,
  };
}

function loadPageSource(pageId, { allowMissing }) {
  const chunks = buildKnowledgeChunks(pageId);
  const store = loadEmbeddingStore(pageId);

  // A missing page embedding store (e.g. still pending generation) is not the same as a
  // corrupt/stale one. The page is still fully supported, so page mode falls back to
  // lexical/structured ranking over the freshly built chunks instead of failing the whole request
  // the way a real validation error (stale hash, dimension mismatch, etc.) does.
  if (!store) {
    if (!allowMissing) throw new Error(`Page embedding store is missing: ${pageId}`);
    return { pageId, store: null, storeMissing: true, records: chunks.map(withChunkServices) };
  }

  const validation = validateEmbeddingStore(pageId, chunks, store);
  if (!validation.ok) {
    throw new Error(`Page embedding store validation failed (${pageId}): ${validation.errors.join("; ")}`);
  }

  // Metadata is not part of the content hash, so always take it from the current chunks.
  const metadataById = new Map(chunks.map((chunk) => [chunk.id, chunk.metadata || null]));
  const records = store.records.map((record) => withChunkServices({ ...record, metadata: metadataById.get(record.id) || null }));
  return { pageId, store, storeMissing: false, records };
}

function loadGlobalSource(referenceStore) {
  const store = loadGlobalEmbeddingStore();
  const chunks = buildGlobalKnowledgeChunks();
  const validation = validateGlobalEmbeddingStore({
    chunks,
    store,
    expectedModel: referenceStore?.model || store?.model || getEmbeddingModel(),
    expectedDimension: Number(referenceStore?.embeddingDimension) || Number(store?.embeddingDimension) || DEFAULT_EMBEDDING_DIMENSION,
  });

  if (!validation.ok) {
    throw new Error(`Global embedding store validation failed: ${validation.errors.join("; ")}`);
  }

  return { store, records: store.records };
}

function withChunkServices(record) {
  return { ...record, service: record.metadata?.services || record.service || [] };
}

async function embedQuery(retrievalQuery, model, dimension) {
  try {
    const candidateEmbedding = await createEmbedding(["task: retrieval_query", retrievalQuery].join("\n"), {
      model,
      outputDimensionality: dimension,
    });

    return isValidEmbedding(candidateEmbedding, dimension)
      ? { queryEmbedding: candidateEmbedding, embeddingUnavailableReason: null }
      : { queryEmbedding: null, embeddingUnavailableReason: "invalid_embedding" };
  } catch (error) {
    return { queryEmbedding: null, embeddingUnavailableReason: isGeminiRateLimitError(error) ? "rate_limited" : "embedding_error" };
  }
}

function getPageServices(pageId) {
  const knowledge = pageKnowledge[pageId];
  return knowledge?.services || buildKnowledgeChunks(pageId)[0]?.metadata?.services || [];
}

// Service-tagged global items are allowed on a page when they belong to the page's own service or
// to a service the question names (a system code from the question, e.g. J504, counts as naming it).
// Items of a documented related service are allowed too, except workflow/stage descriptions: a
// generic question must never pull another service's stages into the answer.
function isGlobalRecordAllowedOnPage({ record, services, pageServices, allowedGlobalServices, relatedServices, retrievalQuery }) {
  if (pageServices.length === 0 || services.length === 0) return true;
  if (services.some((service) => allowedGlobalServices.has(service))) return true;
  if (record.type !== "workflow" && services.some((service) => relatedServices.includes(service))) return true;
  return calculateCodeBoost(retrievalQuery, record) > 0;
}

function getRelatedServices(pageId) {
  const knowledge = pageKnowledge[pageId];
  if (knowledge?.relatedServices) return knowledge.relatedServices;
  return LEGACY_RELATED[pageId]?.relatedServices || [];
}

function getRelatedPageIds(pageId) {
  const knowledge = pageKnowledge[pageId];
  if (knowledge?.relatedPages) return knowledge.relatedPages.filter((id) => pageKnowledge[id]);
  return (LEGACY_RELATED[pageId]?.relatedPages || []).filter((id) => pageKnowledge[id]);
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
        chunk.metadata?.page ? `Page: ${chunk.metadata.page} (${chunk.metadata.page_title})` : "",
        chunk.metadata?.stage_number ? `Stage: ${chunk.metadata.stage_number} — ${chunk.metadata.stage_title}` : "",
        chunk.metadata?.responsibility ? `Execution / responsibility: ${chunk.metadata.responsibility}` : "",
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

function rankRecords({
  records,
  queryEmbedding,
  question,
  topK,
  sourceType,
  sourceBoost,
  serviceBoost,
  mentionedServices,
  understanding,
  currentWorkflow,
  offServicePenalty = 0,
}) {
  return records
    .map((record) => {
      const semanticScore = queryEmbedding ? cosineSimilarity(queryEmbedding, record.embedding) : 0;
      const lexicalBoost = calculateLexicalBoost(question, record);
      const codeBoost = calculateCodeBoost(question, record);
      const recordServices = Array.isArray(record.service) ? record.service : [];
      const matchedServices = sourceType === "page" && serviceBoost === 0 ? [] : getMatchedServices(recordServices, mentionedServices);
      const appliedServiceBoost = matchedServices.length > 0 ? serviceBoost : 0;
      const appliedPenalty = offServicePenalty && recordServices.length > 0 && matchedServices.length === 0 ? offServicePenalty : 0;
      const intentBoost = calculateIntentBoost(question, record, sourceType);
      const nluBoost = sourceType === "page" ? calculateNluRecordBoost({ record, understanding, currentWorkflow }) : 0;
      const score = semanticScore + lexicalBoost + codeBoost + sourceBoost + appliedServiceBoost + intentBoost + nluBoost - appliedPenalty;

      return {
        id: record.id,
        sourceType,
        status: sourceType === "global" ? record.status : "confirmed",
        service: recordServices,
        domain: record.domain || (sourceType === "global" ? "" : "current_page"),
        title: record.title,
        type: record.type,
        text: record.text,
        stageId: record.stageId || null,
        metadata: record.metadata || null,
        relatedTerms: record.relatedTerms || [],
        score: roundScore(score),
        semanticScore: roundScore(semanticScore),
        lexicalBoost: roundScore(lexicalBoost),
        codeBoost: roundScore(codeBoost),
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

// System codes (billing types such as ZRE/ZCF2, warehouse codes such as R574/J521, invoice numbers)
// are unambiguous: a code named in the question that also appears in a chunk is strong evidence.
const CODE_TOKEN_PATTERN = /[A-Z]{1,5}[0-9]*[A-Z0-9/]*/g;
const CODE_BOOST_PER_MATCH = 0.03;
const MAX_CODE_BOOST = 0.06;

function calculateCodeBoost(question, record) {
  const codes = [...new Set(String(question || "").match(CODE_TOKEN_PATTERN) || [])].filter(
    (code) => code.length >= 3 && /[A-Z]/.test(code) && (/[0-9]/.test(code) || code.length <= 5) && !COMMON_ENGLISH_WORDS.has(code),
  );
  if (codes.length === 0) return 0;

  const recordText = [record.title, record.text, ...(record.relatedTerms || [])].join(" ");
  const matches = codes.filter((code) => new RegExp(`(^|[^A-Za-z0-9])${code.replace(/[/]/g, "\/")}(?=$|[^A-Za-z0-9])`).test(recordText)).length;
  return Math.min(MAX_CODE_BOOST, matches * CODE_BOOST_PER_MATCH);
}

// Upper-case words that are ordinary product terms rather than system codes.
const COMMON_ENGLISH_WORDS = new Set(["SAP", "OTP", "SLA", "UAT", "ERP", "API", "PDF", "KPI", "KPIS"]);

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

function intersects(a, b) {
  return a.some((item) => b.includes(item));
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/[؟?]/g, "")
    .replace(/[،,.;:()[\]{}"'`~!@#$%^&*_+=\\/|-]/g, " ")
    .replace(/[أإآ]/g, "ا")
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

// Related services / pages for the hand-written Delivery page (structured pages carry their own).
const LEGACY_RELATED = {
  "intro-tour": { relatedServices: ["internal_transfer", "installation"], relatedPages: ["internal-transfer-delivery-link", "delivery-returns"] },
};

const SERVICE_TERMS = {
  delivery: ["خدمة التوصيل", "التوصيل", "Delivery"],
  installation: ["التركيب", "خدمة التركيب", "Installation"],
  measurement: ["رفع القياسات", "القياسات", "قياسات", "رفع المقاسات", "المقاسات", "مقاسات", "Measurement"],
  manufacturing: ["التصنيع", "خدمة التصنيع", "Manufacturing"],
  design: ["التصميم", "خدمة التصميم", "Design"],
  internal_transfer: ["التحويلات الداخلية", "التحويل الداخلي", "النقل الداخلي", "Internal Transfer"],
  maintenance: ["الصيانة الميدانية", "الصيانة", "Field Maintenance", "Maintenance"],
  warehouse_pickup: ["الاستلام من المستودع", "استلام العميل البضاعة", "استلام البضاعة من المستودع", "يستلم من المستودع", "Warehouse Pickup"],
  customer_service: ["خدمة العملاء", "الشكاوى", "شكوى", "الاستفسارات", "Customer Service"],
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
  GLOBAL_PAGE_ID,
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
  retrieveGlobalAssistantChunks,
  retrieveHybridChunks,
};
