const fs = require("node:fs");
const path = require("node:path");
const { evaluationDataset, FALLBACK_ANSWER } = require("./evaluationDataset");
const { findSupportedAnswer } = require("./pageKnowledge");
const { buildRetrievedContext, retrieveRelevantChunks } = require("./retrievalService");
const { answerFromRetrievedContext } = require("./llmService");

const RESULT_DIR = path.join(__dirname, "data", "evaluation");
const PAGE_ID = "intro-tour";
const mode = process.argv.includes("--regression") ? "regression" : "full";
const RESULT_PATH = path.join(RESULT_DIR, mode === "regression" ? "intro-tour-regression-latest.json" : "intro-tour-latest.json");
const selectedTests = mode === "regression" ? evaluationDataset.filter((test) => test.critical) : evaluationDataset;

async function main() {
  const results = [];

  for (const test of selectedTests) {
    const result = await runCase(test);
    results.push(result);
    console.log(`${result.pass ? "PASS" : "FAIL"} ${test.id} ${test.category} path=${result.path}`);
  }

  const report = buildReport(results);
  saveReport(report);
  printSummary(report);

  if (!report.thresholds.phaseCanPass) {
    process.exitCode = 1;
  }
}

async function runCase(test) {
  const supportedAnswer = findSupportedAnswer(PAGE_ID, test.question);
  let pathName = "deterministic";
  let retrievedChunks = [];
  let retrieval = null;
  let answer = supportedAnswer;

  if (!answer) {
    pathName = "rag";
    retrieval = await retrieveRelevantChunks({ pageId: PAGE_ID, question: test.question, topK: 5 });
    retrievedChunks = retrieval.chunks;
    answer =
      retrieval.thresholdTriggered || retrievedChunks.length === 0
        ? FALLBACK_ANSWER
        : await answerFromRetrievedContext({
            question: test.question,
            retrievedContext: buildRetrievedContext(retrievedChunks),
          });
  }

  const evaluation = evaluateCase(test, answer, retrievedChunks, retrieval, pathName);

  return {
    id: test.id,
    category: test.category,
    question: test.question,
    path: pathName,
    answer,
    expectedType: test.expectedType,
    expectedFallback: Boolean(test.expectedFallback),
    isFallback: answer === FALLBACK_ANSWER,
    retrievedChunks: retrievedChunks.map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      type: chunk.type,
      stageId: chunk.stageId,
      score: chunk.score,
      semanticScore: chunk.semanticScore,
      lexicalBoost: chunk.lexicalBoost,
    })),
    topScore: retrieval?.topScore || null,
    thresholdTriggered: retrieval?.thresholdTriggered || false,
    critical: Boolean(test.critical),
    ...evaluation,
  };
}

function evaluateCase(test, answer, retrievedChunks, retrieval, pathName) {
  const failures = [];
  const isFallback = answer === FALLBACK_ANSWER;
  const answerText = normalize(answer);
  const retrievedText = normalize(retrievedChunks.map((chunk) => `${chunk.id} ${chunk.title} ${chunk.text} ${(chunk.relatedTerms || []).join(" ")}`).join(" "));

  const refusalPass = test.expectedFallback ? isFallback : !isFallback;

  if (!refusalPass) {
    failures.push(test.expectedFallback ? "refusal accuracy failure" : "unexpected fallback");
  }

  const conceptPass =
    test.expectedFallback ||
    (test.requiredConcepts || []).every((concept) => conceptMatches(answerText, concept));

  if (!conceptPass) {
    failures.push("required concept missing");
  }

  const retrievalPass =
    pathName === "deterministic" ||
    (test.expectedFallback
      ? Boolean(retrieval?.thresholdTriggered) || isFallback
      : (test.expectedChunkTerms || []).every((term) => conceptMatches(retrievedText, term)));

  if (!retrievalPass) {
    failures.push("retrieval relevance failure");
  }

  const sequencePass = !test.expectedSequence || sequenceMatches(answerText, test.expectedSequence);

  if (!sequencePass) {
    failures.push("sequence order failure");
  }

  const terminologyPass =
    test.category !== "terminology-preservation" ||
    !test.requiredConcepts?.some((concept) => containsEnglishConcept(concept)) ||
    containsRequiredEnglishTerms(answer, test.requiredConcepts);

  if (!terminologyPass) {
    failures.push("terminology preservation failure");
  }

  const groundingPass = test.expectedFallback || isGrounded(answer, retrievedText, pathName);

  if (!groundingPass) {
    failures.push("grounding failure");
  }

  return {
    pass: failures.length === 0,
    scores: {
      correctness: conceptPass,
      grounding: groundingPass,
      retrieval: retrievalPass,
      refusal: refusalPass,
      sequence: sequencePass,
      terminology: terminologyPass,
    },
    failureReason: failures.join("; "),
    failureType: classifyFailure(failures),
  };
}

