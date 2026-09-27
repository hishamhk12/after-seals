// Retrieval + answer test set for every completed page assistant (Phase 1) and the global
// After-Sales assistant (Phase 2). Categories:
//   A page/workflow   B stage-specific   C responsibility   D manual/automatic
//   E cross-service   F ambiguous / shared-term page specificity   G unsupported (must not invent)
//
// expect: list of term groups; every group needs at least one of its alternatives in the answer.
// forbid: terms that must not appear (e.g. another service's stage details).
// sequence: stage titles that must appear in this order.
// minDistinct: [groups, n] — at least n of the groups must appear (ambiguous multi-service answers).
// expectPages: page ids that must appear among the retrieved chunks (global assistant).
const { pageKnowledge } = require("./pageKnowledge");

const GLOBAL = "after-sales-global";

function t(id, pageId, category, question, options = {}) {
  return { id, pageId, category, question, expect: [], forbid: [], ...options };
}

function partyOf(execution) {
  const parts = String(execution).split("/").map((part) => part.trim()).filter(Boolean);
  return parts.slice(1).join(" / ") || parts[0];
}

function automationOf(execution) {
  return /آلي/u.test(execution) ? "آلي" : "يدوي";
}

// ---------------------------------------------------------------- Phase 1: generated per page
function generatedPageTests() {
  const tests = [];

  for (const [pageId, knowledge] of Object.entries(pageKnowledge)) {
    const workflow = knowledge.currentWorkflow || [];
    if (workflow.length === 0) continue;
    const label = (stage) => stage.title;
    const nn = (stage) => String(stage.order).padStart(2, "0");

    tests.push(
      t(`${pageId}-A-sequence`, pageId, "A", "ما هي مراحل هذه الخدمة؟", { sequence: workflow.map(label) }),
    );

    const k = Math.min(2, workflow.length - 1);
    tests.push(t(`${pageId}-B-stage-number`, pageId, "B", `ماذا يحدث في المرحلة ${nn(workflow[k])}؟`, { expect: [[workflow[k].title]] }));

    if (workflow.length >= 3) {
      tests.push(
        t(`${pageId}-B-next`, pageId, "B", `ماذا يحدث بعد مرحلة ${workflow[1].title}؟`, { expect: [[workflow[2].title]] }),
      );
    }

    const lastLabelled = [...workflow].reverse().find((stage) => stage.execution);
    if (lastLabelled) {
      tests.push(
        t(`${pageId}-C-responsibility`, pageId, "C", `من المسؤول عن مرحلة ${lastLabelled.title}؟`, {
          expect: [[partyOf(lastLabelled.execution)]],
        }),
      );
      const second = workflow.find((stage) => stage.order === 1) || workflow[0];
      tests.push(
        t(`${pageId}-D-automation`, pageId, "D", `هل مرحلة ${second.title} آلية أم يدوية؟`, {
          expect: [[automationOf(second.execution)]],
        }),
      );
    }

    tests.push(t(`${pageId}-G-sla`, pageId, "G", "ما هي مدة SLA المحددة لإنجاز هذه الخدمة؟", { expectFallback: true }));
  }

  return tests;
}

