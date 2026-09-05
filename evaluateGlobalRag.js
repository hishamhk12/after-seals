const fs = require("node:fs");
const path = require("node:path");
const { answerFromRetrievedContext, FALLBACK_ANSWER } = require("./llmService");
const { buildHybridRetrievedContext, retrieveHybridChunks } = require("./hybridRetrievalService");
const { findSupportedAnswer } = require("./pageKnowledge");
const { globalRagEvaluationDataset } = require("./globalRagEvaluationDataset");

const PAGE_ID = "intro-tour";
const RESULT_DIR = path.join(__dirname, "data", "evaluation");
const RESULT_PATH = path.join(RESULT_DIR, "global-rag-latest.json");
const MAX_CASE_RETRIES = 4;

async function main() {
  const results = [];

  for (const test of globalRagEvaluationDataset) {
    const result = await runCaseWithRetry(test);
    results.push(result);
    console.log(`${result.pass ? "PASS" : "FAIL"} ${test.id} ${test.category} path=${result.path}`);
  }

  const report = buildReport(results);
  saveReport(report);
  printSummary(report);

  if (!report.phaseCanPass) {
    process.exitCode = 1;
  }
}

async function runCaseWithRetry(test) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_CASE_RETRIES; attempt += 1) {
    try {
      return await runCase(test);
    } catch (error) {
      lastError = error;

      if (!isRateLimitError(error) || attempt === MAX_CASE_RETRIES) {
        break;
      }

      const waitMs = 2000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      console.warn(`429 during ${test.id} - retrying in ${Math.round(waitMs / 1000)}s`);
      await delay(waitMs);
    }
  }

  return buildErrorResult(test, lastError);
}

async function runCase(test) {
  let pathName = "hybrid";
  let retrieval = null;
  let chunks = [];
  let answer = "";

  const deterministicAnswer = findSupportedAnswer(PAGE_ID, test.question);
  if (deterministicAnswer) {
    pathName = "deterministic";
    answer = deterministicAnswer;
  } else {
    retrieval = await retrieveHybridChunks({ pageId: PAGE_ID, question: test.question });
    chunks = retrieval.chunks;
    answer =
      retrieval.thresholdTriggered || chunks.length === 0
        ? FALLBACK_ANSWER
        : await answerFromRetrievedContext({
            question: test.question,
            retrievedContext: buildHybridRetrievedContext(chunks),
          });
  }

  const evaluation = evaluateCase(test, answer, chunks, retrieval, pathName);

  return {
    id: test.id,
    category: test.category,
    question: test.question,
    path: pathName,
    answer,
    expectedFallback: Boolean(test.expectedFallback),
    isFallback: answer === FALLBACK_ANSWER,
    expectedSourceType: test.expectedSourceType,
    expectedStatus: test.expectedStatus,
    expectedServices: test.expectedServices,
    expectedChunkIds: test.expectedChunkIds,
    statusSensitive: Boolean(test.statusSensitive),
    retrievedChunks: chunks.map(summarizeChunk),
    topScore: retrieval?.topScore || null,
    thresholdTriggered: retrieval?.thresholdTriggered || false,
    ...evaluation,
  };
}

