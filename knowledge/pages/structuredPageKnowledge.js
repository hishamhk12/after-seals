// Converts the compact page definitions in ./index.js into the pageKnowledge shape used by
// askHandler / pageKnowledge.buildPageContext, and builds semantic chunks with structured
// metadata for embedding and page-aware retrieval.
const { structuredPages, SERVICE_NAMES, LEGACY_PAGE_META } = require("./index");

const RELATED_PAGES = {
  "internal-transfer": ["internal-transfer-delivery-link", "intro-tour"],
  "warehouse-pickup": [],
  "internal-transfer-delivery-link": ["intro-tour", "internal-transfer"],
  "delivery-returns": ["intro-tour"],
  measurement: [],
  design: [],
  manufacturing: ["manufacturing-measurement-link", "manufacturing-design-link", "manufacturing-delivery-link", "manufacturing-installation-link"],
  installation: ["installation-partial", "installation-returns", "installation-delivery-link", "installation-internal-transfer-link", "installation-manufacturing-link", "intro-tour"],
  "installation-partial": ["installation"],
  "installation-delivery-link": ["installation", "intro-tour"],
  "installation-internal-transfer-link": ["installation", "internal-transfer", "internal-transfer-delivery-link"],
  "installation-manufacturing-link": ["installation", "manufacturing"],
  "manufacturing-measurement-link": ["manufacturing", "measurement", "design"],
  "manufacturing-design-link": ["manufacturing", "design", "manufacturing-measurement-link"],
  "manufacturing-delivery-link": ["manufacturing", "intro-tour", "manufacturing-measurement-link"],
  "manufacturing-installation-link": ["manufacturing", "installation", "manufacturing-delivery-link", "installation-manufacturing-link"],
  "composite-manufacturing-end-to-end": ["measurement", "design", "manufacturing", "internal-transfer", "intro-tour", "installation", "internal-transfer-delivery-link"],
  "installation-returns": ["installation"],
  "customer-service": ["complaints", "maintenance"],
  complaints: ["customer-service"],
  maintenance: ["customer-service"],
};

const NO_EXECUTION_LABEL_NOTE =
  "لا تعرض الصفحة تصنيفًا منفصلًا (آلي/يدوي) أو جهة مسؤولة لكل مرحلة؛ ما يرد في شرح كل مرحلة هو المعتمد، وما لم يُذكر فيه غير موثق.";

function serviceNameOf(def) {
  return SERVICE_NAMES[def.services[0]] || def.title;
}

function formatStageLine(stage) {
  return `${stage.number} — ${stage.title}${stage.execution ? ` (التنفيذ: ${stage.execution})` : ""}`;
}

function buildSequenceAnswer(def) {
  return `${def.workflowLabel}: ${def.stages.map(formatStageLine).join(" → ")}.`;
}

function buildSupportedQuestions(def) {
  const serviceName = serviceNameOf(def);
  const questions = [];

  if (def.stages.length > 0) {
    questions.push({
      id: "current-workflow-sequence",
      questions: [
        "ما هي مراحل هذه الخدمة؟",
        "ما مراحل هذه الخدمة؟",
        "ما هي مراحل الخدمة؟",
        "شو مراحل هذه الخدمة؟",
        "شو مراحل الخدمة؟",
        "ما هي المراحل؟",
        "شو الفلو؟",
        `ما هي مراحل ${serviceName}؟`,
        `ما هي مراحل ${def.title}؟`,
        `شو مراحل ${serviceName}؟`,
      ],
      answer: buildSequenceAnswer(def),
      relatedTerms: def.stages.map((stage) => stage.title),
    });
  }

  if (def.sections?.length) {
    questions.push({
      id: "sections-overview",
      questions: ["كيف تصل الحالات إلى خدمة العملاء؟", "من أين تصل الحالات إلى خدمة العملاء؟", "ما مصادر الحالات في خدمة العملاء؟"],
      answer: `تصل الحالات إلى خدمة العملاء من ثلاثة مصادر تغذّي جهة واحدة مسؤولة عن كل حالة: ${def.sections
        .map((section) => `${section.number} — ${section.title} (أمثلة: ${section.examples.join("، ")})`)
        .join("؛ ")}. وجميع القنوات الثلاثة تصب في جهة واحدة لإدارة الحالة ومتابعتها حتى الإغلاق.`,
      relatedTerms: def.sections.map((section) => section.title),
    });
  }

  return questions;
}

function toPageKnowledge(def) {
  return {
    id: def.id,
    kind: "structured",
    title: def.title,
    scope: def.overview,
    workflowLabel: def.workflowLabel,
    services: def.services,
    relatedServices: def.relatedServices || [],
    relatedPages: RELATED_PAGES[def.id] || [],
    route: def.route,
    currentWorkflow: def.stages.map((stage) => ({
      id: `${def.id}-${stage.id}`,
      order: Number(stage.number),
      number: stage.number,
      title: stage.title,
      summary: stage.description,
      details: [...(stage.details || []), ...(stage.execution ? [`التنفيذ: ${stage.execution}`] : [])],
      execution: stage.execution || null,
      relatedTerms: stage.relatedTerms || [],
    })),
    entities: {},
    fields: {},
    stages: [],
    workflow: [],
    sequences: [],
    supportedQuestions: buildSupportedQuestions(def),
    relationships: [],
    businessRules: [],
    glossary: [],
    structured: def,
  };
}

function baseMetadata(def) {
  return {
    service: def.services[0],
    services: def.services,
    service_name: serviceNameOf(def),
    page: def.id,
    page_title: def.title,
    workflow: def.workflowLabel,
    source_type: "website_page",
    source_path: def.route,
  };
}

