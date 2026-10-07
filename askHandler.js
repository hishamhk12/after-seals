const { searchKnowledge } = require("./localSearchService");

const MAX_QUESTION_LENGTH = 500;
// pageId sent by the site-wide assistant on home and overview pages: no page context at all.
const GLOBAL_ASSISTANT_ID = "after-sales-global";
const INVALID_QUESTION_ANSWER = "يرجى كتابة سؤال واضح لا يتجاوز 500 حرف.";
const NO_RESULT_ANSWER = "لم أجد شرحًا مباشرًا لهذا السؤال في دليل خدمات ما بعد البيع.";
const ERROR_ANSWER = "تعذر البحث حاليًا. حاول مرة أخرى.";
// Kept for the offline evaluation scripts that still import them.
const FALLBACK_ANSWER = NO_RESULT_ANSWER;
const GLOBAL_FALLBACK_ANSWER = NO_RESULT_ANSWER;

// One search for all of After-Sales, answered from the site's own knowledge only (see
// localSearchService.js): no AI service and no API key. The page the reader has open is context
// for ranking, never a scope, so a question about another service still finds that service.
async function handleAskPayload(body, logger = console) {
  const pageId = typeof body?.pageId === "string" ? body.pageId.trim() : "";
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return jsonResult(400, { answer: INVALID_QUESTION_ANSWER });
  }

  const search = searchKnowledge(question, { pageId: pageId === GLOBAL_ASSISTANT_ID ? "" : pageId });

  logger.log?.(
    [
      `Ask: openPage=${pageId || "(missing)"}`,
      `questionLength=${question.length}`,
      `strong=${search.strong}`,
      `results=${search.results.map((result) => result.id).join(",") || "none"}`,
    ].join(", "),
  );

  return jsonResult(200, {
    mode: "search",
    ...search,
    answer: search.results.length ? "" : NO_RESULT_ANSWER,
  });
}

function jsonResult(statusCode, payload) {
  return { statusCode, payload };
}

module.exports = {
  ERROR_ANSWER,
  FALLBACK_ANSWER,
  GLOBAL_ASSISTANT_ID,
  GLOBAL_FALLBACK_ANSWER,
  MAX_QUESTION_LENGTH,
  NO_RESULT_ANSWER,
  handleAskPayload,
};
