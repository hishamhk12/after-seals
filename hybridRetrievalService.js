const { createEmbedding, getEmbeddingModel } = require("./embeddingService");
const { buildContentHash, isValidEmbedding, loadEmbeddingStore, validateEmbeddingStore } = require("./embeddingStore");
const { GLOBAL_PAGE_ID, buildGlobalContentHash, buildGlobalKnowledgeChunks, loadGlobalEmbeddingStore, validateGlobalEmbeddingStore } = require("./globalKnowledgeStore");
const { buildKnowledgeChunks, pageKnowledge } = require("./pageKnowledge");
const { loadPowerPointRecords } = require("./powerpointKnowledge");
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
// Applied instead when the focus came from the open page rather than from the question. A question
// naming two services is meant to cross them, so its penalty stays light; a question naming none is
// about the service in front of the reader, and "مرحلة ملئ النموذج" has to resolve to that service
// rather than to the identically named stage of six others.
const DEFAULT_PAGE_CONTEXT_OFF_SERVICE_PENALTY = 0.2;
const DEFAULT_POWERPOINT_TOP_K = 3;
// PowerPoint chunks are a secondary source: on equal relevance the website chunk ranks first.
const DEFAULT_POWERPOINT_PENALTY = 0.02;

const DEFAULT_EMBEDDING_DIMENSION = 768;

const RETRIEVAL_MODE_SEMANTIC = "semantic";
const RETRIEVAL_MODE_LEXICAL_FALLBACK = "lexical_fallback";
const RETRIEVAL_MODE_PAGE_STORE_MISSING_FALLBACK = "page_store_missing_fallback";