function buildStructuredChunks(pageId, knowledge) {
  const def = knowledge.structured;
  const serviceName = serviceNameOf(def);
  const meta = baseMetadata(def);
  const chunks = [];
  const add = ({ id, type, title, text, relatedTerms = [], stageId = null, metadata = {} }) => {
    chunks.push({ id, pageId, type, title, text, relatedTerms: [...new Set(relatedTerms)], stageId, metadata: { ...meta, ...metadata } });
  };

  add({
    id: `${pageId}:page:overview`,
    type: "page",
    title: def.title,
    text: [`${serviceName} — ${def.title}`, def.overview].join("\n"),
    relatedTerms: def.terms || [],
    metadata: { section: "overview", stage_number: null, stage_title: null, responsibility: null },
  });

  if (def.stages.length > 0) {
    const hasExecutionLabels = def.stages.some((stage) => stage.execution);
    add({
      id: `${pageId}:workflow-sequence:current`,
      type: "workflow",
      title: def.workflowLabel,
      text: [
        `${def.workflowLabel} — المراحل بالترتيب (${def.stages.length} مراحل):`,
        ...def.stages.map(formatStageLine),
        hasExecutionLabels ? "" : NO_EXECUTION_LABEL_NOTE,
      ]
        .filter(Boolean)
        .join("\n"),
      relatedTerms: ["مراحل", "تسلسل", "المسار الحالي", ...def.stages.map((stage) => stage.title)],
      metadata: { section: "workflow-sequence", stage_number: null, stage_title: null, responsibility: null },
    });
  }

  def.stages.forEach((stage, index) => {
    const previous = def.stages[index - 1];
    const next = def.stages[index + 1];
    add({
      id: `${pageId}:current-workflow:${def.id}-${stage.id}`,
      type: "current-workflow",
      title: `${stage.number} — ${stage.title}`,
      text: [
        `${serviceName} — ${def.workflowLabel}`,
        `المرحلة ${stage.number} — ${stage.title}`,
        stage.description,
        ...(stage.details || []),
        stage.image ? `صورة المرحلة في الصفحة: ${stage.image}.` : "",
        stage.execution ? `التنفيذ والمسؤولية: ${stage.execution}` : "",
        previous ? `المرحلة السابقة: ${previous.number} — ${previous.title}` : "هذه هي المرحلة الأولى في المسار.",
        next ? `المرحلة التالية: ${next.number} — ${next.title}` : "هذه هي المرحلة الأخيرة في المسار.",
      ]
        .filter(Boolean)
        .join("\n"),
      relatedTerms: [stage.title, `المرحلة ${stage.number}`, ...(stage.relatedTerms || [])],
      stageId: `${def.id}-${stage.id}`,
      metadata: {
        section: "workflow-stage",
        stage_number: stage.number,
        stage_title: stage.title,
        responsibility: stage.execution || null,
      },
    });
  });

  for (const section of def.sections || []) {
    add({
      id: `${pageId}:section:${section.id}`,
      type: "section",
      title: `${section.number} — ${section.title}`,
      text: [
        `${serviceName} — ${def.workflowLabel}`,
        `${section.number} — ${section.title}`,
        section.description,
        section.examples?.length ? `أمثلة: ${section.examples.join("، ")}.` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      relatedTerms: section.relatedTerms || [],
      metadata: { section: "content-section", stage_number: section.number, stage_title: section.title, responsibility: null },
    });
  }

  for (const note of def.notes || []) {
    add({
      id: `${pageId}:note:${note.id}`,
      type: "note",
      title: note.title,
      text: [`${serviceName} — ${def.title}`, `${note.title}:`, note.text].join("\n"),
      relatedTerms: note.relatedTerms || [],
      metadata: { section: "note", stage_number: null, stage_title: null, responsibility: null },
    });
  }

  for (const relationship of def.relationships || []) {
    add({
      id: `${pageId}:relationship:${relationship.id}`,
      type: "relationship",
      title: relationship.title,
      text: [`${relationship.title}:`, relationship.text].join("\n"),
      relatedTerms: relationship.relatedTerms || [],
      metadata: {
        section: "relationship",
        services: relationship.services || def.services,
        stage_number: null,
        stage_title: null,
        responsibility: null,
      },
    });
  }

  return chunks;
}

function buildLegacyChunkMetadata(pageId, knowledge, chunk) {
  const legacy = LEGACY_PAGE_META[pageId] || { services: [], route: null };
  const stage = chunk.type === "current-workflow" ? knowledge.currentWorkflow.find((item) => item.id === chunk.stageId) : null;
  return {
    service: legacy.services[0] || null,
    services: legacy.services,
    service_name: SERVICE_NAMES[legacy.services[0]] || knowledge.title,
    page: pageId,
    page_title: knowledge.title,
    workflow: knowledge.workflowLabel || knowledge.title,
    section: chunk.type === "current-workflow" ? "workflow-stage" : chunk.type,
    stage_number: stage ? String(stage.order).padStart(2, "0") : null,
    stage_title: stage ? stage.title : null,
    responsibility: null,
    source_type: "website_page",
    source_path: legacy.route,
  };
}

const structuredPageKnowledge = Object.fromEntries(structuredPages.map((def) => [def.id, toPageKnowledge(def)]));

module.exports = {
  LEGACY_PAGE_META,
  SERVICE_NAMES,
  buildLegacyChunkMetadata,
  buildStructuredChunks,
  structuredPageKnowledge,
};