function buildReport(results) {
  const metrics = {
    total: results.length,
    passCount: results.filter((result) => result.pass).length,
    failCount: results.filter((result) => !result.pass).length,
    overallAccuracy: percentage(results.filter((result) => result.pass).length, results.length),
    supportedAccuracy: percentage(
      results.filter((result) => !result.expectedFallback && result.pass).length,
      results.filter((result) => !result.expectedFallback).length,
    ),
    unsupportedRefusalAccuracy: percentage(
      results.filter((result) => result.expectedFallback && result.scores.refusal).length,
      results.filter((result) => result.expectedFallback).length,
    ),
    sequenceAccuracy: percentage(
      results.filter((result) => result.category === "workflow-sequence" && result.scores.sequence).length,
      results.filter((result) => result.category === "workflow-sequence").length,
    ),
    retrievalAccuracy: percentage(
      results.filter((result) => result.path === "rag" && result.scores.retrieval).length,
      results.filter((result) => result.path === "rag").length,
    ),
    byCategory: {},
  };

  for (const category of [...new Set(results.map((result) => result.category))]) {
    const categoryResults = results.filter((result) => result.category === category);
    metrics.byCategory[category] = {
      total: categoryResults.length,
      passCount: categoryResults.filter((result) => result.pass).length,
      failCount: categoryResults.filter((result) => !result.pass).length,
      accuracy: percentage(categoryResults.filter((result) => result.pass).length, categoryResults.length),
    };
  }

  const fieldResults = results.filter((result) => ["field-definition", "field-comparison"].includes(result.category));
  const criticalSequenceResults = results.filter((result) => result.critical && result.category === "workflow-sequence");

  return {
    timestamp: new Date().toISOString(),
    mode,
    pageId: PAGE_ID,
    metrics,
    thresholds: {
      overallAccuracyAtLeast90: metrics.overallAccuracy >= 90,
      unsupportedRefusalAccuracy100: metrics.unsupportedRefusalAccuracy === 100,
      criticalWorkflowSequence100: criticalSequenceResults.every((result) => result.pass),
      fieldAccuracyAtLeast90: percentage(fieldResults.filter((result) => result.pass).length, fieldResults.length) >= 90,
      phaseCanPass:
        metrics.overallAccuracy >= 90 &&
        metrics.unsupportedRefusalAccuracy === 100 &&
        criticalSequenceResults.every((result) => result.pass) &&
        percentage(fieldResults.filter((result) => result.pass).length, fieldResults.length) >= 90,
    },
    results,
    failures: results
      .filter((result) => !result.pass)
      .map((result) => ({
        id: result.id,
        question: result.question,
        expectedBehavior: result.expectedType,
        actualAnswer: result.answer,
        retrievedChunks: result.retrievedChunks,
        topScore: result.topScore,
        failureReason: result.failureReason,
        failureType: result.failureType,
      })),
  };
}

