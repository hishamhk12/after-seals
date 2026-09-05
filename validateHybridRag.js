const { FALLBACK_ANSWER } = require("./llmService");
const { buildHybridRetrievedContext, retrieveHybridChunks } = require("./hybridRetrievalService");

const PAGE_ID = "intro-tour";

const cases = [
  {
    question: "شو يعني Tasks؟",
    expectedSourceType: "page",
    expectedTerms: ["Tasks"],
  },
  {
    question: "شو تسلسل خدمة التوصيل؟",
    expectedSourceType: "page",
    expectedTerms: ["تسلسل خدمة التوصيل الكامل", "Tasks", "Completed"],
  },
  {
    question: "شو الخدمات الموجودة عنا؟",
    expectedSourceType: "global",
    expectedTerms: ["After-Sales system purpose", "خدمات ما بعد البيع"],
  },
  {
    question: "شو مشكلة ربط المنتج بالخدمة؟",
    expectedSourceType: "global",
    expectedTerms: ["Product-service relationship gap", "Product-Service"],
  },
  {
    question: "شو يعني تكملة لاحقًا؟",
    expectedSourceType: "global",
    expectedTerms: ["Partial", "تكملة لاحقًا"],
  },
  {
    question: "شو وضع ZCF2؟",
    expectedSourceType: "global",
    expectedTerms: ["ZCF2", "open"],
  },
  {
    question: "شو صار بمشكلة No eligible Operational Team؟",
    expectedSourceType: "global",
    expectedTerms: ["No eligible Operational Team", "observed"],
  },
  {
    question: "شو عاصمة اليابان؟",
    expectedFallback: true,
  },
];

async function main() {
  const results = [];

  for (const testCase of cases) {
    const retrieval = await retrieveHybridChunks({ pageId: PAGE_ID, question: testCase.question });
    const context = buildHybridRetrievedContext(retrieval.chunks);
    const top = retrieval.chunks[0] || null;
    const pass = evaluate(testCase, retrieval, context, top);
    results.push(pass);

    console.log(`${pass ? "PASS" : "FAIL"} ${testCase.question}`);
    console.log(`top=${top ? `${top.sourceType}:${top.id}:${top.score}:${top.status}` : "none"}`);
    console.log(`thresholdTriggered=${retrieval.thresholdTriggered}`);
  }

  console.log(`result=${results.every(Boolean) ? "PASS" : "FAIL"}`);

  if (!results.every(Boolean)) {
    process.exitCode = 1;
  }
}

function evaluate(testCase, retrieval, context, top) {
  if (testCase.expectedFallback) {
    return retrieval.thresholdTriggered && retrieval.chunks.length === 0;
  }

  if (!top || retrieval.thresholdTriggered || retrieval.chunks.length === 0) {
    return false;
  }

  if (top.sourceType !== testCase.expectedSourceType) {
    return false;
  }

  return testCase.expectedTerms.every((term) => normalize(context).includes(normalize(term)));
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
