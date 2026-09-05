const { handleAskPayload, FALLBACK_ANSWER } = require("./askHandler");

const PAGE_ID = "intro-tour";

const cases = [
  {
    question: "شو يعني Tasks؟",
    expectedTerms: ["Tasks", "مهمة التوصيل", "الفاتورة"],
  },
  {
    question: "شو تسلسل خدمة التوصيل؟",
    expectedTerms: ["الفاتورة", "Tasks", "مهمة التوصيل", "Appointment From", "Appointment To", "Completed"],
  },
  {
    question: "شو الخدمات الموجودة عنا؟",
    expectedTerms: [["رفع القياسات", "القياسات"], ["خدمة التوصيل", "التوصيل"], ["خدمة التصنيع", "التصنيع"], ["خدمة التركيب", "التركيب"], ["خدمة التصميم", "التصميم"], ["التحويلات الداخلية", "النقل الداخلي", "المناقلات الداخلية", "Internal transfers"], ["الصيانة الميدانية", "الصيانة"]],
  },
  {
    question: "شو مشكلة ربط المنتج بالخدمة؟",
    expectedTerms: ["SAP", "Odoo", ["Product", "المنتج"], ["Service", "الخدمة"]],
  },
  {
    question: "شو يعني تكملة لاحقًا؟",
    expectedTerms: [["تكملة لاحقًا", "موعد تكملة", "لاحقاً", "وقت لاحق", "تنفيذ جزئي"], "جزء", "المتبقية"],
  },
  {
    question: "شو وضع ZCF2؟",
    expectedTerms: ["ZCF2", ["غير محسوم", "لم يُحسم", "لم يحسم", "غير محدد"]],
  },
  {
    question: "شو صار بمشكلة No eligible Operational Team؟",
    expectedTerms: ["No eligible Operational Team", "UAT"],
  },
  {
    question: "شو عاصمة اليابان؟",
    expectedFallback: true,
  },
];

async function main() {
  const results = [];

  for (const testCase of cases) {
    const result = await handleAskPayload({ pageId: PAGE_ID, question: testCase.question }, { log() {}, error: console.error });
    const answer = result.payload.answer || "";
    const pass = evaluate(testCase, answer);
    results.push(pass);

    console.log(`${pass ? "PASS" : "FAIL"} ${testCase.question}`);
    console.log(`status=${result.statusCode}`);
    console.log(`answer=${answer}`);
  }

  console.log(`result=${results.every(Boolean) ? "PASS" : "FAIL"}`);

  if (!results.every(Boolean)) {
    process.exitCode = 1;
  }
}

function evaluate(testCase, answer) {
  if (testCase.expectedFallback) {
    return answer === FALLBACK_ANSWER;
  }

  if (answer === FALLBACK_ANSWER) {
    return false;
  }

  return testCase.expectedTerms.every((term) => conceptMatches(answer, term));
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u064b-\u065f\u0670]/g, "");
}

function conceptMatches(answer, concept) {
  const normalizedAnswer = normalize(answer);

  if (Array.isArray(concept)) {
    return concept.some((term) => normalizedAnswer.includes(normalize(term)));
  }

  return normalizedAnswer.includes(normalize(concept));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