function evaluateCase(test, answer, chunks, retrieval, pathName) {
  const failures = [];
  const top = chunks[0] || null;
  const isFallback = answer === FALLBACK_ANSWER;
  const retrievedText = normalize(chunks.map((chunk) => `${chunk.id} ${chunk.title} ${chunk.status} ${(chunk.service || []).join(" ")} ${chunk.text} ${(chunk.relatedTerms || []).join(" ")}`).join(" "));
  const answerText = normalize(answer);
  const expectedMatches = chunks.filter((chunk) => matchesExpectedChunk(test, chunk, retrievedText));

  const refusalPass = test.expectedFallback ? isFallback : !isFallback;
  if (!refusalPass) {
    failures.push(test.expectedFallback ? "unsupported refusal failure" : "unexpected fallback");
  }

  const retrievalPass =
    test.expectedFallback ||
    pathName === "deterministic" ||
    expectedMatches.length > 0 ||
    test.expectedChunkIds.some((id) => retrievedText.includes(normalize(id)));
  if (!retrievalPass) {
    failures.push("retrieval accuracy failure");
  }

  const sourcePass =
    test.expectedFallback ||
    pathName === "deterministic" ||
    !test.expectedSourceType ||
    expectedMatches.some((chunk) => chunk.sourceType === test.expectedSourceType) ||
    top?.sourceType === test.expectedSourceType;
  if (!sourcePass) {
    failures.push("source routing failure");
  }

  const statusPass =
    test.expectedFallback ||
    pathName === "deterministic" ||
    !test.expectedStatus ||
    expectedMatches.some((chunk) => chunk.status === test.expectedStatus) ||
    chunks.some((chunk) => chunk.status === test.expectedStatus);
  if (!statusPass) {
    failures.push("status accuracy failure");
  }

  const servicePass =
    test.expectedFallback ||
    pathName === "deterministic" ||
    !test.expectedServices?.length ||
    test.expectedServices.every((service) => chunks.some((chunk) => (chunk.service || []).includes(service)));
  if (!servicePass) {
    failures.push("service routing failure");
  }

  const answerPass = test.expectedFallback
    ? answer === FALLBACK_ANSWER
    : (test.expectedAnswerTerms || []).every((term) => conceptMatches(answerText, term));
  if (!answerPass) {
    failures.push("answer concept failure");
  }

  const statusProtectionPass = test.expectedFallback || !test.statusSensitive || protectsStatus(test, answerText);
  if (!statusProtectionPass) {
    failures.push("status protection failure");
  }

  return {
    pass: failures.length === 0,
    scores: {
      answer: answerPass,
      retrieval: retrievalPass,
      refusal: refusalPass,
      service: servicePass,
      source: sourcePass,
      status: statusPass,
      statusProtection: statusProtectionPass,
    },
    failureReason: failures.join("; "),
  };
}

function protectsStatus(test, answerText) {
  if (["open", "unconfirmed"].includes(test.expectedStatus)) {
    return ["غير", "ليس", "لم", "مفتوح", "مفتوحة", "محسوم", "مؤكد", "نهائي", "قيد", "غير مكتمل", "unconfirmed", "open"].some((term) => answerText.includes(normalize(term)));
  }

  if (test.expectedStatus === "proposed") {
    return ["مقترح", "مقترحة", "proposed", "ممكن", "لاحق", "مستقبلي", "اقتراح"].some((term) => answerText.includes(normalize(term)));
  }

  if (test.expectedStatus === "observed") {
    return ["لوحظ", "ملاحظة", "ملاحظتها", "observed", "uat", "اختبار", "ظهر", "تعذر", "إفادة", "أفاد", "أوضح", "اعترض", "تم الاعتراض", "قد يستخدم"].some((term) => answerText.includes(normalize(term)));
  }

  if (test.expectedStatus === "historical_test") {
    return ["اختبار", "uat", "مثال", "historical", "فاتورة", "invoice"].some((term) => answerText.includes(normalize(term)));
  }

  if (test.expectedStatus === "requirement") {
    return ["يجب", "لازم", "مطلوب", "requirement", "ينبغي", "المفروض", "يفترض", "ي فترض", "يشترط", "المتطلب", "المتطلبات"].some((term) => answerText.includes(normalize(term)));
  }

  return true;
}

function matchesExpectedChunk(test, chunk) {
  return test.expectedChunkIds.some((id) => chunk.id.endsWith(id) || chunk.id === id || chunk.itemId === id);
}

function buildReport(results) {
  const supported = results.filter((result) => !result.expectedFallback);
  const unsupported = results.filter((result) => result.expectedFallback);
  const statusSensitive = supported.filter((result) => result.statusSensitive);

  const report = {
    timestamp: new Date().toISOString(),
    pageId: PAGE_ID,
    metrics: {
      total: results.length,
      passCount: results.filter((result) => result.pass).length,
      failCount: results.filter((result) => !result.pass).length,
      overallAccuracy: percentage(results.filter((result) => result.pass).length, results.length),
      supportedAccuracy: percentage(supported.filter((result) => result.pass).length, supported.length),
      unsupportedRefusalAccuracy: percentage(unsupported.filter((result) => result.scores.refusal).length, unsupported.length),
      statusAccuracy: percentage(statusSensitive.filter((result) => result.scores.status && result.scores.statusProtection).length, statusSensitive.length),
      serviceRoutingAccuracy: percentage(supported.filter((result) => result.scores.service).length, supported.length),
      retrievalAccuracy: percentage(supported.filter((result) => result.scores.retrieval).length, supported.length),
    },
    results,
    failures: results.filter((result) => !result.pass).map((result) => ({
      id: result.id,
      question: result.question,
      expectedTopic: result.expectedChunkIds,
      expectedStatus: result.expectedStatus,
      expectedServices: result.expectedServices,
      answer: result.answer,
      retrievedChunks: result.retrievedChunks,
      reason: result.failureReason,
    })),
  };

  report.phaseCanPass = report.metrics.overallAccuracy >= 90 && report.metrics.unsupportedRefusalAccuracy === 100;
  return report;
}

