const { loadEnvFile } = require("./embeddingService");
const { ERROR_ANSWER, FALLBACK_ANSWER, answerFromRetrievedContext } = require("./llmService");
const { buildHybridRetrievedContext, retrieveHybridChunks } = require("./hybridRetrievalService");
const { pageKnowledge, findSupportedAnswer } = require("./pageKnowledge");
const { understandQuery } = require("./queryUnderstanding");

const MAX_QUESTION_LENGTH = 500;
const INVALID_QUESTION_ANSWER = "يرجى كتابة سؤال واضح لا يتجاوز 500 حرف.";

async function handleAskPayload(body, logger = console) {
  loadEnvFile();

  const pageId = typeof body?.pageId === "string" ? body.pageId.trim() : "";
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  logger.log?.(
    `Ask payload: pageId=${pageId || "(missing)"}, questionLength=${question.length}, supportedPage=${Boolean(pageKnowledge[pageId])}`,
  );

  if (!pageKnowledge[pageId]) {
    return jsonResult(400, { answer: FALLBACK_ANSWER });
  }

  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return jsonResult(400, { answer: INVALID_QUESTION_ANSWER });
  }

  const queryUnderstanding = understandQuery(question);
  const supportedAnswer = findSupportedAnswer(pageId, question);

  if (supportedAnswer && shouldUseSupportedAnswer(pageId, supportedAnswer, queryUnderstanding)) {
    return jsonResult(200, { answer: formatSupportedAnswer(pageId, supportedAnswer, queryUnderstanding) });
  }

  if (!process.env.ai) {
    logger.error?.("Gemini key loaded: false");
    return jsonResult(503, { answer: ERROR_ANSWER });
  }

  try {
    const retrieval = await retrieveHybridChunks({ pageId, question, queryUnderstanding });

    logger.log?.(
      [
        `Hybrid RAG retrieval: pageId=${pageId}`,
        `intent=${retrieval.understanding?.primaryIntent || "unknown"}`,
        `intentConfidence=${retrieval.understanding?.confidence || 0}`,
        `concepts=${retrieval.understanding?.concepts?.join(",") || "none"}`,
        `retrieved=${retrieval.chunks.map((chunk) => `${chunk.sourceType}:${chunk.id}:${chunk.score}:${chunk.status}`).join(", ") || "none"}`,
        `topScore=${retrieval.topScore}`,
        `thresholdTriggered=${retrieval.thresholdTriggered}`,
      ].join("; "),
    );

    if (retrieval.thresholdTriggered || retrieval.chunks.length === 0) {
      return jsonResult(200, { answer: FALLBACK_ANSWER });
    }

    const answer = await answerFromRetrievedContext({
      question,
      retrievedContext: [
        buildCurrentWorkflowContext(pageId, queryUnderstanding),
        buildHybridRetrievedContext(retrieval.chunks),
      ]
        .filter(Boolean)
        .join("\n\n"),
      queryUnderstanding: retrieval.understanding,
    });

    return jsonResult(200, { answer: answer || FALLBACK_ANSWER });
  } catch (error) {
    logger.error?.(`Gemini API failure: ${error.message}`);
    return jsonResult(502, { answer: ERROR_ANSWER });
  }
}

function buildCurrentWorkflowContext(pageId, queryUnderstanding) {
  const currentWorkflow = pageKnowledge[pageId]?.currentWorkflow || [];
  const intent = queryUnderstanding.primaryIntent;

  if (currentWorkflow.length === 0 || !["workflow_sequence", "next_step", "previous_step"].includes(intent)) {
    return "";
  }

  const referencedIndex = ["next_step", "previous_step"].includes(intent)
    ? findReferencedCurrentStage(queryUnderstanding.normalizedQuery, currentWorkflow)
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

  return `المسار الحالي المرئي لخدمة التوصيل هو: ${currentStages
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
  MAX_QUESTION_LENGTH,
  handleAskPayload,
};