// ---------------------------------------------------------------- Phase 1: hand-written per page
const pageTests = [
  // Pages without per-stage labels: responsibility / automation only from explicit statements.
  t("intro-tour-C-driver", "intro-tour", "C", "من يحدد السائق في مرحلة ربط الخدمة بالسائق؟", { expect: [["مسؤول التحميل", "الموظف المسؤول"]] }),
  t("intro-tour-D-booking-link", "intro-tour", "D", "هل إرسال رابط حجز موعد التوصيل يتم تلقائيًا؟", { expect: [["تلقائي"]] }),
  t("internal-transfer-C-record", "internal-transfer", "C", "من يضغط على Record Transfer؟", { expect: [["موظف المستودع"]] }),
  t("internal-transfer-D-received", "internal-transfer", "D", "هل الانتقال من جاري النقل إلى تم الاستلام يتم تلقائيًا؟", { expect: [["تلقائي"]], forbid: [["يدوي"]] }),
  t("link-B-green", "internal-transfer-delivery-link", "B", "متى تتحول خدمة التوصيل إلى الحالة الخضراء؟", { expect: [["اكتمال التحويلات الداخلية", "اكتملت التحويلات الداخلية"]] }),
  t("link-B-tag", "internal-transfer-delivery-link", "B", "كيف أعرف الخدمة المرتبطة بخدمة التوصيل وهي بالحالة الحمراء؟", { expect: [["Tag"]], forbid: [] }),
  t("link-G-owner", "internal-transfer-delivery-link", "G", "من الموظف المسؤول عن فك الاعتماد يدويًا؟", { expectFallback: true }),
  t("measurement-C-technician", "measurement", "C", "من يحدد الفني المسؤول عن خدمة رفع المقاسات؟", { expect: [["الموظف المختص"]] }),
  t("measurement-D-link", "measurement", "D", "هل إرسال رابط حجز الموعد في رفع المقاسات يتم تلقائيًا؟", { expect: [["تلقائي"]], forbid: [] }),
  t("installation-C-window", "installation", "C", "من يحدد فترة الحجز المسموحة للتركيب؟", { expect: [["المشرف"]] }),
  t("installation-D-link", "installation", "D", "هل يرسل النظام رابط حجز موعد التركيب تلقائيًا؟", { expect: [["تلقائي"]] }),
  t("delivery-returns-D-auto", "delivery-returns", "D", "هل يتم إلغاء خدمة التوصيل تلقائيًا إذا كان المرتجع يحتوي على الخدمة؟", { expect: [["تلقائي"]] }),
  t("delivery-returns-C-items", "delivery-returns", "C", "من يقرر إلغاء خدمة التوصيل إذا كان المرتجع يحتوي على أصناف فقط؟", { expect: [["الشخص المسؤول"]] }),
  t("delivery-returns-B-full", "delivery-returns", "B", "ماذا يحدث عند وصول فاتورة إلغاء من SAP؟", { expect: [["إلغاء خدمة التوصيل", "يتم إلغاء"]], forbid: [["التركيب"]] }),
  t("installation-returns-D-auto", "installation-returns", "D", "هل يتم إلغاء خدمة التركيب تلقائيًا إذا كان المرتجع يحتوي على الخدمة؟", { expect: [["تلقائي"]] }),
  t("installation-returns-C-items", "installation-returns", "C", "من يقرر إلغاء خدمة التركيب إذا كان المرتجع يحتوي على أصناف فقط؟", { expect: [["الشخص المسؤول"]] }),
  t("customer-service-A-sources", "customer-service", "A", "كيف تصل الحالات إلى خدمة العملاء؟", {
    expect: [["الإدارات الداخلية"], ["العميل مباشرة"], ["من النظام"]],
  }),
  t("customer-service-B-system", "customer-service", "B", "ما أمثلة الحالات التي تصل من النظام؟", {
    expect: [["حالة عالقة"], ["عميل لم يحجز موعد"], ["تأخر في إجراء مطلوب"]],
  }),
  t("customer-service-C-signature", "customer-service", "C", "حالة عميل رفض التوقيع تصل من أي مصدر؟", { expect: [["الإدارات الداخلية"]] }),
  t("customer-service-G-channel", "customer-service", "G", "ما رقم هاتف خدمة العملاء؟", { expectFallback: true }),

  // Shared terms must stay on the current page's workflow.
  t("maintenance-F-technician", "maintenance", "F", "من يقوم بتعيين الفني؟", { expect: [["الجهة المختصة"]], forbid: [["Assign"], ["الموظف المختص"], ["المشرف"]] }),
  t("measurement-F-technician", "measurement", "F", "من يقوم بتعيين الفني؟", { expect: [["الموظف المختص"]], forbid: [["الجهة المختصة"]] }),
  t("design-F-invoice", "design", "F", "ماذا يحدث في مرحلة فاتورة من SAP؟", { expect: [["التصميم"]], forbid: [["التوصيل"], ["التصنيع"]] }),
  t("complaints-F-last", "complaints", "F", "ما هي المرحلة الأخيرة؟", { expect: [["حل أو تصعيد"]], forbid: [["تسليم الخدمة"]] }),
  t("manufacturing-F-last", "manufacturing", "F", "ما هي المرحلة الأخيرة؟", { expect: [["تم الانتهاء من الخدمة"]], forbid: [["مكتمل ومعتمد"]] }),
  t("warehouse-F-message", "warehouse-pickup", "F", "هل يتم إرسال رسالة للعميل؟", { expect: [["جاهزية البضاعة"]], forbid: [["واتساب"], ["رابط حجز"]] }),
  t("installation-F-form", "installation", "F", "ماذا يحدث في مرحلة ملئ النموذج؟", { expect: [["Start Installation", "بدء التركيب"]], forbid: [["سند التحميل"], ["Start Measurement"]] }),
  t("intro-tour-F-form", "intro-tour", "F", "ماذا يحدث في مرحلة ملئ النموذج؟", { expect: [["سند التحميل", "أمر التحميل"]], forbid: [["Start Installation"], ["Start Measurement"]] }),

  // Unsupported details on pages must not be invented.
  t("design-G-whatsapp", "design", "G", "هل يتم إرسال إشعار واتساب للعميل عند اعتماد التصميم؟", { expectFallback: true }),
  t("maintenance-G-otp", "maintenance", "G", "هل يتم إرسال رمز OTP للعميل في خدمة الصيانة؟", { expectFallback: true }),
  t("complaints-G-admin-technical", "complaints", "G", "هل يتم تصنيف الشكوى إلى إدارية أو فنية؟", { expectFallback: true, forbid: [["إدارية / فنية", "إدارية أو فنية حسب"]] }),
  t("manufacturing-G-duration", "manufacturing", "G", "كم يوم تستغرق مرحلة جاري التصنيع؟", { expectFallback: true }),
];

