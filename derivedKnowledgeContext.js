// Deterministic context blocks derived from the page knowledge (the single canonical source for
// each workflow). They are prepended to the retrieved chunks so the LLM answers structural
// questions — service list, stage N, responsibilities, manual vs automatic — from exact data.
// Where the website shows no execution label for a stage, the supplemental label from the current
// approved PowerPoint is added and marked as such (website labels always win; conflicting slide
// labels are already excluded by powerpointKnowledge).
const { pageKnowledge } = require("./pageKnowledge");
const { getPowerPointServiceParty, getPowerPointStageLabels } = require("./powerpointKnowledge");
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
  "installation-delivery-link",
  "installation-internal-transfer-link",
  "installation-manufacturing-link",
  "installation-returns",
  "customer-service",
  "complaints",
  "maintenance-request",
  "maintenance",
  "access-services",
  "access-invoices",
];

const LEGACY_SERVICES = { "intro-tour": ["delivery"] };

function servicesOf(pageId) {
  return pageKnowledge[pageId]?.services || LEGACY_SERVICES[pageId] || [];
}

function stageLabel(stage) {
  return `${String(stage.number ?? stage.order).padStart(2, "0")} — ${stage.title}`;
}

function stageNumber(stage) {
  return String(stage.number ?? stage.order).padStart(2, "0");
}

const POWERPOINT_MARK = "(العرض التقديمي المعتمد؛ لا تعرضه الصفحة)";

// { text, source } for a stage: the website label, else the supplemental PowerPoint label, else null.
function executionOf(pageId, stage, powerpointLabels = getPowerPointStageLabels(pageId)) {
  if (stage.execution) return { text: stage.execution, source: "website" };
  const supplemental = powerpointLabels.get(stageNumber(stage));
  return supplemental ? { text: supplemental.label, source: "powerpoint" } : null;
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
    formatStageExecution(executionOf(pageId, stage)),
    previous ? `Previous stage: ${stageLabel(previous)}` : "This is the first stage.",
    next ? `Next stage: ${stageLabel(next)}` : "This is the last stage.",
  ].join("\n");
}

function formatStageExecution(execution) {
  if (!execution) return "Execution / responsibility: not labelled on this page or in the approved PowerPoint.";
  return execution.source === "website"
    ? `Execution / responsibility (التنفيذ): ${execution.text}`
    : `Execution / responsibility (التنفيذ): ${execution.text} ${POWERPOINT_MARK}`;
}

function buildResponsibilityContext(pageId) {
  const knowledge = pageKnowledge[pageId];
  const workflow = knowledge?.currentWorkflow || [];
  if (workflow.length === 0) return "";

  const powerpointLabels = getPowerPointStageLabels(pageId);
  const executions = workflow.map((stage) => executionOf(pageId, stage, powerpointLabels));
  const party = getPowerPointServiceParty(pageId);
  return [
    "[Derived execution / responsibility per stage]",
    `Workflow: ${knowledge.workflowLabel || knowledge.title}`,
    party ? `الجهة المسؤولة عن الخدمة: ${party.party} ${POWERPOINT_MARK}` : "",
    ...workflow.map((stage, index) => {
      const execution = executions[index];
      if (!execution) return `${stageLabel(stage)}: لا يوجد تصنيف منفصل لهذه المرحلة في الصفحة ولا في العرض التقديمي المعتمد`;
      return `${stageLabel(stage)}: ${execution.text}${execution.source === "powerpoint" ? ` ${POWERPOINT_MARK}` : ""}`;
    }),
    executions.some((execution) => execution?.source === "powerpoint")
      ? "Labels marked العرض التقديمي come from the current approved PowerPoint and apply only where the website shows no label; the website stays authoritative."
      : "",
    executions.every((execution) => !execution)
      ? "This page does not label each stage as manual/automatic or name a responsible party per stage; only what the stage text itself states is documented."
      : "",
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
    const powerpointLabels = getPowerPointStageLabels(pageId);
    const labelled = workflow
      .map((stage) => ({ stage, execution: executionOf(pageId, stage, powerpointLabels) }))
      .filter((item) => item.execution);
    if (labelled.length === 0) {
      lines.push(
        `- ${serviceName} (${knowledge.title}): الصفحة لا تعرض تصنيفًا منفصلًا (آلي/يدوي) لكل مرحلة؛ المعتمد هو ما يذكره شرح كل مرحلة صراحةً (مثل ما يقوم به النظام تلقائيًا).`,
      );
      continue;
    }

    const mark = ({ stage, execution }) => `${stageLabel(stage)}${execution.source === "powerpoint" ? "*" : ""}`;
    const automatic = labelled.filter(({ execution }) => /آلي/u.test(execution.text)).map(mark);
    const manual = labelled.filter(({ execution }) => /يدوي/u.test(execution.text)).map(mark);
    const partyOnly = labelled.filter(({ execution }) => !/آلي|يدوي/u.test(execution.text)).map((item) => `${mark(item)} (${item.execution.text})`);
    const unlabelled = workflow.filter((stage) => !labelled.some((item) => item.stage === stage)).map(stageLabel);
    lines.push(
      `- ${serviceName} (${knowledge.title}): مراحل آلية: ${automatic.length ? automatic.join("، ") : "لا يوجد"}؛ مراحل يدوية: ${manual.length ? manual.join("، ") : "لا يوجد"}${partyOnly.length ? `؛ جهة مسؤولة دون تصنيف آلي/يدوي: ${partyOnly.join("، ")}` : ""}${unlabelled.length ? `؛ مراحل بلا تصنيف موثق: ${unlabelled.join("، ")}` : ""}.`,
    );
  }

  lines.push("* = the label comes from the current approved PowerPoint because the website page shows no label for that stage.");
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