// Page-aware retrieval for the assistant opened on a specific page:
//   1. the page's own knowledge (priority boost),
//   2. directly related pages, only when the question names their service,
//   3. supplemental PowerPoint chunks mapped to the same page (and to a related page only when the
//      question names its service; project-level slides only for project-wide questions),
//   4. global After-Sales knowledge, restricted to service-agnostic items and items tagged with the
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
  powerpointTopK = DEFAULT_POWERPOINT_TOP_K,
  powerpointPenalty = readNumberEnv("HYBRID_POWERPOINT_PENALTY", DEFAULT_POWERPOINT_PENALTY),
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

  const powerpoint = loadPowerPointSource(queryEmbedding, referenceModel, referenceDimension);
  const mentionedRelatedPages = getRelatedPageIds(pageId).filter((relatedId) => intersects(getPageServices(relatedId), mentionedServices));
  const powerpointCandidates = rankRecords({
    records: powerpoint.records.filter((record) => isPowerPointRecordAllowedOnPage({ record, pageId, mentionedRelatedPages, hasGlobalIntent })),
    queryEmbedding,
    question: retrievalQuery,
    topK: powerpointTopK,
    sourceType: "powerpoint",
    sourceBoost: -powerpointPenalty,
    serviceBoost: 0,
    mentionedServices,
    understanding,
    currentWorkflow: [],
  });

  const chunks = mergeCandidates([...pageCandidates, ...relatedCandidates, ...powerpointCandidates, ...globalCandidates], mergedTopK);
  const topScore = chunks[0]?.score || 0;

  return {
    chunks: topScore >= effectiveMinScore ? chunks : [],
    topScore,
    thresholdTriggered: topScore < effectiveMinScore,
    queryEmbeddingDimension: queryEmbedding?.length || 0,
    retrievalMode,
    embeddingUnavailableReason,
    powerpointMissing: powerpoint.missing,
    powerpointUnavailableReason: powerpoint.unavailableReason,
    staleEmbeddingChunks: page.staleChunkIds || [],
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

// Global After-Sales assistant: searches every page store, the global store and the supplemental
// PowerPoint chunks. No page gets priority; services named in the question are boosted, and when
// several services are named the result keeps the best chunks of each so cross-service questions
// see both sides.
async function retrieveGlobalAssistantChunks({
  question,
  // The page the reader has open. It is a ranking hint only: its chunks are nudged up, never
  // filtered in, so every page's knowledge stays reachable from every page.
  currentPageId = "",
  pagePriorityBoost = readNumberEnv("HYBRID_PAGE_PRIORITY_BOOST", DEFAULT_PAGE_PRIORITY_BOOST),
  topK = DEFAULT_GLOBAL_ASSISTANT_TOP_K,
  perServiceTopK = DEFAULT_PER_SERVICE_TOP_K,
  minScore = DEFAULT_MIN_SCORE,
  lexicalFallbackMinScore = readNumberEnv("HYBRID_LEXICAL_FALLBACK_MIN_SCORE", DEFAULT_LEXICAL_FALLBACK_MIN_SCORE),
  serviceBoost = readNumberEnv("HYBRID_SERVICE_BOOST", DEFAULT_SERVICE_BOOST),
  offServicePenalty = DEFAULT_OFF_SERVICE_PENALTY,
  pageContextOffServicePenalty = readNumberEnv("HYBRID_PAGE_CONTEXT_OFF_SERVICE_PENALTY", DEFAULT_PAGE_CONTEXT_OFF_SERVICE_PENALTY),
  powerpointPenalty = readNumberEnv("HYBRID_POWERPOINT_PENALTY", DEFAULT_POWERPOINT_PENALTY),
  queryUnderstanding = null,
} = {}) {
  const understanding = queryUnderstanding || understandQuery(question);
  const retrievalQuery = understanding.retrievalQuery || question;
  // A page whose embedding store is not built yet (e.g. a newly added page) must not take the whole
  // global assistant down: it is ranked lexically in fallback mode and skipped in semantic mode.
  const pageSources = Object.keys(pageKnowledge).map((pageId) => loadPageSource(pageId, { allowMissing: true }));
  const globalSource = loadGlobalSource(pageSources.find((source) => source.store)?.store);
  const referenceModel = globalSource.store?.model || getEmbeddingModel();
  const referenceDimension = Number(globalSource.store?.embeddingDimension) || DEFAULT_EMBEDDING_DIMENSION;
  const { queryEmbedding, embeddingUnavailableReason } = await embedQuery(retrievalQuery, referenceModel, referenceDimension);
  const effectiveMinScore = queryEmbedding ? minScore : lexicalFallbackMinScore;
  const mentionedServices = detectMentionedServices(retrievalQuery);

  // Which services the ranking leans towards. A service the question names always wins, which is
  // what lets a reader ask about another service from any page. When the question names none — "ماذا
  // يحدث في مرحلة ملئ النموذج؟" — the open page's services stand in, so the stage of the service the
  // reader is actually reading outranks the same-named stage of six other services. Nothing is
  // filtered out either way: every service stays reachable, it just ranks lower.
  const namedFocus = mentionedServices.length > 0;
  const focusServices = namedFocus ? mentionedServices : getPageServices(currentPageId);
  const appliedOffServicePenalty =
    focusServices.length === 0 ? 0 : namedFocus ? offServicePenalty : pageContextOffServicePenalty;

  const powerpoint = loadPowerPointSource(queryEmbedding, referenceModel, referenceDimension);

  const rankAll = (records, sourceType, sourceBoost = 0) =>
    rankRecords({
      records,
      queryEmbedding,
      question: retrievalQuery,
      topK: records.length,
      sourceType,
      sourceBoost,
      serviceBoost,
      mentionedServices: focusServices,
      understanding,
      currentWorkflow: [],
      offServicePenalty: appliedOffServicePenalty,
    });

  const ranked = [
    ...pageSources.flatMap((source) =>
      source.storeMissing && queryEmbedding ? [] : rankAll(source.records, "page", source.pageId === currentPageId ? pagePriorityBoost : 0),
    ),
    ...rankAll(globalSource.records, "global"),
    ...rankAll(powerpoint.records, "powerpoint", -powerpointPenalty),
  ].sort((a, b) => b.score - a.score);

  // Cross-service questions keep the best chunks of each named service, plus that service's own
  // stage sequence: without the reserved sequence slot a comparison can be answered from link and
  // overview chunks on one side while the other side still shows its stages.
  const perService = mentionedServices.length > 1
    ? mentionedServices.flatMap((service) => {
        const forService = ranked.filter((chunk) => chunk.service.includes(service));
        const best = forService.slice(0, perServiceTopK);
        const sequence = forService.find((chunk) => WORKFLOW_SEQUENCE_ID.test(chunk.id));
        return sequence && !best.includes(sequence) ? [...best, sequence] : best;
      })
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
    powerpointMissing: powerpoint.missing,
    powerpointUnavailableReason: powerpoint.unavailableReason,
    pagesMissingEmbeddings: pageSources.filter((source) => source.storeMissing).map((source) => source.pageId),
    staleEmbeddingChunks: [...pageSources.flatMap((source) => source.staleChunkIds || []), ...(globalSource.staleChunkIds || [])],
    effectiveMinScore,
    mentionedServices,
    understanding,
  };
}

