const fs = require("node:fs");
const path = require("node:path");
const { handleAskPayload } = require("./askHandler");
const { nluEvaluationDataset, NLU_FALLBACK_ANSWER } = require("./nluEvaluationDataset");
const { understandQuery } = require("./queryUnderstanding");

const PAGE_ID = "intro-tour";
const RESULT_PATH = path.join(__dirname, "data", "evaluation", "intro-tour-nlu-latest.json");

async function main() {
  const results = [];

  for (const test of nluEvaluationDataset) {
    const understanding = understandQuery(test.question);
    const response = await handleAskPayload({ pageId: PAGE_ID, question: test.question }, SILENT_LOGGER);
    const answer = response.payload?.answer || "";
    const intentPass = understanding.primaryIntent === test.expectedIntent;
    const refusalPass = test.expectedFallback ? answer === NLU_FALLBACK_ANSWER : answer !== NLU_FALLBACK_ANSWER;
    const conceptPass = test.expectedFallback || (test.requiredConcepts || []).every((concept) => conceptMatches(answer, concept));
    const sequencePass = !test.expectedSequence || sequenceMatches(answer, test.expectedSequence);
    const pass = intentPass && refusalPass && conceptPass && sequencePass;
    const failures = [];

    if (!intentPass) failures.push(`intent: expected ${test.expectedIntent}, got ${understanding.primaryIntent}`);
    if (!refusalPass) failures.push(test.expectedFallback ? "unsupported answer was not refused" : "supported answer fell back");
    if (!conceptPass) failures.push("required answer concept missing");
    if (!sequencePass) failures.push("answer sequence mismatch");

    const result = {
      id: test.id,
      category: test.category,
      question: test.question,
      expectedIntent: test.expectedIntent,
      predictedIntent: understanding.primaryIntent,
      confidence: understanding.confidence,
      normalizedQuery: understanding.normalizedQuery,
      concepts: understanding.concepts,
      exactTerms: understanding.exactTerms,
      answer,
      scores: { intent: intentPass, refusal: refusalPass, concepts: conceptPass, sequence: sequencePass },
      pass,
      failureReason: failures.join("; "),
    };

    results.push(result);
    console.log(`${pass ? "PASS" : "FAIL"} ${test.id} intent=${understanding.primaryIntent}`);
  }

  const report = buildReport(results);
  fs.mkdirSync(path.dirname(RESULT_PATH), { recursive: true });
  fs.writeFileSync(RESULT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  printReport(report);

  if (report.metrics.failCount > 0) process.exitCode = 1;
}

function buildReport(results) {
  const metric = (predicate, scorePredicate = (result) => result.pass) => {
    const selected = results.filter(predicate);
    const passed = selected.filter(scorePredicate).length;
    return { total: selected.length, passed, failed: selected.length - passed, accuracy: percentage(passed, selected.length) };
  };
  const categories = (...names) => (result) => names.includes(result.category);

  return {
    timestamp: new Date().toISOString(),
    pageId: PAGE_ID,
    metrics: {
      total: results.length,
      passCount: results.filter((result) => result.pass).length,
      failCount: results.filter((result) => !result.pass).length,
      overallAccuracy: percentage(results.filter((result) => result.pass).length, results.length),
      intentAccuracy: metric(() => true, (result) => result.scores.intent),
      paraphraseAccuracy: metric(categories("workflow-paraphrase", "dialect", "singular-plural")),
      nextStepAccuracy: metric((result) => result.expectedIntent === "next_step"),
      previousStepAccuracy: metric((result) => result.expectedIntent === "previous_step"),
      mixedLanguageAccuracy: metric(categories("mixed-language")),
      unsupportedRefusalAccuracy: metric(categories("unsupported"), (result) => result.scores.refusal),
    },
    failures: results.filter((result) => !result.pass),
    results,
  };
}

function conceptMatches(text, concept) {
  if (Array.isArray(concept)) return concept.some((alternative) => conceptMatches(text, alternative));
  return normalize(text).includes(normalize(concept));
}

function sequenceMatches(text, sequence) {
  const normalizedText = normalize(text);
  let cursor = -1;

  for (const step of sequence) {
    const alternatives = Array.isArray(step) ? step : [step];
    const indexes = alternatives.map((item) => normalizedText.indexOf(normalize(item), cursor + 1)).filter((index) => index >= 0);
    if (indexes.length === 0) return false;
    cursor = Math.min(...indexes);
  }

  return true;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[أإآ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/[؟?،,.;:()[\]{}"'`~!@#$%^&*_+=\\/|-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function percentage(numerator, denominator) {
  return denominator ? Number(((numerator / denominator) * 100).toFixed(2)) : 100;
}

function printReport(report) {
  console.log("");
  console.log(`total=${report.metrics.total}`);
  console.log(`pass=${report.metrics.passCount}`);
  console.log(`fail=${report.metrics.failCount}`);
  console.log(`overallAccuracy=${report.metrics.overallAccuracy}%`);
  for (const key of ["intentAccuracy", "paraphraseAccuracy", "nextStepAccuracy", "previousStepAccuracy", "mixedLanguageAccuracy", "unsupportedRefusalAccuracy"]) {
    console.log(`${key}=${report.metrics[key].accuracy}% (${report.metrics[key].passed}/${report.metrics[key].total})`);
  }
  console.log(`resultFile=${RESULT_PATH}`);

  if (report.failures.length > 0) {
    console.log("\nFailures:");
    for (const failure of report.failures) {
      console.log(`${failure.id}: ${failure.failureReason}`);
      console.log(`question=${failure.question}`);
      console.log(`answer=${failure.answer}`);
    }
  }
}

const SILENT_LOGGER = { log() {}, error() {} };

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
