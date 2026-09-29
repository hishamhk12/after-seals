const { loadEnvFile } = require("./embeddingService");
const { ERROR_ANSWER, FALLBACK_ANSWER, GLOBAL_FALLBACK_ANSWER, answerFromRetrievedContext } = require("./llmService");
const {
  buildHybridRetrievedContext,
  detectMentionedServices,
  getPageServices,
  retrieveGlobalAssistantChunks,
} = require("./hybridRetrievalService");
const {
  buildAutomationSummaryContext,
  buildResponsibilityContext,
  buildServiceCatalogContext,
  buildStageReferenceContext,
  detectAutomationIntent,
  detectCatalogIntent,
  detectResponsibilityIntent,
} = require("./derivedKnowledgeContext");
const { pageKnowledge, findSupportedAnswer } = require("./pageKnowledge");
const { understandQuery } = require("./queryUnderstanding");

const MAX_QUESTION_LENGTH = 500;
// pageId sent by the site-wide assistant on home and overview pages: no page context at all.
const GLOBAL_ASSISTANT_ID = "after-sales-global";
const INVALID_QUESTION_ANSWER = "يرجى كتابة سؤال واضح لا يتجاوز 500 حرف.";

// The page that owns each service's own workflow, so a question about a service the reader does not
// have open is still answered from that service's structured knowledge. Mirrors the site's
// PAGE_ASSISTANT_ROUTES: one canonical page per service, link and returns pages excluded.
const SERVICE_PRIMARY_PAGE = {
  delivery: "intro-tour",
  installation: "installation",
  measurement: "measurement",
  design: "design",
  manufacturing: "manufacturing",
  internal_transfer: "internal-transfer",
  maintenance: "maintenance",
  warehouse_pickup: "warehouse-pickup",
  customer_service: "customer-service",
};

// One assistant for all of After-Sales. The page and stage the reader has open are context, never a
// scope: every question is answered from the whole knowledge base, and a question that names another
// service is answered from that service instead of being refused as "not on this page".
async function handleAskPayload(body, logger = console) {
  loadEnvFile();

  const requestedPageId = typeof body?.pageId === "string" ? body.pageId.trim() : "";
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  // Optional context from the site: the workflow stage the reader currently has open.
  const stageId = typeof body?.stageId === "string" ? body.stageId.trim() : "";
  const stageTitle = typeof body?.stageTitle === "string" ? body.stageTitle.trim() : "";

  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return jsonResult(400, { answer: INVALID_QUESTION_ANSWER });
  }

  // An unknown or global pageId simply means the reader has no service page open.
  const openPageId = pageKnowledge[requestedPageId] ? requestedPageId : "";
  const mentionedServices = detectMentionedServices(question);
  const contextPageId = keepsOpenPageContext(openPageId, mentionedServices) ? openPageId : "";
  // Whose structured workflow the answer is about: the open page while the question is about it,
  // otherwise the page of the one service the question names.
  const answerPageId = contextPageId || resolveNamedServicePage(mentionedServices);

  logger.log?.(
    [
      `Ask payload: openPage=${requestedPageId || "(missing)"}`,
      `questionLength=${question.length}`,
      `namedServices=${mentionedServices.join(",") || "none"}`,
      `pageContext=${contextPageId || "none"}`,
      `answerPage=${answerPageId || "none"}`,
      stageId ? `openStage=${stageId}` : "",
    ]
      .filter(Boolean)
      .join(", "),
  );

  return handleGlobalQuestion({ question, contextPageId, answerPageId, stageTitle }, logger);
}

// The open page keeps applying while the question is about one of that page's services, or names no
// service at all — which is what an ambiguous follow-up ("شو بيجي بعد هالمرحلة؟") looks like. Naming
// a different service is what makes the reader's page step aside.
function keepsOpenPageContext(openPageId, mentionedServices) {
  if (!openPageId) return false;
  if (mentionedServices.length === 0) return true;

  const pageServices = getPageServices(openPageId);
  return pageServices.some((service) => mentionedServices.includes(service));
}

// Only an unambiguous single service routes to a page of its own; a question spanning several
// services is left to global retrieval, which already reserves chunks per named service.
function resolveNamedServicePage(mentionedServices) {
  if (mentionedServices.length !== 1) return "";
  const pageId = SERVICE_PRIMARY_PAGE[mentionedServices[0]];
  return pageKnowledge[pageId] ? pageId : "";
}

