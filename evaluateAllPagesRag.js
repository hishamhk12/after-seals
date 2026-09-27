// End-to-end evaluation of every page assistant and the global After-Sales assistant.
//   node evaluateAllPagesRag.js            all cases
//   node evaluateAllPagesRag.js design     only cases whose pageId or id contains "design"
const fs = require("node:fs");
const path = require("node:path");
const { ERROR_ANSWER, handleAskPayload } = require("./askHandler");
const { buildGlobalKnowledgeChunks } = require("./globalKnowledgeStore");
const { buildKnowledgeChunks, pageKnowledge } = require("./pageKnowledge");
const { allPagesRagEvaluationDataset } = require("./allPagesRagEvaluationDataset");

const RESULT_PATH = path.join(__dirname, "data", "evaluation", "all-pages-rag-latest.json");
const MAX_ATTEMPTS = 4;

// Phrases that mean "this is not documented" (the refusal may be the exact fallback or a sentence).
const REFUSAL_MARKERS = [
  "المعلومة غير متوفرة",
  "غير موثق",
  "غير موثقة",
  "غير متوفرة",
  "غير متوفر",
  "لا تتوفر",
  "لم يتم توثيق",
  "لا توضح",
  "لا تحدد",
  "لا يحدد",
  "غير محدد",
  "لا تذكر",
  "لم تذكر",
  "لم يرد",
  "لا يوجد ما يشير",
  "لا تتضمن",
  "لا يتضمن",
  "لم تُذكر",
];

const serviceOfGlobalChunk = new Map(buildGlobalKnowledgeChunks().map((chunk) => [chunk.id, chunk.service || []]));
const servicesOfPage = (pageId) => buildKnowledgeChunks(pageId)[0]?.metadata?.services || [];

async function main() {
  const filter = process.argv[2];
  const tests = allPagesRagEvaluationDataset.filter((test) => !filter || test.pageId.includes(filter) || test.id.includes(filter));
  const results = [];

  for (const test of tests) {
    const result = await runWithRetry(test);
    results.push(result);
    console.log(`${result.pass ? "PASS" : "FAIL"} ${test.id} [${test.category}] path=${result.path}${result.pass ? "" : ` — ${result.failures.join("; ")}`}`);
  }

  const report = buildReport(results);
  fs.mkdirSync(path.dirname(RESULT_PATH), { recursive: true });
  fs.writeFileSync(RESULT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  printReport(report);
  if (report.metrics.failCount > 0) process.exitCode = 1;
}

async function runWithRetry(test) {
  let result = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    result = await runCase(test);
    if (result.answer !== ERROR_ANSWER) return result;
    await new Promise((resolve) => setTimeout(resolve, 4000 * attempt));
  }
  return result;
}

async function runCase(test) {
  const logs = [];
  const logger = { log: (line) => logs.push(String(line)), error: (line) => logs.push(`ERROR ${line}`) };
  const response = await handleAskPayload({ pageId: test.pageId, question: test.question }, logger);
  const answer = response.payload?.answer || "";
  const retrieved = parseRetrieved(logs);
  const pathLine = logs.find((line) => line.startsWith("Retrieval path:")) || "";
  const pathName = pathLine ? pathLine.replace("Retrieval path: ", "").split(";")[0] : test.pageId === "after-sales-global" ? "global" : "unknown";
  const failures = [];
  const normalizedAnswer = normalize(answer);

  if (answer === ERROR_ANSWER) failures.push("error answer");

  if (test.expectFallback) {
    if (!isRefusal(answer)) failures.push("unsupported question was answered instead of refused");
  } else if (isPureFallback(answer)) {
    failures.push("supported question fell back");
  }

  for (const group of test.expect || []) {
    if (!group.some((term) => normalizedAnswer.includes(normalize(term)))) failures.push(`missing: ${group.join(" | ")}`);
  }

  for (const group of test.forbid || []) {
    const hit = group.find((term) => term && normalizedAnswer.includes(normalize(term)));
    if (hit) failures.push(`forbidden term present: ${hit}`);
  }

  if (test.sequence?.length && !appearsInOrder(normalizedAnswer, test.sequence.map(normalize))) {
    failures.push("stage sequence missing or out of order");
  }

  if (test.minDistinct) {
    const [groups, minimum] = test.minDistinct;
    const found = groups.filter((group) => group.some((term) => normalizedAnswer.includes(normalize(term)))).length;
    if (found < minimum) failures.push(`ambiguous answer covers ${found}/${minimum} services`);
  }

  for (const pageId of test.expectPages || []) {
    if (!retrieved.some((item) => item.id.startsWith(`${pageId}:`))) failures.push(`page not retrieved: ${pageId}`);
  }

  // Page assistants: nothing from an unrelated service may be retrieved.
  if (test.pageId !== "after-sales-global" && pageKnowledge[test.pageId]) {
    const offService = retrieved.filter((item) => isOffService(test, item));
    if (offService.length) failures.push(`off-service chunks retrieved: ${offService.map((item) => item.id).join(", ")}`);
  }

  return {
    id: test.id,
    pageId: test.pageId,
    category: test.category,
    question: test.question,
    answer,
    path: pathName,
    retrieved,
    pass: failures.length === 0,
    failures,
  };
}

