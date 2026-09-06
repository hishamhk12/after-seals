const EXACT_ODOO_TERMS = [
  "Appointment From",
  "Appointment To",
  "Task Forms",
  "Trip Date",
  "End Task",
  "Assignees",
  "Completed",
  "Tasks",
  "Stage",
  "Assign",
  "Start",
  "OTP",
];

const SYNONYM_GROUPS = {
  workflow: {
    canonical: "تسلسل مراحل سير العمل workflow",
    terms: ["تسلسل", "فلو", "flow", "سايكل", "cycle", "مراحل", "خطوات", "ترتيب", "رحلة الخدمة", "سير العمل", "workflow"],
  },
  service: {
    canonical: "خدمة service",
    terms: ["خدمة", "خدمات", "service", "services", "delivery", "التوصيل"],
  },
  task: {
    canonical: "مهمة Task",
    terms: ["مهمة", "مهام", "task", "tasks", "تاسك", "التاسك"],
  },
  invoice: {
    canonical: "فاتورة Invoice",
    terms: ["فاتورة", "فواتير", "invoice", "invoices"],
  },
  appointment: {
    canonical: "موعد حجز Appointment Booking",
    terms: ["موعد", "مواعيد", "appointment", "appointments", "حجز", "booking", "الجدولة", "جدولة"],
  },
  driver: {
    canonical: "سائق منفذ الخدمة Driver",
    terms: ["سائق", "السائق", "سواق", "driver", "drivers", "مندوب", "المندوب"],
  },
  technician: {
    canonical: "فني Technician",
    terms: ["فني", "الفني", "فنيين", "technician", "technicians"],
  },
  supervisor: {
    canonical: "مشرف متابع Supervisor Assignees",
    terms: ["مشرف", "المشرف", "مشرفين", "supervisor", "متابع", "المتابع", "assignees"],
  },
  execution: {
    canonical: "تنفيذ بدء التنفيذ Execution Start",
    terms: ["تنفيذ", "التنفيذ", "execution", "شغل", "الشغل", "بدء التنفيذ", "start"],
  },
  completion: {
    canonical: "اكتمال انتهاء استلام الخدمة Completed",
    terms: ["اكتمال", "الاكتمال", "completed", "انتهاء", "النهاية", "خلصت الخدمة", "استلام الخدمة", "end task", "otp"],
  },
  form: {
    canonical: "نموذج Form Task Forms",
    terms: ["نموذج", "نماذج", "form", "forms", "فورم", "فورمز", "task form", "task forms"],
  },
  stage: {
    canonical: "مرحلة Stage",
    terms: ["مرحلة", "المرحلة", "مراحل", "stage", "stages", "حالة", "status"],
  },
};

const DIALECT_REPLACEMENTS = [
  [/(?:^|\s)بدي\s+اعرف(?:\s|$)/gu, " أريد معرفة "],
  [/(?:^|\s)شو\s+ب(?:ي)?صير(?:\s|$)/gu, " ماذا يحدث "],
  [/(?:^|\s)شلون(?:\s|$)/gu, " كيف "],
  [/(?:^|\s)هلق(?:\s|$)/gu, " الآن "],
  [/(?:^|\s)و?بعدين(?:\s|$)/gu, " بعد ذلك "],
  [/(?:^|\s)وين(?:\s|$)/gu, " اين "],
  [/(?:^|\s)(?:ايمت|إيمت)(?:\s|$)/gu, " متى "],
  [/(?:^|\s)ليش(?:\s|$)/gu, " لماذا "],
  [/(?:^|\s)لوين(?:\s|$)/gu, " الى اين "],
  [/(?:^|\s)يلي(?:\s|$)/gu, " الذي "],
  [/(?:^|\s)تبع(?:\s|$)/gu, " خاص بـ "],
  [/(?:^|\s)الشغلة(?:\s|$)/gu, " الخدمة "],
  [/(?:^|\s)شو(?:\s|$)/gu, " ماذا "],
];