async function handleGlobalQuestion({ question, contextPageId, answerPageId, stageTitle }, logger) {
  const queryUnderstanding = understandQuery(question);

  // The curated exact answers of the service the question is about. This is what keeps a workflow
  // question deterministic, and it now follows the question's service rather than the open page.
  const supportedAnswer = answerPageId ? findSupportedAnswer(answerPageId, question) : "";

  if (supportedAnswer && shouldUseSupportedAnswer(answerPageId, supportedAnswer, queryUnderstanding)) {
    logger.log?.(`Retrieval path: exact_structured; answerPage=${answerPageId}`);
    return jsonResult(200, { answer: formatSupportedAnswer(answerPageId, supportedAnswer, queryUnderstanding) });
  }

  if (!process.env.ai) {
    logger.error?.("Gemini key loaded: false");
    return jsonResult(503, { answer: ERROR_ANSWER });
  }

  try {
    const retrieval = await retrieveGlobalAssistantChunks({ question, queryUnderstanding, currentPageId: contextPageId });
    logger.log?.(
      [
        `Global RAG retrieval: retrievalMode=${retrieval.retrievalMode}`,
        `pageContext=${contextPageId || "none"}`,
        `mentionedServices=${retrieval.mentionedServices.join(",") || "none"}`,
        `retrieved=${retrieval.chunks.map((chunk) => `${chunk.sourceType}:${chunk.id}:${chunk.score}`).join(", ") || "none"}`,
        `topScore=${retrieval.topScore}`,
        `thresholdTriggered=${retrieval.thresholdTriggered}`,
        retrieval.powerpointUnavailableReason ? `powerpointUnavailableReason=${retrieval.powerpointUnavailableReason}` : "",
        retrieval.powerpointMissing?.length ? `powerpointMissingEmbeddings=${retrieval.powerpointMissing.length}` : "",
        retrieval.pagesMissingEmbeddings?.length ? `pagesMissingEmbeddings=${retrieval.pagesMissingEmbeddings.join(",")}` : "",
        retrieval.staleEmbeddingChunks?.length ? `staleEmbeddingChunks=${retrieval.staleEmbeddingChunks.join(",")}` : "",
      ]
        .filter(Boolean)
        .join("; "),
    );

    // Structured context for the service the question is about. The stage the reader has open is
    // only added while the open page is still the one being asked about, so "شو بيجي بعد هالمرحلة؟"
    // resolves against the stage on screen while "شو فلو التركيب" does not.
    const derived = [
      answerPageId ? buildCurrentWorkflowContext(answerPageId, queryUnderstanding, contextPageId ? stageTitle : "") : "",
      answerPageId ? buildStageReferenceContext(answerPageId, question) : "",
      answerPageId && (detectResponsibilityIntent(question) || detectAutomationIntent(question))
        ? buildResponsibilityContext(answerPageId)
        : "",
      detectCatalogIntent(question) ? buildServiceCatalogContext() : "",
      detectAutomationIntent(question) ? buildAutomationSummaryContext() : "",
    ].filter(Boolean);

    if ((retrieval.thresholdTriggered || retrieval.chunks.length === 0) && derived.length === 0) {
      logger.log?.("Retrieval path: unsupported_fallback; pageId=after-sales-global");
      return jsonResult(200, { answer: GLOBAL_FALLBACK_ANSWER });
    }

    const answer = await answerFromRetrievedContext({
      question,
      retrievedContext: [...derived, buildHybridRetrievedContext(retrieval.chunks)].filter(Boolean).join("\n\n"),
      queryUnderstanding: retrieval.understanding,
      fallbackAnswer: GLOBAL_FALLBACK_ANSWER,
    });

    return jsonResult(200, { answer: answer || GLOBAL_FALLBACK_ANSWER });
  } catch (error) {
    logger.error?.(`Gemini API failure: ${error.message}`);
    return jsonResult(502, { answer: ERROR_ANSWER });
  }
}

function buildCurrentWorkflowContext(pageId, queryUnderstanding, openStageTitle = "") {
  const currentWorkflow = pageKnowledge[pageId]?.currentWorkflow || [];

  if (currentWorkflow.length === 0) {
    return "";
  }

  // "طيب شو بيجي بعد هالمرحلة؟" names no stage and scores as unsupported on its own, but the reader has a
  // stage open on the page and that is what "هالمرحلة" points at. Only a request that carries that
  // context can take this path, so a request without it behaves exactly as before.
  const intent = detectOpenStageAdjacency(queryUnderstanding.normalizedQuery, openStageTitle) || queryUnderstanding.primaryIntent;

  if (!["workflow_sequence", "next_step", "previous_step"].includes(intent)) {
    return "";
  }

  const referencedIndex = ["next_step", "previous_step"].includes(intent)
    ? resolveReferencedStage(queryUnderstanding.normalizedQuery, openStageTitle, currentWorkflow)
    : -1;

  if (["next_step", "previous_step"].includes(intent) && referencedIndex < 0) {
    return "";
  }

  const lines = [
    "[Derived current workflow context]",
    "Status: confirmed current/primary page workflow",
    `Authoritative sequence: ${currentWorkflow.map((stage) => stage.title).join(" → ")}`,
  ];
  if (["next_step", "previous_step"].includes(intent)) {
    const referencedStage = currentWorkflow[referencedIndex];
    const adjacentStage = intent === "next_step" ? currentWorkflow[referencedIndex + 1] : currentWorkflow[referencedIndex - 1];
    lines.push(`Referenced current stage: ${referencedStage.title}`);
    lines.push(
      adjacentStage
        ? `${intent === "next_step" ? "Immediate next" : "Immediate previous"} current stage: ${adjacentStage.title}`
        : `There is no ${intent === "next_step" ? "next" : "previous"} stage in the current workflow.`,
    );
  }

  return lines.join("\n");
}