// Same rule as page-mode retrieval: service-tagged chunks must belong to the page's own service or
// to a service the question names; a documented related service is allowed except for workflow
// (stage) chunks.
function isOffService(test, item) {
  const knowledge = pageKnowledge[test.pageId];
  const related = knowledge.relatedServices || (test.pageId === "intro-tour" ? ["internal_transfer", "installation"] : []);
  const isWorkflowChunk = item.sourceType !== "global" || /^global:global-after-sales:workflow:/.test(item.id);
  const allowed = new Set([...servicesOfPage(test.pageId), ...mentionedServiceKeys(test.question), ...(isWorkflowChunk ? [] : related)]);
  const services = item.sourceType === "global" ? serviceOfGlobalChunk.get(item.id.replace(/^global:/, "")) || [] : servicesOfPage(item.id.split(":")[0]);
  return services.length > 0 && !services.some((service) => allowed.has(service));
}

function mentionedServiceKeys(question) {
  const { detectMentionedServices } = require("./hybridRetrievalService");
  return detectMentionedServices(question);
}

// Parses "retrieved=page:<id>:<score>:<status>, global:<id>:..." (page) or "retrieved=page:<id>:<score>, ..." (global).
function parseRetrieved(logs) {
  const line = logs.find((entry) => entry.includes("retrieved="));
  if (!line) return [];
  const value = line.split("retrieved=")[1].split(";")[0].trim();
  if (!value || value === "none") return [];
  return value.split(", ").map((entry) => {
    const [sourceType, ...rest] = entry.split(":");
    const withoutScore = rest.slice(0, rest.findIndex((part) => /^-?\d+(\.\d+)?$/.test(part)));
    const id = withoutScore.join(":");
    return { sourceType, id: sourceType === "global" ? `global:${id.replace(/^global:/, "")}` : id };
  });
}

function isPureFallback(answer) {
  return /^\s*المعلومة غير (متوفرة ضمن هذه الصفحة|موثقة ضمن مسارات خدمات ما بعد البيع الحالية)\.?\s*$/u.test(answer);
}

function isRefusal(answer) {
  const normalized = normalize(answer);
  return REFUSAL_MARKERS.some((marker) => normalized.includes(normalize(marker)));
}

function appearsInOrder(text, items) {
  let cursor = -1;
  for (const item of items) {
    const index = text.indexOf(item, cursor + 1);
    if (index === -1) return false;
    cursor = index;
  }
  return true;
}

function normalize(value) {
  return String(value || "")
    .replace(/[ً-ٰٟ]/gu, "")
    .replace(/ـ/gu, "")
    .replace(/[أإآ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/\*\*/gu, "")
    .replace(/\s+/gu, " ")
    .toLowerCase();
}

function buildReport(results) {
  const summarize = (items) => ({
    total: items.length,
    passCount: items.filter((item) => item.pass).length,
    failCount: items.filter((item) => !item.pass).length,
    accuracy: items.length ? Number(((items.filter((item) => item.pass).length / items.length) * 100).toFixed(2)) : 0,
  });
  const group = (key) =>
    Object.fromEntries([...new Set(results.map((item) => item[key]))].map((value) => [value, summarize(results.filter((item) => item[key] === value))]));

  return {
    timestamp: new Date().toISOString(),
    metrics: { ...summarize(results), byCategory: group("category"), byPage: group("pageId") },
    results,
  };
}

function printReport(report) {
  const { metrics } = report;
  console.log(`\ntotal=${metrics.total} pass=${metrics.passCount} fail=${metrics.failCount} accuracy=${metrics.accuracy}%`);
  console.log("byCategory:");
  for (const [category, value] of Object.entries(metrics.byCategory)) console.log(`  ${category}: ${value.passCount}/${value.total}`);
  console.log("byPage:");
  for (const [pageId, value] of Object.entries(metrics.byPage)) console.log(`  ${pageId}: ${value.passCount}/${value.total}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