function printSummary(report) {
  console.log("");
  console.log(`total=${report.metrics.total}`);
  console.log(`pass=${report.metrics.passCount}`);
  console.log(`fail=${report.metrics.failCount}`);
  console.log(`overallAccuracy=${report.metrics.overallAccuracy}%`);
  console.log(`supportedAccuracy=${report.metrics.supportedAccuracy}%`);
  console.log(`unsupportedRefusalAccuracy=${report.metrics.unsupportedRefusalAccuracy}%`);
  console.log(`statusAccuracy=${report.metrics.statusAccuracy}%`);
  console.log(`serviceRoutingAccuracy=${report.metrics.serviceRoutingAccuracy}%`);
  console.log(`retrievalAccuracy=${report.metrics.retrievalAccuracy}%`);
  console.log(`resultFile=${RESULT_PATH}`);
  console.log(`phaseCanPass=${report.phaseCanPass}`);

  if (report.failures.length > 0) {
    console.log("");
    console.log("Failures:");
    for (const failure of report.failures) {
      console.log(`${failure.id}: ${failure.reason}`);
      console.log(`question=${failure.question}`);
      console.log(`expectedTopic=${failure.expectedTopic.join(", ")}`);
      console.log(`expectedStatus=${failure.expectedStatus || ""}`);
      console.log(`answer=${failure.answer}`);
      console.log(`retrieved=${failure.retrievedChunks.map((chunk) => `${chunk.sourceType}:${chunk.id}:${chunk.score}:${chunk.status}`).join(", ") || "none"}`);
    }
  }
}

function summarizeChunk(chunk) {
  return {
    id: chunk.id,
    sourceType: chunk.sourceType,
    title: chunk.title,
    type: chunk.type,
    status: chunk.status,
    service: chunk.service || [],
    domain: chunk.domain,
    score: chunk.score,
    semanticScore: chunk.semanticScore,
    lexicalBoost: chunk.lexicalBoost,
    sourceBoost: chunk.sourceBoost,
    serviceBoost: chunk.serviceBoost,
    intentBoost: chunk.intentBoost,
  };
}

function saveReport(report) {
  fs.mkdirSync(RESULT_DIR, { recursive: true });
  fs.writeFileSync(RESULT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function buildErrorResult(test, error) {
  const message = error?.message || String(error);
  return {
    id: test.id,
    category: test.category,
    question: test.question,
    path: "error",
    answer: "",
    expectedFallback: Boolean(test.expectedFallback),
    isFallback: false,
    expectedSourceType: test.expectedSourceType,
    expectedStatus: test.expectedStatus,
    expectedServices: test.expectedServices,
    expectedChunkIds: test.expectedChunkIds,
    retrievedChunks: [],
    topScore: null,
    thresholdTriggered: false,
    pass: false,
    scores: {
      answer: false,
      retrieval: false,
      refusal: false,
      service: false,
      source: false,
      status: false,
      statusProtection: false,
    },
    failureReason: `runtime error: ${message}`,
  };
}

function conceptMatches(text, concept) {
  if (Array.isArray(concept)) {
    return concept.some((item) => conceptMatches(text, item));
  }

  return text.includes(normalize(concept));
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[؟?]/g, "")
    .replace(/[،,.;:()[\]{}"'`~!@#$%^&*_+=\\/|-]/g, " ")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/\s+/g, " ");
}

function percentage(numerator, denominator) {
  if (!denominator) return 100;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function isRateLimitError(error) {
  return /429|RESOURCE_EXHAUSTED|Too Many Requests/i.test(error?.message || "");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
