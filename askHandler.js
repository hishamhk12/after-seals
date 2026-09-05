const { loadEnvFile } = require("./embeddingService");
const { ERROR_ANSWER, FALLBACK_ANSWER, answerFromRetrievedContext } = require("./llmService");
const { buildHybridRetrievedContext, retrieveHybridChunks } = require("./hybridRetrievalService");
const { pageKnowledge, findSupportedAnswer } = require("./pageKnowledge");

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

  const supportedAnswer = findSupportedAnswer(pageId, question);

  if (supportedAnswer) {
    return jsonResult(200, { answer: supportedAnswer });
  }

  if (!process.env.ai) {
    logger.error?.("Gemini key loaded: false");
    return jsonResult(503, { answer: ERROR_ANSWER });
  }

  try {
    const retrieval = await retrieveHybridChunks({ pageId, question });

    logger.log?.(
      [
        `Hybrid RAG retrieval: pageId=${pageId}`,
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
      retrievedContext: buildHybridRetrievedContext(retrieval.chunks),
    });

    return jsonResult(200, { answer: answer || FALLBACK_ANSWER });
  } catch (error) {
    logger.error?.(`Gemini API failure: ${error.message}`);
    return jsonResult(502, { answer: ERROR_ANSWER });
  }
}

function jsonResult(statusCode, payload) {
  return { statusCode, payload };
}

module.exports = {
  ERROR_ANSWER,
  FALLBACK_ANSWER,
  MAX_QUESTION_LENGTH,
  handleAskPayload,
};
