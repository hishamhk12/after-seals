// The current approved After-Sales PowerPoint and how its slides map to website pages.
// The website (pageKnowledge) is the primary source of truth; this deck is a secondary source that
// may only add details the website does not show. Slides are matched by their exact title text, not
// by slide number, so reordering the deck does not break the mapping. A slide whose title matches no
// entry (or more than one) is reported as unmapped and excluded until it is added here.

// The one deck that is indexed. The other decks in the project are older or duplicate copies:
const SOURCE_FILE = "نسخة3.pptx";

const EXCLUDED_FILES = [
  { file: "نسخة3 (1).pptx", reason: "older copy: 6-stage internal transfer, duplicated manufacturing slide instead of free services" },
  { file: "نسخة3_backup.pptx", reason: "backup file (16 slides, older wording)" },
  { file: "exports/after-sales-services-presentation.pptx", reason: "earlier export (13 slides, 2026-09-24)" },
];

// kind:
//   service-workflow          stage flow bar + "ملخص الدورة" cards with responsibility labels
//   customer-service-sources  the three case sources feeding customer service
//   service-journey           the end-to-end journey across services with departments
//   executive-summary         project context slides (global assistant only)
//   cover                     title slide; excluded
// pageId null = no website page covers this content; it is available to the global assistant only.
const SLIDES = [
  { title: "تطوير خدمات ما بعد البيع", kind: "cover", include: false, reason: "cover slide: presentation title and taglines only" },
  { title: "الوضع قبل المشروع", kind: "executive-summary", layout: "paragraphs", section: "project-before" },
  { title: "الهدف من المشروع", kind: "executive-summary", layout: "heading-description", section: "project-goals" },
  { title: "رحلة الخدمة الجديدة", kind: "service-journey", section: "service-journey" },
  { title: "خدمة التوصيل", kind: "service-workflow", service: "delivery", pageId: "intro-tour" },
  { title: "خدمة التحويلات الداخلية", kind: "service-workflow", service: "internal_transfer", pageId: "internal-transfer" },
  { title: "خدمة استلام العميل البضاعة من المستودع", kind: "service-workflow", service: "warehouse_pickup", pageId: "warehouse-pickup" },
  { title: "خدمة رفع المقاسات", kind: "service-workflow", service: "measurement", pageId: "measurement" },
  { title: "خدمة التركيب", kind: "service-workflow", service: "installation", pageId: "installation" },
  { title: "خدمة التصميم", kind: "service-workflow", service: "design", pageId: "design" },
  { title: "خدمة التصنيع", kind: "service-workflow", service: "manufacturing", pageId: "manufacturing" },
  {
    title: "الخدمات المجانية",
    kind: "service-workflow",
    service: "free_services",
    pageId: null,
    review: "no website page documents free services; indexed for the global assistant only",
  },
  { title: "كيف تصل الحالات إلى خدمة العملاء؟", kind: "customer-service-sources", service: "customer_service", pageId: "customer-service" },
  { title: "الشكاوى / الاستفسارات", kind: "service-workflow", service: "customer_service", pageId: "complaints" },
  { title: "خدمة الصيانة", kind: "service-workflow", service: "maintenance", pageId: "maintenance" },
  { title: "قبل وبعد المشروع", kind: "executive-summary", layout: "before-after", section: "project-before-after" },
  { title: "الفائدة على الشركة", kind: "executive-summary", layout: "heading-description", section: "project-benefits" },
  // Future roadmap, not current behaviour.
  { title: "المرحلة القادمة", kind: "executive-summary", layout: "heading-description", section: "project-next-phase", status: "proposed" },
];

// Steps of the "رحلة الخدمة الجديدة" slide (label "name | department") mapped to services.
// null = no website page covers that step.
const JOURNEY_STEPS = {
  "فاتورة من SAP": { service: null, pageId: null },
  "رفع المقاسات": { service: "measurement", pageId: "measurement" },
  "التصميم": { service: "design", pageId: "design" },
  "التصنيع": { service: "manufacturing", pageId: "manufacturing" },
  "التوصيل": { service: "delivery", pageId: "intro-tour" },
  "التركيب": { service: "installation", pageId: "installation" },
  "تقييم العميل": { service: null, pageId: null },
};

// Reviewed stage decisions (key: "<pageId>:<stage number>") for what the automatic checks cannot
// judge. `sameStage` confirms that a slide stage whose short title differs from the website is still
// the same stage (its title is excluded as a conflict; its other facts stay eligible). `conflicts`
// lists slide facts that contradict the website in substance and must be excluded.
const STAGE_REVIEWS = {
  "internal-transfer:01": {
    sameStage: true,
    reason: "the slide describes the source warehouse keeper recording the quantities to move, which the website documents in stage 01 (Record Transfer); only the stage name differs",
  },
  "internal-transfer:03": {
    sameStage: true,
    conflicts: ["description", "responsibility"],
    reason: "the website confirms received quantities (Confirm Receipt) in stage 02 جاري النقل and then moves the task automatically to تم الاستلام; the slide places manual quantity entry in stage 03",
  },
  "measurement:06": {
    sameStage: true,
    reason: "the slide description ends with the move to the website stage تمت الخدمة",
  },
  "installation:06": {
    sameStage: true,
    reason: "the slide description ends with the move to the website stage تم التركيب",
  },
  "manufacturing:04": {
    sameStage: true,
    reason: "the slide description ends with the move to the website stage تم الانتهاء من الخدمة",
  },
};

module.exports = { EXCLUDED_FILES, JOURNEY_STEPS, SLIDES, SOURCE_FILE, STAGE_REVIEWS };