// A next/previous question pointed at the stage on screen rather than at a named one.
const OPEN_STAGE_NEXT = /بعد\s*(?:هذه|هذي|هاي|هال|ال)?\s*(?:ال)?مرحل|(?:الخطوة|المرحلة)\s*(?:التالية|القادمة|الجاية)|بعدها|بعدين/u;
const OPEN_STAGE_PREVIOUS = /قبل\s*(?:هذه|هذي|هاي|هال|ال)?\s*(?:ال)?مرحل|(?:الخطوة|المرحلة)\s*السابقة|اللي قبل/u;

function detectOpenStageAdjacency(normalizedQuestion, openStageTitle) {
  if (!openStageTitle) return "";
  if (OPEN_STAGE_PREVIOUS.test(normalizedQuestion)) return "previous_step";
  return OPEN_STAGE_NEXT.test(normalizedQuestion) ? "next_step" : "";
}

// "طيب شو بيجي بعد هالمرحلة؟" names no stage, so a next/previous question falls back to the stage the
// reader has open on the page. Requests without that context behave exactly as before.
function resolveReferencedStage(normalizedQuestion, openStageTitle, currentWorkflow) {
  const named = findReferencedCurrentStage(normalizedQuestion, currentWorkflow);
  if (named >= 0 || !openStageTitle) return named;
  return findReferencedCurrentStage(normalizeForSequence(openStageTitle), currentWorkflow);
}

function findReferencedCurrentStage(normalizedQuestion, currentWorkflow) {
  const questionTokens = new Set(tokenizeStageText(normalizedQuestion));
  let bestIndex = -1;
  let bestScore = 0;

  currentWorkflow.forEach((stage, index) => {
    const stageTokens = tokenizeStageText(stage.title);
    const score = stageTokens.filter((token) => questionTokens.has(token)).length;
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });

  return bestIndex;
}

function tokenizeStageText(value) {
  return normalizeForSequence(value)
    .replace(/[^a-z0-9\u0600-\u06ff\s]/giu, " ")
    .split(/\s+/u)
    .map((token) => token.replace(/^ال(?=.{3,})/u, ""))
    .filter((token) => token.length > 2 && !STAGE_MATCH_STOP_WORDS.has(token));
}

function formatSupportedAnswer(pageId, supportedAnswer, queryUnderstanding) {
  if (queryUnderstanding.primaryIntent !== "workflow_sequence") {
    return supportedAnswer;
  }

  const currentStages = pageKnowledge[pageId]?.currentWorkflow || [];
  if (currentStages.length === 0) return supportedAnswer;

  const workflowLabel = pageKnowledge[pageId]?.workflowLabel || "المسار الحالي المرئي";
  return `${workflowLabel} هو: ${currentStages
    .map((stage) => `${String(stage.order).padStart(2, "0")} — ${stage.title}`)
    .join(" → ")}.`;
}

function shouldUseSupportedAnswer(pageId, supportedAnswer, queryUnderstanding) {
  if (queryUnderstanding.primaryIntent !== "workflow_sequence") {
    return true;
  }

  const currentStages = pageKnowledge[pageId]?.currentWorkflow?.map((stage) => stage.title) || [];
  return currentStages.length === 0 || sequenceAppearsInAnswer(supportedAnswer, currentStages);
}

function sequenceAppearsInAnswer(answer, sequence) {
  let cursor = -1;
  const normalizedAnswer = normalizeForSequence(answer);

  for (const item of sequence) {
    const index = normalizedAnswer.indexOf(normalizeForSequence(item), cursor + 1);
    if (index === -1) return false;
    cursor = index;
  }

  return true;
}

function normalizeForSequence(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[أإآ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

const STAGE_MATCH_STOP_WORDS = new Set(["خدمة", "توصيل", "مرحلة", "stage", "بعد", "قبل", "ماذا", "يحدث"]);

function jsonResult(statusCode, payload) {
  return { statusCode, payload };
}

module.exports = {
  ERROR_ANSWER,
  FALLBACK_ANSWER,
  GLOBAL_ASSISTANT_ID,
  GLOBAL_FALLBACK_ANSWER,
  MAX_QUESTION_LENGTH,
  handleAskPayload,
};