function understandQuery(question) {
  const originalQuery = String(question || "").trim();
  const exactTerms = extractExactOdooTerms(originalQuery);
  const normalizedQuery = normalizeQuery(originalQuery);
  const concepts = detectConcepts(normalizedQuery);
  const intentScores = inferIntentScores(normalizedQuery, concepts, exactTerms);
  const rankedIntents = Object.entries(intentScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  const [primaryIntent = "unsupported", primaryScore = 0.2] = rankedIntents[0] || [];
  const secondaryIntents = rankedIntents.slice(1, 4).filter(([, score]) => score >= 0.45).map(([intent]) => intent);
  const expandedConcepts = concepts.map((concept) => SYNONYM_GROUPS[concept].canonical);
  const intentHint = primaryIntent === "unsupported" ? "" : INTENT_RETRIEVAL_HINTS[primaryIntent];
  const retrievalQuery = uniqueNonEmpty([
    originalQuery,
    normalizedQuery !== normalizeForMatching(originalQuery) ? normalizedQuery : "",
    intentHint,
    expandedConcepts.length ? `مفاهيم مرتبطة: ${expandedConcepts.join("؛ ")}` : "",
    exactTerms.length ? `مصطلحات Odoo الأصلية: ${exactTerms.join("، ")}` : "",
  ]).join("\n");

  return {
    originalQuery,
    normalizedQuery,
    retrievalQuery,
    primaryIntent,
    secondaryIntents,
    confidence: roundScore(primaryScore),
    concepts,
    exactTerms,
  };
}

function normalizeQuery(question) {
  let normalized = normalizeForMatching(question);

  for (const [pattern, replacement] of DIALECT_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized.replace(/\s+/g, " ").trim();
}

function inferIntentScores(normalizedQuery, concepts = detectConcepts(normalizedQuery), exactTerms = []) {
  const scores = Object.fromEntries(INTENTS.map((intent) => [intent, 0]));
  const has = (pattern) => pattern.test(normalizedQuery);
  const hasConcept = (concept) => concepts.includes(concept);
  const definitionQuestion = has(/(?:ماذا يعني|ما معنى|شو يعني|عرف|اشرح معنى)/u);
  const comparisonQuestion = has(/(?:ماذا الفرق|ما الفرق|الفرق بين|قارن)/u);
  const nextQuestion = has(/(?:ماذا يحدث\s+بعد|بعد\s+.+\s+ماذا يحدث|المرحلة\s+(?:التي|الذي)?\s*بعد|ماذا\s+(?:ال\s*)?(?:stage|مرحلة)\s+بعد|ماذا\s+بعد|بعدها|بعد ذلك)/u);
  const previousQuestion = has(/(?:ماذا كان\s+قبل|ماذا\s+قبل|قبل\s+.+|المرحلة\s+(?:التي|الذي)?\s*قبل|كان قبل)/u);
  const wholeJourney = has(/(?:ماذا\s+يحدث\s+من\s+(?:الاول|البداية)\s+(?:(?:الى|ل)\s*(?:الاخر|النهاية)|لل(?:اخر|نهاية))|الفلو\s+كامل|السايكل\s+كامل|كيف\s+(?:تمشي|بتمشي)\s+(?:الخدمة|خدمة|التوصيل)|من\s+اين\s+(?:تبدأ|بتبلش)\s+(?:الخدمة|خدمة|التوصيل)|اول\s+الفاتورة.*اخر)/u);
  const journeyQuestion = has(/^(?:ماذا|اشرح(?:لي)?)\s+(?:ال)?رحلة(?:\s+(?:الخدمة|التوصيل|كاملة))?$/u);
  const serviceListQuestion = has(/(?:الخدمات|خدمات)\s+(?:الموجودة|عنا|عندنا|المتاحة)/u);
  const currentStatusQuestion = has(/(?:stage|مرحلة|status|حالة)\s+(?:ال\s*)?(?:حالي|حالية)|وين\s+وصل/u);
  const adjacencyDomainSignal = exactTerms.length > 0 || concepts.some((concept) =>
    ["service", "task", "invoice", "appointment", "driver", "execution", "completion", "form", "stage"].includes(concept),
  );

  if (definitionQuestion && (exactTerms.length > 0 || concepts.some((concept) => ["task", "appointment", "form", "stage", "completion"].includes(concept)))) {
    scores.field_definition += 1;
  }

  if (comparisonQuestion && (exactTerms.length > 1 || hasConcept("supervisor") || hasConcept("driver"))) {
    scores.field_definition += 0.95;
  }

  if (nextQuestion && adjacencyDomainSignal) scores.next_step += 1.1;
  if (previousQuestion && adjacencyDomainSignal) scores.previous_step += 1.1;
  if ((hasConcept("workflow") && hasConcept("service")) || wholeJourney) scores.workflow_sequence += 0.9;
  if (journeyQuestion) scores.workflow_sequence += 0.75;
  if (hasConcept("workflow") && has(/(?:كامل|تسلسل|ترتيب|مراحل|خطوات|فلو|سايكل|رحلة)/u)) scores.workflow_sequence += 0.35;
  if (hasConcept("appointment")) scores.appointment_booking += 0.65;
  if (hasConcept("appointment") && has(/(?:عميل|موقع|تاريخ|وقت|تاكيد|رابط)/u)) scores.appointment_booking += 0.35;
  if (hasConcept("driver")) scores.driver_execution += 0.55;
  if (hasConcept("driver") && (hasConcept("execution") || hasConcept("completion") || nextQuestion)) scores.driver_execution += 0.4;
  if (has(/(?:مرتبط|مرتبطة|اعتماد|يعتمد|تركيب).*(?:توصيل|خدمة)|(?:توصيل|خدمة).*(?:مرتبط|مرتبطة|تركيب)/u)) scores.service_dependency += 1;
  if (serviceListQuestion) scores.service_list += 1.2;
  if (currentStatusQuestion) scores.current_status += 1;
  if (hasConcept("stage") && has(/(?:ماذا يحدث|اشرح|تفاصيل)/u)) scores.stage_explanation += 0.75;
  if (hasConcept("driver") && hasConcept("completion")) scores.driver_execution += 0.25;

  if (definitionQuestion) {
    scores.workflow_sequence *= 0.2;
    scores.stage_explanation *= 0.4;
  }

  if (serviceListQuestion) {
    scores.workflow_sequence *= 0.15;
    scores.service_list += 0.4;
  }

  if (scores.next_step > 0 || scores.previous_step > 0) {
    scores.workflow_sequence *= 0.35;
  }

  const domainSignal = concepts.length > 0 || exactTerms.length > 0 || scores.service_list > 0;
  scores.unsupported = domainSignal ? 0 : 0.3;

  return scores;
}

function calculateNluRecordBoost({ record, understanding, currentWorkflow = [] }) {
  if (!record || !understanding || understanding.primaryIntent === "unsupported") {
    return 0;
  }

  const recordText = normalizeForMatching([record.title, record.text, ...(record.relatedTerms || [])].join(" "));
  const currentStageTitles = currentWorkflow.map((stage) => normalizeForMatching(stage.title)).filter(Boolean);
  const coversCurrentWorkflow = currentStageTitles.length > 0 && currentStageTitles.every((title) => recordText.includes(title));
  const intents = new Set([understanding.primaryIntent, ...(understanding.secondaryIntents || [])]);
  let boost = 0;

  if (intents.has("workflow_sequence") && coversCurrentWorkflow) {
    boost += 0.22;
  }

  const referencesCurrentStage = currentWorkflow.some((stage) =>
    getDistinctiveStageTokens(stage.title).some((token) => understanding.normalizedQuery.includes(token)),
  );

  if ((intents.has("next_step") || intents.has("previous_step")) && referencesCurrentStage && coversCurrentWorkflow) {
    boost += 0.2;
  }

  if (intents.has("appointment_booking") && hasAllConceptTerms(recordText, [
    ["رابط حجز", "حجز الموعد"],
    ["موقع", "موقع التنفيذ"],
    ["تاريخ", "وقت", "الموعد"],
    ["تاكيد", "يؤكد"],
  ])) {
    boost += 0.1;
  }

  if (intents.has("driver_execution") && hasAllConceptTerms(recordText, [
    ["تعيين السائق", "ربط الخدمة بالسائق", "assign"],
    ["task forms", "ملئ النموذج", "ملء النموذج"],
    ["بوابة السائق", "driver portal"],
    "start",
    ["رفع صورة", "رفع الصورة"],
    "end task",
    "otp",
    "completed",
  ])) {
    boost += 0.18;
  }

  return Math.min(0.28, boost);
}

function getDistinctiveStageTokens(title) {
  return normalizeForMatching(title)
    .split(/\s+/u)
    .map((token) => token.replace(/^ال(?=.{3,})/u, ""))
    .filter((token) => token.length > 2 && !CURRENT_STAGE_STOP_WORDS.has(token));
}

function hasAllConceptTerms(text, concepts) {
  return concepts.every((concept) => {
    const alternatives = Array.isArray(concept) ? concept : [concept];
    return alternatives.some((alternative) => text.includes(normalizeForMatching(alternative)));
  });
}

function detectConcepts(normalizedQuery) {
  return Object.entries(SYNONYM_GROUPS)
    .filter(([, group]) => group.terms.some((term) => containsTerm(normalizedQuery, normalizeForMatching(term))))
    .map(([concept]) => concept);
}

function extractExactOdooTerms(question) {
  const value = String(question || "");
  return EXACT_ODOO_TERMS.filter((term) => new RegExp(`(^|[^A-Za-z])${escapeRegExp(term)}(?=$|[^A-Za-z])`, "iu").test(value));
}

function containsTerm(text, term) {
  if (!term) return false;
  if (/^[a-z0-9 ]+$/i.test(term)) {
    return new RegExp(`(^|\\s)${escapeRegExp(term)}(?=$|\\s)`, "iu").test(text);
  }
  return text.includes(term);
}

function normalizeForMatching(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/ـ/gu, "")
    .replace(/[أإآ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/[؟?،,.;:()[\]{}"'`~!@#$%^&*_+=\\/|-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueNonEmpty(values) {
  return [...new Set(values.filter(Boolean))];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function roundScore(score) {
  return Number(Math.min(1, score).toFixed(3));
}

const INTENTS = [
  "workflow_sequence",
  "field_definition",
  "next_step",
  "previous_step",
  "stage_explanation",
  "appointment_booking",
  "driver_execution",
  "service_dependency",
  "service_list",
  "current_status",
  "unsupported",
];

const INTENT_RETRIEVAL_HINTS = {
  workflow_sequence: "المقصود: تسلسل مراحل سير العمل الكامل لخدمة التوصيل من البداية إلى النهاية",
  field_definition: "المقصود: تعريف وشرح المصطلح أو الحقل المذكور",
  next_step: "المقصود: الخطوة أو المرحلة التالية ضمن مسار خدمة التوصيل الحالي",
  previous_step: "المقصود: الخطوة أو المرحلة السابقة ضمن مسار خدمة التوصيل الحالي",
  stage_explanation: "المقصود: شرح ما يحدث في المرحلة المذكورة",
  appointment_booking: "المقصود: جدولة موعد الخدمة وحجز العميل للموقع والتاريخ والوقت وتأكيد الموعد",
  driver_execution: "المقصود: تعيين منفذ الخدمة وتنفيذ السائق للمهمة حتى اكتمالها",
  service_dependency: "المقصود: اعتماد انتقال خدمة التوصيل على اكتمال الخدمة المرتبطة",
  service_list: "المقصود: قائمة خدمات ما بعد البيع الموجودة",
  current_status: "المقصود: المرحلة أو الحالة الحالية للمهمة",
};

const CURRENT_STAGE_STOP_WORDS = new Set(["خدمة", "توصيل", "مرحلة", "stage", "sap"]);

module.exports = {
  EXACT_ODOO_TERMS,
  INTENTS,
  SYNONYM_GROUPS,
  calculateNluRecordBoost,
  detectConcepts,
  inferIntentScores,
  normalizeQuery,
  understandQuery,
};