// A page's current stage sequence chunk ("<page>:workflow-sequence:<id>").
const WORKFLOW_SEQUENCE_ID = /^[^:]+:workflow-sequence:/;

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

  // Content drift (a chunk's text changed, or a chunk was added, since the store was built) is not
  // corruption: those chunks are served with their current text and no vector — ranked lexically,
  // never with the old text's embedding — until the store is rebuilt. Structural problems (wrong
  // page, model, dimension, duplicate ids) still fail the request.
  const validation = validateEmbeddingStore(pageId, chunks, store);
  const fatalErrors = validation.errors.filter((error) => !CONTENT_DRIFT_ERROR.test(error));
  if (fatalErrors.length > 0) {
    throw new Error(`Page embedding store validation failed (${pageId}): ${fatalErrors.join("; ")}`);
  }

  const dimension = Number(store.embeddingDimension);
  const storedById = new Map(store.records.map((record) => [record.id, record]));
  const staleChunkIds = [];
  // Records are built from the current chunks (metadata is not part of the content hash either).
  const records = chunks.map((chunk) => {
    const stored = storedById.get(chunk.id);
    const fresh = stored && stored.contentHash === buildContentHash(chunk) && isValidEmbedding(stored.embedding, dimension);
    if (!fresh) staleChunkIds.push(chunk.id);
    return withChunkServices({ ...chunk, metadata: chunk.metadata || null, embedding: fresh ? stored.embedding : null });
  });
  return { pageId, store, storeMissing: false, staleChunkIds, records };
}

const CONTENT_DRIFT_ERROR = /^(Stale content hash for |Missing embedding for chunk: |Record count mismatch: )/;

function loadGlobalSource(referenceStore) {
  const store = loadGlobalEmbeddingStore();
  const chunks = buildGlobalKnowledgeChunks();
  const validation = validateGlobalEmbeddingStore({
    chunks,
    store,
    expectedModel: referenceStore?.model || store?.model || getEmbeddingModel(),
    expectedDimension: Number(referenceStore?.embeddingDimension) || Number(store?.embeddingDimension) || DEFAULT_EMBEDDING_DIMENSION,
  });

  // As for page stores: items added or edited since the last embedding build are served with their
  // current text and no vector (lexical only) instead of failing every global question.
  const fatalErrors = validation.errors.filter((error) => !GLOBAL_CONTENT_DRIFT_ERROR.test(error));
  if (fatalErrors.length > 0) {
    throw new Error(`Global embedding store validation failed: ${fatalErrors.join("; ")}`);
  }

  const dimension = Number(store.embeddingDimension);
  const storedById = new Map(store.records.map((record) => [record.id, record]));
  const staleChunkIds = [];
  const records = chunks.map((chunk) => {
    const stored = storedById.get(chunk.id);
    const fresh = stored && stored.contentHash === buildGlobalContentHash(chunk) && isValidEmbedding(stored.embedding, dimension);
    if (!fresh) staleChunkIds.push(chunk.id);
    return { ...chunk, embedding: fresh ? stored.embedding : null };
  });
  return { store, records, staleChunkIds };
}

const GLOBAL_CONTENT_DRIFT_ERROR = /^(Record count mismatch: |Missing embedding for chunk: |Stale content hash for chunk: |Metadata mismatch for )/;

// Active PowerPoint chunks. Semantic ranking needs a stored vector per chunk, so chunks without a
// fresh embedding are left out (and reported); lexical fallback ranks every active chunk. A missing
// or unreadable PowerPoint store never fails the request: the website sources still answer.
function loadPowerPointSource(queryEmbedding, model, dimension) {
  try {
    const { chunks, records, missing } = loadPowerPointRecords({ expectedModel: model, expectedDimension: dimension });
    return queryEmbedding
      ? { records, missing, unavailableReason: records.length === 0 && chunks.length > 0 ? "powerpoint_store_missing" : null }
      : { records: chunks, missing: [], unavailableReason: null };
  } catch (error) {
    return { records: [], missing: [], unavailableReason: `powerpoint_error: ${error.message}` };
  }
}