function printSummary(report) {
  console.log("");
  console.log(`mode=${report.mode}`);
  console.log(`total=${report.metrics.total}`);
  console.log(`pass=${report.metrics.passCount}`);
  console.log(`fail=${report.metrics.failCount}`);
  console.log(`overallAccuracy=${report.metrics.overallAccuracy}%`);
  console.log(`supportedAccuracy=${report.metrics.supportedAccuracy}%`);
  console.log(`unsupportedRefusalAccuracy=${report.metrics.unsupportedRefusalAccuracy}%`);
  console.log(`sequenceAccuracy=${report.metrics.sequenceAccuracy}%`);
  console.log(`retrievalAccuracy=${report.metrics.retrievalAccuracy}%`);
  console.log(`resultFile=${RESULT_PATH}`);
  console.log(`phaseCanPass=${report.thresholds.phaseCanPass}`);

  if (report.failures.length > 0) {
    console.log("");
    console.log("Failures:");
    for (const failure of report.failures) {
      console.log(`${failure.id}: ${failure.failureType} - ${failure.failureReason}`);
      console.log(`question=${failure.question}`);
      console.log(`answer=${failure.actualAnswer}`);
      console.log(`retrieved=${failure.retrievedChunks.map((chunk) => `${chunk.id}:${chunk.score}`).join(", ") || "none"}`);
    }
  }
}

function saveReport(report) {
  fs.mkdirSync(RESULT_DIR, { recursive: true });
  fs.writeFileSync(RESULT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function conceptMatches(text, concept) {
  if (Array.isArray(concept)) {
    return concept.some((item) => conceptMatches(text, item));
  }

  return text.includes(normalize(concept));
}

function sequenceMatches(text, expectedSequence) {
  let cursor = -1;

  for (const step of expectedSequence) {
    const index = text.indexOf(normalize(step), cursor + 1);

    if (index === -1) {
      return false;
    }

    cursor = index;
  }

  return true;
}

function containsEnglishConcept(concept) {
  if (Array.isArray(concept)) {
    return concept.some(containsEnglishConcept);
  }

  return /[A-Za-z]/.test(concept);
}

function containsRequiredEnglishTerms(answer, requiredConcepts) {
  const requiredTerms = flatten(requiredConcepts).filter((concept) => /[A-Za-z]/.test(concept));
  const normalizedAnswer = normalize(answer);

  return requiredTerms.every((term) => normalizedAnswer.includes(normalize(term)));
}

function isGrounded(answer, retrievedText, pathName) {
  if (pathName === "deterministic") {
    return true;
  }

  const importantTerms = extractImportantTerms(answer);

  if (importantTerms.length === 0) {
    return true;
  }

  return importantTerms.every((term) => retrievedText.includes(normalize(term)));
}

function extractImportantTerms(answer) {
  const englishTerms = answer.match(/\b[A-Za-z][A-Za-z0-9]*(?:\s+[A-Za-z][A-Za-z0-9]*)?\b/g) || [];
  return [...new Set(englishTerms.filter((term) => !ENGLISH_STOP_WORDS.has(term.toLowerCase())))];
}

function classifyFailure(failures) {
  if (failures.some((failure) => failure.includes("retrieval"))) return "retrieval failure";
  if (failures.some((failure) => failure.includes("fallback") || failure.includes("refusal"))) return "fallback threshold issue";
  if (failures.some((failure) => failure.includes("sequence"))) return "sequence error";
  if (failures.some((failure) => failure.includes("terminology"))) return "terminology mismatch";
  if (failures.some((failure) => failure.includes("grounding"))) return "LLM generation failure";
  if (failures.some((failure) => failure.includes("concept"))) return "LLM generation failure";
  return "knowledge gap";
}

function percentage(numerator, denominator) {
  if (!denominator) {
    return 100;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
}

function flatten(items) {
  return items.flatMap((item) => (Array.isArray(item) ? flatten(item) : item));
}

function normalize(value) {
  return String(value || "")
    .trim()
    .replace(/[؟?]/g, "")
    .replace(/[،,.;:()[\]{}"'`~!@#$%^&*_+=\\/|-]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const ENGLISH_STOP_WORDS = new Set(["a", "an", "and", "or", "the", "is", "are", "what", "how", "when", "who"]);

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