// ---------------------------------------------------------------- Phase 2: global assistant
const MAINTENANCE_SEQUENCE = (pageKnowledge.maintenance?.currentWorkflow || []).map((stage) => stage.title);

const globalTests = [
  t("global-A-maintenance", GLOBAL, "A", "ما هي مراحل خدمة الصيانة؟", { sequence: MAINTENANCE_SEQUENCE, expectPages: ["maintenance"] }),
  t("global-A-services", GLOBAL, "A", "ما هي الخدمات الموجودة؟", {
    expect: [["التوصيل"], ["التحويلات الداخلية"], ["المستودع"], ["المقاسات"], ["التصميم"], ["التصنيع"], ["التركيب"], ["خدمة العملاء"], ["الصيانة"]],
  }),
  t("global-B-design-03", GLOBAL, "B", "ماذا يحدث في المرحلة 03 من خدمة التصميم؟", { expect: [["جاري العمل على التصميم"]], expectPages: ["design"] }),
  t("global-B-sources", GLOBAL, "B", "كيف تصل الحالات إلى خدمة العملاء؟", {
    expect: [["الإدارات الداخلية"], ["العميل مباشرة"], ["النظام"]],
    expectPages: ["customer-service"],
  }),
  t("global-B-installation-return", GLOBAL, "B", "ماذا يحدث إذا وصل مرتجع جزئي يحتوي على خدمة التركيب؟", {
    expect: [["تلقائي"], ["إلغاء"]],
    expectPages: ["installation-returns"],
  }),
  t("global-C-maintenance-decision", GLOBAL, "C", "من المسؤول عن القرار النهائي في خدمة الصيانة؟", { expect: [["الإدارة"]], expectPages: ["maintenance"] }),
  t("global-C-design", GLOBAL, "C", "من المسؤول عن مراحل خدمة التصميم؟", { expect: [["إدارة التصميم"]], expectPages: ["design"] }),
  t("global-C-complaint-forward", GLOBAL, "C", "من يقوم بإرسال الشكوى إلى الجهة المختصة؟", { expect: [["خدمة العملاء"], ["الجهة المختصة"]], expectPages: ["complaints"] }),
  t("global-D-all", GLOBAL, "D", "أي خدمات فيها مراحل آلية وأيها يدوية؟", {
    expect: [["المستودع"], ["التصنيع"], ["التصميم"], ["الصيانة"]],
  }),
  t("global-D-workshop", GLOBAL, "D", "هل مرحلة إرسال إلى ورشة التصنيع آلية أم يدوية؟", { expect: [["يدوي"], ["إدارة التصنيع"]], expectPages: ["manufacturing"] }),
  t("global-D-maintenance", GLOBAL, "D", "هل خدمة الصيانة فيها مراحل آلية؟", { expect: [["لا "], ["يدوي"]], expectPages: ["maintenance"] }),
  t("global-E-transfer-delivery", GLOBAL, "E", "ما العلاقة بين التحويلات الداخلية والتوصيل؟", {
    expect: [["محظور بسبب الاعتماد", "Blocked by Dependency"], ["مستودع التجمع", "مكان التجميع"]],
    expectPages: ["internal-transfer-delivery-link"],
  }),
  t("global-E-complaint-installation", GLOBAL, "E", "إذا العميل عنده شكوى فنية بعد التركيب، أي مسار يتعلق بالحالة؟", {
    expect: [["الشكاوى", "شكوى"], ["خدمة العملاء"]],
    forbid: [["إدارية / فنية", "إدارية/فنية"]],
  }),
  t("global-E-delivery-vs-pickup", GLOBAL, "E", "ما الفرق بين خدمة التوصيل واستلام العميل البضاعة من المستودع؟", {
    expect: [["إرسال رسالة إلى العميل", "رسالة"], ["سائق", "جدولة التوصيل"]],
    expectPages: ["warehouse-pickup"],
  }),
  t("global-E-delivery-installation", GLOBAL, "E", "كيف ترتبط خدمة التوصيل بخدمة التركيب؟", { expect: [["48"]], expectPages: ["installation"] }),
  t("global-E-maintenance-cs", GLOBAL, "E", "ما علاقة الصيانة بخدمة العملاء؟", { expect: [["مسار مستقل", "ضمن قسم خدمة العملاء", "ضمن خدمة العملاء"]] }),
  t("global-F-form", GLOBAL, "F", "ماذا يحدث في مرحلة ملئ النموذج؟", {
    minDistinct: [[["التوصيل", "سند التحميل"], ["التركيب"], ["المقاسات", "القياسات"]], 2],
  }),
  t("global-F-technician", GLOBAL, "F", "من يقوم بتعيين الفني؟", {
    minDistinct: [[["المقاسات", "القياسات"], ["التركيب"], ["الصيانة"]], 2],
  }),
  t("global-G-sla", GLOBAL, "G", "كم مدة SLA لخدمة التصميم؟", { expectFallback: true }),
  t("global-G-price", GLOBAL, "G", "كم سعر خدمة التركيب؟", { expectFallback: true }),
  t("global-G-admin-technical", GLOBAL, "G", "هل يتم تصنيف الشكاوى إلى إدارية وفنية؟", { expectFallback: true }),
  t("global-G-japan", GLOBAL, "G", "شو عاصمة اليابان؟", { expectFallback: true }),
  t("global-G-manufacturing-whatsapp", GLOBAL, "G", "هل ترسل خدمة التصنيع رسالة واتساب للعميل؟", { expectFallback: true }),
];

const allPagesRagEvaluationDataset = [...generatedPageTests(), ...pageTests, ...globalTests];

module.exports = { GLOBAL, allPagesRagEvaluationDataset };