// PowerPoint chunks never cross into another service's page: only chunks mapped to this page, to a
// related page whose service the question names, and project-level (unmapped) slides for
// project-wide questions.
function isPowerPointRecordAllowedOnPage({ record, pageId, mentionedRelatedPages, hasGlobalIntent }) {
  const recordPage = record.metadata?.page_id || null;
  if (recordPage === pageId) return true;
  if (recordPage && mentionedRelatedPages.includes(recordPage)) return true;
  return !recordPage && hasGlobalIntent;
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
        chunk.sourceType === "powerpoint"
          ? `Source: current approved PowerPoint, slide ${chunk.metadata?.slide_number} — ${chunk.metadata?.slide_title} (secondary to website facts)`
          : "",
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
      // A chunk without a current vector (text changed since the last embedding build) scores lexically.
      const semanticScore = queryEmbedding && record.embedding ? cosineSimilarity(queryEmbedding, record.embedding) : 0;
      const lexicalBoost = calculateLexicalBoost(question, record);
      const codeBoost = calculateCodeBoost(question, record);
      const recordServices = Array.isArray(record.service) ? record.service : [];
      const matchedServices = sourceType === "page" && serviceBoost === 0 ? [] : getMatchedServices(recordServices, mentionedServices);
      const appliedServiceBoost = matchedServices.length > 0 ? serviceBoost : 0;
      const appliedPenalty = offServicePenalty && recordServices.length > 0 && matchedServices.length === 0 ? offServicePenalty : 0;
      const intentBoost = calculateIntentBoost(question, record, sourceType, { understanding, mentionedServices });
      const nluBoost = sourceType === "page" ? calculateNluRecordBoost({ record, understanding, currentWorkflow }) : 0;
      const score = semanticScore + lexicalBoost + codeBoost + sourceBoost + appliedServiceBoost + intentBoost + nluBoost - appliedPenalty;

      return {
        id: record.id,
        sourceType,
        status: sourceType === "global" || sourceType === "powerpoint" ? record.status : "confirmed",
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

function calculateIntentBoost(question, record, sourceType, { understanding = null, mentionedServices = [] } = {}) {
  if (sourceType !== "global") {
    return 0;
  }

  if (detectServiceListIntent(question) && record.id === "global-after-sales:system-overview:overview-after-sales-001") {
    return 0.12;
  }

  // A whole-journey question ("الفلو العام من بيع SAP للتقييم") is about the project-wide service map, not about the
  // stage list of whichever page happens to rank first. The two global end-to-end items answer it.
  if (detectEndToEndIntent(question) && END_TO_END_RECORD_IDS.has(record.id)) {
    return 0.12;
  }

  // "How does service A relate to service B": the documented relationship lives in the global item
  // tagged with both named services, which otherwise loses to each service's own page chunks.
  if (detectServiceRelationIntent(question, understanding) && coversExactlyServices(record, mentionedServices)) {
    return 0.09;
  }

  if (detectBusinessRuleIntent(question) && ["business-rule", "business_rule"].includes(record.type)) {
    return 0.12;
  }

  if (detectKnownErrorIntent(question) && ["known-error", "known_error"].includes(record.type)) {
    return 0.12;
  }

  return 0;
}

function detectEndToEndIntent(question) {
  const normalized = normalizeText(question);
  return END_TO_END_TERMS.some((term) => normalized.includes(normalizeText(term)));
}

// Needs both an explicit relationship wording and more than one named service, so that an ordinary
// single-service question about a shared term is not rerouted to a cross-service item.
function detectServiceRelationIntent(question, understanding) {
  const intents = [understanding?.primaryIntent, ...(understanding?.secondaryIntents || [])];
  if (!intents.includes("service_dependency")) {
    return false;
  }

  const normalized = normalizeText(question);
  return SERVICE_RELATION_TERMS.some((term) => normalized.includes(normalizeText(term)));
}

// Exactly the named services: an item spanning a wider set (a whole dependency map) describes
// something broader than the pair the question asks about.
function coversExactlyServices(record, mentionedServices) {
  const services = Array.isArray(record.service) ? record.service : [];
  return (
    mentionedServices.length > 1 &&
    services.length === mentionedServices.length &&
    mentionedServices.every((service) => services.includes(service))
  );
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

// The two global items that describe the whole Customer -> SAP -> Odoo -> service -> rating journey.
const END_TO_END_RECORD_IDS = new Set([
  "global-after-sales:workflow:integration-end-to-end-flow-001",
  "global-after-sales:workflow:relationship-service-end-to-end-map-001",
]);

const END_TO_END_TERMS = [
  "الفلو العام",
  "الفلو الكامل",
  "المسار العام",
  "الرحلة الكاملة",
  "رحلة الخدمة",
  "من بيع sap",
  "end to end",
];

const SERVICE_RELATION_TERMS = [
  "علاق",
  "يرتبط",
  "ترتبط",
  "ارتباط",
  "يعتمد",
  "تعتمد",
  "الفرق بين",
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
  DEFAULT_POWERPOINT_PENALTY,
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
  getPageServices,
  isGeminiRateLimitError,
  isPowerPointRecordAllowedOnPage,
  retrieveGlobalAssistantChunks,
  retrieveHybridChunks,
};
