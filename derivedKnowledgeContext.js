// Deterministic context blocks derived from the page knowledge (the single canonical source for
// each workflow). They are prepended to the retrieved chunks so the LLM answers structural
// questions — service list, stage N, responsibilities, manual vs automatic — from exact data.
const { pageKnowledge } = require("./pageKnowledge");
const { SERVICE_NAMES } = require("./knowledge/pages/structuredPageKnowledge");

const AUTOMATION_PATTERN = /(?:آلي|الي(?:ة)?\b|آلية|يدوي|يدوية|تلقائي|اوتوماتيك|أوتوماتيك|automatic|manual|automated)/iu;
const RESPONSIBILITY_PATTERN = /(?:مسؤول|المسؤول|مسئول|مين\s+(?:بيعمل|يعمل|بنفذ|ينفذ)|من\s+(?:يقوم|ينفذ|يتولى)|الجهة|جهة|الإدارة\s+المسؤولة|responsib|who\s+(?:does|handles))/iu;
const SERVICE_LIST_PATTERN = /(?:الخدمات\s+(?:الموجودة|المتاحة|المكتملة|عنا|عندنا)|كل\s+الخدمات|أي\s+خدمات|ما\s+(?:هي\s+)?الخدمات|شو\s+الخدمات|خدمات\s+ما\s+بعد\s+البيع\s+(?:الموجودة|المتاحة))/iu;

// Order in which services / pages are listed in the global catalog.
const CATALOG_ORDER = [
  "intro-tour",
  "internal-transfer",
  "internal-transfer-delivery-link",
  "warehouse-pickup",
  "delivery-returns",
  "measurement",
  "design",
  "manufacturing",
  "installation",
  "installation-returns",
  "customer-service",
  "complaints",
  "maintenance",
];

const LEGACY_SERVICES = { "intro-tour": ["delivery"] };

function servicesOf(pageId) {
  return pageKnowledge[pageId]?.services || LEGACY_SERVICES[pageId] || [];
}

function stageLabel(stage) {
  return `${String(stage.number ?? stage.order).padStart(2, "0")} — ${stage.title}`;
}

function detectAutomationIntent(question) {
  return AUTOMATION_PATTERN.test(String(question || ""));
}

function detectResponsibilityIntent(question) {
  return RESPONSIBILITY_PATTERN.test(String(question || ""));
}

function detectCatalogIntent(question) {
  return SERVICE_LIST_PATTERN.test(String(question || ""));
}

// "المرحلة 02", "مرحلة 2", "stage 3", or a bare "02" in the question.
function findReferencedStageNumber(question) {
  const text = String(question || "");
  const explicit = text.match(/(?:المرحلة|مرحلة|stage)\s*(?:رقم\s*)?(\d{1,2})(?!\d)/iu);
  if (explicit) return Number(explicit[1]);
  const bare = text.match(/(?:^|\s)(0\d)(?=$|[\s؟?.,،])/u);
  return bare ? Number(bare[1]) : null;
}

function buildStageReferenceContext(pageId, question) {
  const stageNumber = findReferencedStageNumber(question);
  const workflow = pageKnowledge[pageId]?.currentWorkflow || [];
  if (stageNumber === null || workflow.length === 0) return "";

  const index = workflow.findIndex((stage) => Number(stage.order) === stageNumber);
  if (index < 0) {
    return [
      "[Derived stage reference]",
      `The question references stage ${String(stageNumber).padStart(2, "0")}, which does not exist in this page's workflow.`,
      `Existing stages: ${workflow.map(stageLabel).join(" → ")}`,
    ].join("\n");
  }

  const stage = workflow[index];
  const previous = workflow[index - 1];
  const next = workflow[index + 1];
  return [
    "[Derived stage reference]",
    "Status: confirmed current page workflow",
    `Referenced stage: ${stageLabel(stage)}`,
    `Summary: ${stage.summary}`,
    ...(stage.details || []).map((detail) => `Detail: ${detail}`),
    stage.execution ? `Execution / responsibility (التنفيذ): ${stage.execution}` : "Execution / responsibility: not labelled on this page.",
    previous ? `Previous stage: ${stageLabel(previous)}` : "This is the first stage.",
    next ? `Next stage: ${stageLabel(next)}` : "This is the last stage.",
  ].join("\n");
}

function buildResponsibilityContext(pageId) {
  const knowledge = pageKnowledge[pageId];
  const workflow = knowledge?.currentWorkflow || [];
  if (workflow.length === 0) return "";

  const labelled = workflow.some((stage) => stage.execution);
  return [
    "[Derived execution / responsibility per stage]",
    `Workflow: ${knowledge.workflowLabel || knowledge.title}`,
    ...workflow.map((stage) => `${stageLabel(stage)}: ${stage.execution || "لا يوجد تصنيف منفصل لهذه المرحلة في الصفحة"}`),
    labelled
      ? ""
      : "This page does not label each stage as manual/automatic or name a responsible party per stage; only what the stage text itself states is documented.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildAutomationSummaryContext() {
  const lines = ["[Derived manual / automatic classification across completed service pages]"];

  for (const pageId of CATALOG_ORDER) {
    const knowledge = pageKnowledge[pageId];
    const workflow = knowledge?.currentWorkflow || [];
    if (!knowledge || workflow.length === 0) continue;

    const serviceName = SERVICE_NAMES[servicesOf(pageId)[0]] || knowledge.title;
    const labelled = workflow.filter((stage) => stage.execution);
    if (labelled.length === 0) {
      lines.push(
        `- ${serviceName} (${knowledge.title}): الصفحة لا تعرض تصنيفًا منفصلًا (آلي/يدوي) لكل مرحلة؛ المعتمد هو ما يذكره شرح كل مرحلة صراحةً (مثل ما يقوم به النظام تلقائيًا).`,
      );
      continue;
    }

    const automatic = labelled.filter((stage) => /آلي/u.test(stage.execution)).map(stageLabel);
    const manual = labelled.filter((stage) => /يدوي/u.test(stage.execution)).map(stageLabel);
    lines.push(
      `- ${serviceName} (${knowledge.title}): مراحل آلية: ${automatic.length ? automatic.join("، ") : "لا يوجد"}؛ مراحل يدوية: ${manual.length ? manual.join("، ") : "لا يوجد"}.`,
    );
  }

  return lines.join("\n");
}

function buildServiceCatalogContext() {
  const lines = ["[Derived catalog of completed After-Sales service pages on the website]"];

  for (const pageId of CATALOG_ORDER) {
    const knowledge = pageKnowledge[pageId];
    if (!knowledge) continue;
    const serviceName = SERVICE_NAMES[servicesOf(pageId)[0]] || knowledge.title;
    const workflow = knowledge.currentWorkflow || [];
    lines.push(
      `- ${serviceName} — ${knowledge.title}${workflow.length ? `: ${workflow.map(stageLabel).join(" → ")}` : ""}`,
    );
  }

  lines.push(
    "Services with workflow content not yet completed on the website are not listed. Maintenance (الصيانة) is a separate path inside خدمة العملاء.",
  );
  return lines.join("\n");
}

module.exports = {
  buildAutomationSummaryContext,
  buildResponsibilityContext,
  buildServiceCatalogContext,
  buildStageReferenceContext,
  detectAutomationIntent,
  detectCatalogIntent,
  detectResponsibilityIntent,
  findReferencedStageNumber,
};
