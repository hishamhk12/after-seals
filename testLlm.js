const { buildRetrievedContext, retrieveRelevantChunks } = require("./retrievalService");
const { answerFromRetrievedContext, FALLBACK_ANSWER } = require("./llmService");

const pageId = "intro-tour";
const tests = [
  ["1", "شو يعني Stage؟"],
  ["2", "مين المسؤول عن متابعة المهمة ومين ينفذها؟"],
  ["3", "متى العميل بيقدر يحجز موعد؟"],
  ["4", "اشرحلي من وقت تعيين السائق لحد انتهاء التوصيل"],
  ["5", "شو بصير بعد End Task؟"],
  ["6", "شو هو Operation Case؟"],
  ["7", "كيف بعمل مرتجع؟"],
];

async function main() {
  for (const [label, question] of tests) {
    const retrieval = await retrieveRelevantChunks({ pageId, question, topK: 5 });
    const answer =
      retrieval.thresholdTriggered || retrieval.chunks.length === 0
        ? FALLBACK_ANSWER
        : await answerFromRetrievedContext({
            question,
            retrievedContext: buildRetrievedContext(retrieval.chunks),
          });
    const mustFallback = label === "6" || label === "7";
    const passed = mustFallback ? answer === FALLBACK_ANSWER : answer && answer !== FALLBACK_ANSWER;

    console.log(`\n${label}: ${passed ? "PASS" : "FAIL"}`);
    console.log(`question=${question}`);
    console.log(`topScore=${retrieval.topScore.toFixed(6)} thresholdTriggered=${retrieval.thresholdTriggered}`);
    console.log(`answer=${answer}`);

    if (!passed) {
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
