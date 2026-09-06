const NLU_FALLBACK_ANSWER = "المعلومة غير متوفرة ضمن هذه الصفحة.";

const nluEvaluationDataset = [
  workflowCase("nlu-workflow-001", "شو الفلو؟"),
  workflowCase("nlu-workflow-002", "شو السايكل؟"),
  workflowCase("nlu-workflow-003", "شو ترتيب الخدمة؟"),
  workflowCase("nlu-workflow-004", "كيف بتمشي الخدمة؟"),
  workflowCase("nlu-workflow-005", "شو مراحل التوصيل؟"),
  workflowCase("nlu-workflow-006", "شو بيصير من البداية للنهاية؟"),
  workflowCase("nlu-workflow-007", "شو ال flow تبع delivery؟", "mixed-language"),
  workflowCase("nlu-workflow-008", "اشرحلي الرحلة كاملة"),
  workflowCase("nlu-workflow-009", "اشرحلي الفلو كامل"),
  workflowCase("nlu-workflow-010", "كيف بتمشي الشغلة؟", "dialect"),
  workflowCase("nlu-workflow-011", "شو بيصير من الأول للآخر؟", "dialect"),
  workflowCase("nlu-workflow-012", "شو الرحلة؟", "dialect"),
  workflowCase("nlu-workflow-013", "شو السايكل كامل؟", "dialect"),

  nextStepCase("nlu-next-001", "شو بعد طلب توصيل؟", "جدولة التوصيل"),
  nextStepCase("nlu-next-002", "بعد الجدولة شو بصير؟", "ربط الخدمة بالسائق"),
  nextStepCase("nlu-next-003", "شو بعد ربط الخدمة بالسائق؟", ["ملئ النموذج", "ملء النموذج"]),
  nextStepCase("nlu-next-004", "شو المرحلة يلي بعد ربط الخدمة بالسائق؟", ["ملئ النموذج", "ملء النموذج"]),
  nextStepCase("nlu-next-005", "شو stage بعد جدولة التوصيل؟", "ربط الخدمة بالسائق", "mixed-language"),
  nextStepCase("nlu-next-006", "بعد ملئ النموذج شو بيصير؟", "جاري التوصيل"),

  previousStepCase("nlu-previous-001", "شو قبل جاري التوصيل؟", ["ملئ النموذج", "ملء النموذج"]),
  previousStepCase("nlu-previous-002", "شو قبل ملئ النموذج؟", "ربط الخدمة بالسائق"),
  previousStepCase("nlu-previous-003", "شو كان قبل جاري التوصيل؟", ["ملئ النموذج", "ملء النموذج"]),
  previousStepCase("nlu-previous-004", "شو قبل جدولة التوصيل؟", "طلب توصيل"),

  {
    id: "nlu-mixed-001",
    category: "mixed-language",
    question: "شو يعني Task Forms؟",
    expectedIntent: "field_definition",
    requiredConcepts: ["Task Forms", ["نموذج", "نماذج"], "المهمة"],
  },
  {
    id: "nlu-mixed-002",
    category: "mixed-language",
    question: "بعد End Task شو بصير؟",
    expectedIntent: "next_step",
    requiredConcepts: ["End Task", "OTP", "Completed"],
    expectedSequence: ["End Task", "OTP", "Completed"],
  },
  {
    id: "nlu-mixed-003",
    category: "mixed-language",
    question: "شو الفرق بين Assign و Assignees؟",
    expectedIntent: "field_definition",
    requiredConcepts: ["Assign", "Assignees", ["السائق", "المنفذ"], ["المشرف", "متابعة"]],
  },
  {
    id: "nlu-mixed-004",
    category: "mixed-language",
    question: "شو ال Stage الحالي؟",
    expectedIntent: "current_status",
    requiredConcepts: ["Stage", ["الصفحة", "التدريب", "سجل", "مهمة محددة", "لا يمكن"]],
  },
  {
    id: "nlu-mixed-005",
    category: "mixed-language",
    question: "شو بيصير بعد assign؟",
    expectedIntent: "next_step",
    requiredConcepts: [["Task Forms", "ملئ النموذج", "ملء النموذج"], ["بوابة السائق", "Start"]],
  },

  workflowCase("nlu-dialect-001", "شلون بتمشي خدمة التوصيل؟", "dialect"),
  {
    id: "nlu-dialect-002",
    category: "dialect",
    question: "بعدين شو بيصير مع السائق؟",
    expectedIntent: "next_step",
    requiredConcepts: [["السائق", "Assign"], ["Task Forms", "نموذج"], ["Start", "بوابة السائق"], "Completed"],
  },
  workflowCase("nlu-dialect-003", "من وين بتبلش الشغلة؟", "dialect"),

  workflowCase("nlu-number-001", "شو تسلسل الخدمة؟", "singular-plural"),
  workflowCase("nlu-number-002", "شو تسلسل الخدمات؟", "singular-plural"),

  {
    id: "nlu-service-list-001",
    category: "intent-boundary",
    question: "شو الخدمات الموجودة عنا؟",
    expectedIntent: "service_list",
    requiredConcepts: [["الخدمات", "خدمة"], ["التوصيل", "التركيب"]],
  },
  {
    id: "nlu-definition-001",
    category: "intent-boundary",
    question: "شو يعني Stage؟",
    expectedIntent: "field_definition",
    requiredConcepts: ["Stage", "المهمة", "مرحلة"],
  },
  {
    id: "nlu-definition-002",
    category: "intent-boundary",
    question: "شو يعني OTP؟",
    expectedIntent: "field_definition",
    requiredConcepts: ["OTP", ["رمز", "تأكيد"]],
  },

  unsupportedCase("nlu-unsupported-001", "شو عاصمة اليابان؟"),
  unsupportedCase("nlu-unsupported-002", "كيف اطبخ كبسة؟"),
  unsupportedCase("nlu-unsupported-003", "كم عمر الشمس؟"),
];

function workflowCase(id, question, category = "workflow-paraphrase") {
  return {
    id,
    category,
    question,
    expectedIntent: "workflow_sequence",
    requiredConcepts: ["فاتورة من SAP", "طلب توصيل", "جدولة التوصيل", "ربط الخدمة بالسائق", ["ملئ النموذج", "ملء النموذج"], "جاري التوصيل", "استلام الخدمة"],
    expectedSequence: ["فاتورة من SAP", "طلب توصيل", "جدولة التوصيل", "ربط الخدمة بالسائق", ["ملئ النموذج", "ملء النموذج"], "جاري التوصيل", "استلام الخدمة"],
  };
}

function nextStepCase(id, question, expectedStep, category = "next-step") {
  return { id, category, question, expectedIntent: "next_step", requiredConcepts: [expectedStep] };
}

function previousStepCase(id, question, expectedStep) {
  return { id, category: "previous-step", question, expectedIntent: "previous_step", requiredConcepts: [expectedStep] };
}

function unsupportedCase(id, question) {
  return {
    id,
    category: "unsupported",
    question,
    expectedIntent: "unsupported",
    expectedFallback: true,
    expectedAnswer: NLU_FALLBACK_ANSWER,
  };
}

module.exports = { NLU_FALLBACK_ANSWER, nluEvaluationDataset };
