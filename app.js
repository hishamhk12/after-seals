const deliveryWorkflow = [
  {
    id: "delivery-request",
    title: "طلب توصيل",
    active: true,
  },
  {
    id: "delivery-scheduling",
    title: "جدولة التوصيل",
    active: false,
  },
  {
    id: "driver-linking",
    title: "ربط الخدمة بالسائق",
    active: false,
  },
  {
    id: "driver-assignment",
    title: "تعيين سائق",
    active: false,
  },
  {
    id: "delivery-in-progress",
    title: "جاري التوصيل",
    active: false,
  },
  {
    id: "delivery-done",
    title: "تم التوصيل",
    active: false,
  },
];

const introductoryTour = {
  id: "intro-tour",
  title: "دورة عمل خدمة التوصيل",
  subtitle: "تعرّف على رحلة خدمة التوصيل من وصول الفاتورة من SAP وحتى إكمال الخدمة لدى العميل",
  children: [
    { id: "invoice", title: "فاتورة من SAP", targetId: "step-invoice" },
    { id: "delivery-task-preparation", title: "طلب توصيل", targetId: "step-task-details" },
    { id: "delivery-scheduling", title: "جدولة التوصيل", targetId: "step-delivery-scheduling" },
    { id: "driver-linking", title: "ربط الخدمة بالسائق", targetId: "step-driver-linking" },
    { id: "driver-task-form", title: "ملئ النموذج", targetId: "step-driver-task-form" },
    { id: "driver-portal-execution", title: "جاري التوصيل", targetId: "step-driver-portal-execution" },
    { id: "service-receipt", title: "استلام الخدمة", targetId: "step-service-receipt" },
  ],
};

const deliveryInstallationTour = {
  id: "delivery-installation",
  title: "دورة عمل خدمة توصيل مع تركيب",
  children: [
    { id: "invoice", title: "فاتورة من SAP", targetId: "delivery-installation-step-invoice" },
    { id: "installation-request", title: "طلب تركيب", targetId: "delivery-installation-step-request" },
    { id: "installation-scheduling", title: "جدولة خدمة التركيب", targetId: "delivery-installation-step-scheduling" },
    { id: "technician-waiting", title: "في انتظار تعيين الفني", targetId: "delivery-installation-step-technician-waiting" },
    { id: "technician-assigned", title: "تم تعيين الفني", targetId: "delivery-installation-step-technician-assigned" },
  ],
};

const internalTransferTour = {
  id: "internal-transfer",
  title: "دورة عمل النقل الداخلي",
  subtitle: "دورة عمل النقل الداخلي من الفاتورة وحتى استلام البضاعة في مكان التجميع.",
  children: [
    { id: "internal-invoice", title: "فاتورة من SAP", targetId: "internal-transfer-step-invoice" },
    { id: "internal-request", title: "طلب جديد", targetId: "internal-transfer-step-request" },
    { id: "internal-readiness", title: "التحقق من الجاهزية وحجز الموعد", targetId: "internal-transfer-step-readiness", visible: false },
    { id: "internal-transit", title: "جاري النقل", targetId: "internal-transfer-step-transit" },
    { id: "internal-received", title: "تم الاستلام", targetId: "internal-transfer-step-received" },
  ],
};

const navigationState = {
  route: { type: "home" },
  activeServiceId: null,
  selectedExperienceId: null,
  currentTourTargetId: "step-invoice",
};

const chapters = [
  {
    id: "odoo-entry",
    number: "الباب الأول",
    title: "الدخول إلى Odoo",
    description: "ابدأ بالتعرّف على تسجيل الدخول والتنقل داخل Odoo والوصول إلى خدمات ما بعد البيع.",
    sectionCount: 4,
    visible: true,
    items: [
      {
        id: "odoo-login",
        title: "تسجيل الدخول إلى Odoo",
        description: "التعرف على طريقة الدخول إلى النظام باستخدام بيانات المستخدم.",
        status: "قيد الإعداد",
        visible: true,
      },
      {
        id: "odoo-home-apps",
        title: "الصفحة الرئيسية والتطبيقات",
        description: "التعرف على التطبيقات المتاحة للمستخدم داخل Odoo.",
        status: "قيد الإعداد",
        visible: true,
      },
      {
        id: "after-sales-entry",
        title: "الدخول إلى خدمات ما بعد البيع",
        description: "الوصول إلى تطبيق Project ثم خدمات ما بعد البيع والخدمات التشغيلية.",
        status: "قيد الإعداد",
        visible: true,
      },
    ],
  },
  {
    id: "delivery-services",
    number: "الباب الثاني",
    title: "أنواع عمليات التوصيل",
    description: "اختر نوع عملية التوصيل للوصول إلى المحتوى التدريبي الخاص بها.",
    sectionCount: 3,
    visible: true,
    items: [
      {
        id: "customer-delivery",
        title: "التوصيل إلى العميل",
        description: "دورة عمل خدمة التوصيل من وصول الفاتورة من SAP وحتى استلام العميل للخدمة.",
        status: "مكتمل",
        visible: true,
        experienceId: "intro-tour",
      },
      {
        id: "warehouse-pickup",
        title: "الاستلام من المستودع",
        description: "سيتم إضافة محتوى هذه العملية لاحقًا.",
        status: "قيد الإعداد",
        visible: true,
      },
      {
        id: "internal-transfer",
        title: "النقل الداخلي",
        description: "دورة عمل النقل الداخلي من الفاتورة وحتى استلام البضاعة في مكان التجميع.",
        status: "مكتمل",
        visible: true,
      },
    ],
  },
  {
    id: "delivery-relationships",
    number: "الباب الثالث",
    title: "الكيسات / السيناريوهات الخاصة بخدمة التوصيل",
    description: "مساحة مخصصة للكيسات والسيناريوهات الخاصة بخدمة التوصيل، وسيتم استكمال محتواها لاحقًا.",
    visible: true,
    items: [
      {
        id: "sub-task-cycle",
        title: "دورة Sub-task",
        description: "سيتم توثيق دورة Sub-task وعلاقتها بخدمات التوصيل لاحقًا.",
        status: "قيد الإعداد",
        visible: true,
      },
      {
        id: "internal-transfer-delivery-link",
        title: "علاقة النقل الداخلي بخدمة التوصيل إلى العميل",
        description: "سيتم توثيق العلاقة بين الخدمتين لاحقًا.",
        status: "قيد الإعداد",
        visible: true,
      },
      {
        id: "warehouse-pickup-transfer-link",
        title: "علاقة استلام العميل من المستودع مع النقل الداخلي",
        description: "سيتم توثيق العلاقة بين الخدمتين لاحقًا.",
        status: "قيد الإعداد",
        visible: true,
      },
    ],
  },
  {
    id: "other-after-sales-relationships",
    number: "الباب الرابع",
    title: "العلاقة مع خدمات ما بعد البيع الأخرى",
    description: "هيكل محفوظ للعلاقات المستقبلية مع خدمات ما بعد البيع الأخرى.",
    visible: false,
    items: [
      { id: "delivery-installation", title: "التوصيل + التركيب", status: "قريبًا", visible: false, experienceId: "delivery-installation" },
      { id: "delivery-measurement", title: "التوصيل + رفع القياسات", status: "قريبًا", visible: false },
      { id: "delivery-manufacturing", title: "التوصيل + التصنيع", status: "قريبًا", visible: false },
      { id: "other-relationships", title: "علاقات أخرى", status: "قريبًا", visible: false },
    ],
  },
  {
    id: "exceptions",
    number: "الباب الخامس",
    title: "الحالات الخاصة والاستثناءات",
    description: "هيكل محفوظ للحالات الخاصة والاستثناءات التي ستوثّق لاحقًا.",
    visible: false,
    items: [
      { id: "reschedule", title: "إعادة جدولة الموعد", status: "قريبًا", visible: false },
      { id: "cancel-appointment", title: "إلغاء الموعد", status: "قريبًا", visible: false },
      { id: "product-not-ready", title: "عدم جاهزية المنتج", status: "قريبًا", visible: false },
      { id: "later-completion", title: "تكملة لاحقًا", status: "قريبًا", visible: false },
      { id: "appointment-conflict", title: "تعارض المواعيد", status: "قريبًا", visible: false },
      { id: "no-operational-team", title: "No Eligible Operational Team", status: "قريبًا", visible: false },
      { id: "linking-issues", title: "مشاكل الربط", status: "قريبًا", visible: false },
      { id: "returns", title: "المرتجعات", status: "قريبًا", visible: false },
    ],
  },
];

const services = [
  {
    id: "delivery",
    title: "خدمة التوصيل",
    description: "دليل خدمة التوصيل وأبوابها التدريبية داخل Odoo.",
    status: "متاح",
    chapterIds: ["odoo-entry", "delivery-services", "delivery-relationships"],
  },
  {
    id: "installation",
    title: "التركيب ورفع المقاسات",
    description: "دورات العمل المتاحة للتركيب ورفع المقاسات.",
    status: "متاح",
    operations: [
      {
        id: "delivery-installation",
        title: "تركيب مع توصيل",
        description: "دورة عمل خدمة توصيل مع تركيب.",
        status: "متاح",
        experienceId: "delivery-installation",
      },
      {
        id: "measurement",
        title: "رفع المقاسات",
        description: "سيتم إضافة محتوى هذه العملية لاحقًا.",
        status: "قريبًا",
      },
    ],
  },
  {
    id: "design",
    title: "خدمة التصميم",
    description: "سيتم إضافة محتوى هذه الخدمة لاحقًا.",
    status: "قريبًا",
  },
  {
    id: "manufacturing",
    title: "خدمة التصنيع",
    description: "سيتم إضافة محتوى هذه الخدمة لاحقًا.",
    status: "قريبًا",
  },
  {
    id: "customer-service",
    title: "خدمة العملاء",
    description: "سيتم إضافة محتوى هذه الخدمة لاحقًا.",
    status: "قريبًا",
  },
];

let tourStepObserver = null;

const trainingFlow = [
  "فاتورة توصيل فقط",
  "اعتماد الفاتورة",
  "إنشاء Task",
  "فتح Tasks",
  "التأكد أن Project = خدمة التوصيل",
  "فتح مهمة التوصيل",
  "مرحلة طلب توصيل",
  "مراجعة بيانات المهمة",
];

const taskRows = [
  {
    task: "INV/2026/00129 - 1",
    project: "خدمة التوصيل",
    stage: "طلب توصيل",
  },
];

const taskFields = [
  {
    label: "Task",
    value: "INV/2026/00129 - 1",
    info: "اسم المهمة الناتجة من الفاتورة، ويستخدمها الموظف لفتح تفاصيل خدمة التوصيل.",
  },
  {
    label: "Project",
    value: "خدمة التوصيل",
    info: "المشروع الذي تنتمي إليه المهمة. في هذا السيناريو يجب أن يكون Project = خدمة التوصيل.",
  },
  {
    label: "Stage",
    value: "طلب توصيل",
    info: "المرحلة الحالية للمهمة ضمن سير خدمة التوصيل.",
  },
  {
    label: "Invoice",
    value: "INV/2026/00129",
    info: "الفاتورة المرتبطة بمهمة الخدمة.",
  },
  {
    label: "Source Invoice",
    value: "INV/2026/00129",
    info: "الفاتورة المصدر المتعلقة بهذه الخدمة، ويمكن للموظف استخدامها للتحقق من أصل المهمة.",
  },
  {
    label: "Assignees",
    value: "مشرف الخدمة",
    info: "المشرف المسؤول عن متابعة المهمة، وليس منفذ الخدمة.",
  },
  {
    label: "Assign",
    value: "السائق",
    info: "الشخص الذي سينفذ الخدمة فعلياً. في خدمة التوصيل يكون السائق.",
  },
  {
    label: "Trip Date",
    value: "تاريخ الرحلة",
    info: "تاريخ الرحلة أو التنفيذ المخطط لخدمة التوصيل.",
  },
  {
    label: "Appointment From",
    value: "بداية فترة الحجز",
    info: "أول تاريخ/وقت مسموح لحجز موعد العميل.",
  },
  {
    label: "Appointment To",
    value: "نهاية فترة الحجز",
    info: "آخر تاريخ/وقت مسموح لحجز موعد العميل.",
  },
];

const businessRules = [
  {
    id: "BR-DEL-001",
    title: "ربط مهمة التوصيل بالفاتورة",
    description: "يجب أن تكون مهمة التوصيل مرتبطة بالفاتورة الخاصة بها.",
  },
  {
    id: "BR-DEL-002",
    title: "تحديد الفاتورة المصدر",
    description: "يجب أن يستطيع الموظف تحديد الفاتورة المصدر من داخل مهمة التوصيل.",
  },
  {
    id: "BR-DEL-003",
    title: "دور Assignees",
    description: "يمثل Assignees المشرف المسؤول عن متابعة مهمة الخدمة.",
  },
  {
    id: "BR-DEL-004",
    title: "دور Assign",
    description: "يمثل Assign منفذ الخدمة الفعلي. في خدمة التوصيل يكون المنفذ هو السائق.",
  },
  {
    id: "BR-DEL-005",
    title: "نافذة موعد العميل",
    description: "يجب أن يقع موعد العميل بين Appointment From و Appointment To.",
  },
];

const quizQuestions = [
  {
    id: "q1",
    question: "ما وظيفة Assignees؟",
    answers: [
      { key: "A", text: "السائق" },
      { key: "B", text: "المشرف المسؤول عن متابعة الخدمة" },
      { key: "C", text: "العميل" },
    ],
    correct: "B",
  },
  {
    id: "q2",
    question: "ما وظيفة Assign؟",
    answers: [
      { key: "A", text: "المشرف" },
      { key: "B", text: "رقم الفاتورة" },
      { key: "C", text: "منفذ الخدمة / السائق" },
    ],
    correct: "C",
  },
  {
    id: "q3",
    question: "متى يمكن حجز موعد العميل؟",
    answers: [
      { key: "A", text: "في أي وقت" },
      { key: "B", text: "فقط بين Appointment From و Appointment To" },
      { key: "C", text: "بعد تم التوصيل" },
    ],
    correct: "B",
  },
];

function getChapter(chapterId) {
  return chapters.find((chapter) => chapter.id === chapterId);
}

function getService(serviceId) {
  return services.find((service) => service.id === serviceId);
}

function getItem(itemId) {
  for (const chapter of chapters) {
    const item = chapter.items.find((candidate) => candidate.id === itemId);
    if (item) return { chapter, item };
  }
  return null;
}

function routeHref(type, id = "") {
  if (type === "home") return "#/";
  return `#/${type}/${id}`;
}

function parseRoute() {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (!parts.length) return { type: "home" };

  const legacyDeliveryRoutes = {
    delivery: { type: "service", serviceId: "delivery" },
    "intro-tour": { type: "lesson", itemId: "customer-delivery" },
    "customer-delivery": { type: "lesson", itemId: "customer-delivery" },
    "internal-transfer": { type: "lesson", itemId: "internal-transfer" },
    "delivery-installation": { type: "operation", operationId: "delivery-installation" },
    measurement: { type: "operation", operationId: "measurement" },
  };
  if (parts.length === 1 && legacyDeliveryRoutes[parts[0]]) {
    return legacyDeliveryRoutes[parts[0]];
  }

  if (parts[0] === "service") {
    if (parts[1] === "measurement") {
      return { type: "operation", operationId: "measurement" };
    }
    const service = getService(parts[1]);
    return service ? { type: "service", serviceId: service.id } : { type: "home" };
  }

  if (parts[0] === "operation" && ["delivery-installation", "measurement"].includes(parts[1])) {
    return { type: "operation", operationId: parts[1] };
  }

  if (parts[0] === "chapter") {
    const chapter = getChapter(parts[1]);
    return chapter?.visible ? { type: "chapter", chapterId: chapter.id } : { type: "home" };
  }

  if (parts[0] === "lesson") {
    const match = getItem(parts[1]);
    return match?.chapter.visible && match.item.visible ? { type: "lesson", itemId: match.item.id } : { type: "home" };
  }

  return { type: "home" };
}

function getActiveServiceId(route = navigationState.route) {
  if (route.type === "service") return route.serviceId;
  if (route.type === "operation" && ["delivery-installation", "measurement"].includes(route.operationId)) return "installation";
  if (route.type === "chapter") {
    return services.find((service) => service.chapterIds?.includes(route.chapterId))?.id || null;
  }
  if (route.type === "lesson") {
    const match = getItem(route.itemId);
    return services.find((service) => service.chapterIds?.includes(match?.chapter.id))?.id || null;
  }
  return null;
}

function isDeliveryWorkflowRoute(route = navigationState.route) {
  return route.type === "lesson" && route.itemId === "customer-delivery";
}

function isInstallationWorkflowRoute(route = navigationState.route) {
  return route.type === "operation" && route.operationId === "delivery-installation";
}

function getActivePageAssistantId() {
  if (navigationState.selectedExperienceId === introductoryTour.id) {
    return introductoryTour.id;
  }

  if (navigationState.route.type === "lesson" && navigationState.route.itemId === internalTransferTour.id) {
    return internalTransferTour.id;
  }

  return null;
}

function statusClass(status) {
  if (status === "مكتمل") return "is-complete";
  if (status === "قريبًا") return "is-soon";
  return "is-preparing";
}

function renderBreadcrumbs() {
  const breadcrumbs = document.querySelector("#breadcrumbs");
  const route = navigationState.route;
  const crumbs = [];

  if (route.type === "home") {
    breadcrumbs.innerHTML = '<span aria-current="page">الرئيسية</span>';
    return;
  }

  crumbs.push(`<a href="${routeHref("home")}">الرئيسية</a>`);
  const serviceId = getActiveServiceId(route);
  const service = getService(serviceId);
  if (service) {
    if (route.type === "service") {
      crumbs.push(`<span aria-current="page">${service.title}</span>`);
    } else {
      crumbs.push(`<a href="${routeHref("service", service.id)}">${service.title}</a>`);
    }
  }

  if (route.type === "operation") {
    const operation = service?.operations?.find((candidate) => candidate.id === route.operationId);
    if (operation) crumbs.push(`<span aria-current="page">${operation.title}</span>`);
  }

  const match = route.type === "lesson" ? getItem(route.itemId) : null;
  const chapter = route.type === "chapter" ? getChapter(route.chapterId) : match?.chapter;
  if (chapter) {
    if (route.type === "chapter") {
      crumbs.push(`<span aria-current="page">${chapter.number} — ${chapter.title}</span>`);
    } else {
      crumbs.push(`<a href="${routeHref("chapter", chapter.id)}">${chapter.number} — ${chapter.title}</a>`);
    }
  }
  if (match) crumbs.push(`<span aria-current="page">${match.item.title}</span>`);
  breadcrumbs.innerHTML = crumbs.join('<span class="breadcrumb-separator" aria-hidden="true">/</span>');
}

function renderChapterCard(chapter) {
  const count = chapter.sectionCount || chapter.items.filter((item) => item.visible).length;
  return `
    <article class="chapter-card">
      <div class="chapter-card-number">${chapter.number}</div>
      <h2>${chapter.title}</h2>
      <p>${chapter.description}</p>
      <div class="chapter-card-footer">
        <span class="lesson-count">${count} ${chapter.sectionCount ? "أقسام" : count === 1 ? "درس" : "دروس وخدمات"}</span>
        <a class="primary-link" href="${routeHref("chapter", chapter.id)}">فتح الباب <span aria-hidden="true">←</span></a>
      </div>
    </article>`;
}

function renderLessonCard(chapter, item, index) {
  const action = item.experienceId === introductoryTour.id ? "فتح الدورة" : "فتح الدرس";
  return `
    <article class="lesson-card">
      <div class="lesson-card-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</div>
      <div class="lesson-card-copy">
        <span class="status-badge ${statusClass(item.status)}">${item.status}</span>
        <h2>${item.title}</h2>
        <p>${item.description || "سيتم إضافة محتوى هذا الدرس لاحقًا."}</p>
      </div>
      <a class="lesson-link" href="${routeHref("lesson", item.id)}" aria-label="${action}: ${item.title}">${action} <span aria-hidden="true">←</span></a>
    </article>`;
}

function renderOdooEntryContent(chapter) {
  return `
    <header class="chapter-header">
      <p class="chapter-number">${chapter.number}</p>
      <h1>${chapter.title}</h1>
      <p>دليل المستخدم لبدء دورة عمل خدمة التوصيل داخل نظام Odoo.</p>
    </header>

    <div class="odoo-entry-guide">
      <section class="guide-section" aria-labelledby="guideGoalTitle">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">01</span>
          <h2 id="guideGoalTitle">الهدف من الدليل</h2>
        </div>
        <div class="guide-section-body">
          <p>يهدف هذا الدليل إلى توضيح دورة عمل خدمة التوصيل من خلال نظام <bdi dir="ltr">Odoo</bdi>، بدءًا من تسجيل الدخول، واستعراض فواتير التوصيل، وحجز موعد التوصيل، وربط السائق بالفاتورة، وانتهاءً بتأكيد استلام العميل للشحنة.</p>
          <p>تعتمد دورة العمل على التكامل بين <bdi dir="ltr">SAP</bdi> و<bdi dir="ltr">Odoo</bdi>، حيث يتم إنشاء وفوترة الفاتورة في <bdi dir="ltr">SAP</bdi>، ثم تظهر الفاتورة في <bdi dir="ltr">Odoo</bdi> ليتم استكمال إجراءات خدمة التوصيل.</p>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guideLoginTitle">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">02</span>
          <h2 id="guideLoginTitle">تسجيل الدخول إلى نظام Odoo</h2>
        </div>
        <div class="guide-section-body">
          <p>يمكن الدخول إلى نظام <bdi dir="ltr">Odoo</bdi> من خلال:</p>
          <ul>
            <li>جهاز كمبيوتر أو <bdi dir="ltr">Laptop</bdi>.</li>
            <li>جهاز <bdi dir="ltr">Tablet</bdi>.</li>
            <li>جهاز <bdi dir="ltr">Mobile</bdi>.</li>
            <li>أي جهاز متصل بالإنترنت.</li>
          </ul>

          <h3>خطوات الدخول:</h3>
          <ol class="guide-steps">
            <li>فتح أي متصفح إنترنت.</li>
            <li>الدخول إلى رابط نظام <bdi dir="ltr">Odoo</bdi>.</li>
            <li>إدخال اسم المستخدم <bdi dir="ltr">(Username)</bdi>.</li>
            <li>إدخال كلمة المرور <bdi dir="ltr">(Password)</bdi>.</li>
            <li>الضغط على <bdi dir="ltr">Login</bdi> / تسجيل الدخول.</li>
          </ol>

          <aside class="guide-note">
            <strong>ملاحظة:</strong>
            تختلف التطبيقات والوظائف التي تظهر لكل مستخدم حسب الصلاحيات الممنوحة له في النظام.
          </aside>

          <figure class="odoo-screenshot-frame guide-screenshot">
            <img src="assest/odoo-entry/login.png" alt="شاشة تسجيل الدخول إلى Odoo وتحديد حقلي اسم المستخدم وكلمة المرور وزر تسجيل الدخول" tabindex="0" role="button" aria-label="اضغط لتكبير صورة شاشة تسجيل الدخول إلى Odoo" title="اضغط لتكبير الصورة" />
          </figure>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guideAppsTitle">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">03</span>
          <h2 id="guideAppsTitle">الصفحة الرئيسية والتطبيقات</h2>
        </div>
        <div class="guide-section-body">
          <p>بعد تسجيل الدخول إلى <bdi dir="ltr">Odoo</bdi>، تظهر الصفحة الرئيسية التي تحتوي على التطبيقات المتاحة للمستخدم.</p>
          <p>تختلف التطبيقات الظاهرة من مستخدم إلى آخر حسب الصلاحيات <bdi dir="ltr">(User Permissions)</bdi> المحددة له.</p>
          <p>للبدء في دورة عمل التوصيل، يتم الدخول إلى تطبيق:</p>
          <p class="guide-key-term"><bdi dir="ltr">Project</bdi></p>

          <figure class="odoo-screenshot-frame guide-screenshot guide-screenshot-portrait">
            <img src="assest/odoo-entry/applications.png" alt="الصفحة الرئيسية في Odoo مع تحديد تطبيق Project" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تطبيقات Odoo" title="اضغط لتكبير الصورة" />
          </figure>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guideAfterSalesTitle">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">04</span>
          <h2 id="guideAfterSalesTitle">الدخول إلى خدمات ما بعد البيع</h2>
        </div>
        <div class="guide-section-body">
          <p>بعد الضغط على تطبيق <bdi dir="ltr">Project</bdi>، تظهر للمستخدم الخدمات والمشاريع المرتبطة بصلاحياته.</p>

          <div class="guide-selection-flow" aria-label="تسلسل اختيار خدمة التوصيل">
            <div>
              <span>يتم اختيار:</span>
              <strong>خدمات ما بعد البيع <bdi dir="ltr">– After Sales Services</bdi></strong>
            </div>
            <span class="guide-flow-arrow" aria-hidden="true">↓</span>
            <div>
              <span>ثم اختيار:</span>
              <strong>خدمة التوصيل <bdi dir="ltr">– Delivery Service</bdi></strong>
            </div>
          </div>

          <p>يظهر لكل مستخدم فقط الخدمات والمعلومات التي تقع ضمن نطاق الصلاحيات الممنوحة له.</p>

          <figure class="odoo-screenshot-frame guide-screenshot">
            <img src="assest/odoo-entry/delivery-project.png" alt="شاشة المشاريع في Odoo مع تحديد خدمة التوصيل ضمن خدمات ما بعد البيع" tabindex="0" role="button" aria-label="اضغط لتكبير صورة خدمة التوصيل في مشاريع Odoo" title="اضغط لتكبير الصورة" />
          </figure>
        </div>
      </section>
    </div>`;
}

function renderWorkflowImagePlaceholder(label) {
  return `
    <div class="workflow-image-placeholder" role="img" aria-label="${label}">
      <span aria-hidden="true">▧</span>
      <strong>مساحة الصورة</strong>
      <small>سيتم إضافة صورة هذه المرحلة لاحقًا.</small>
    </div>`;
}

function renderInternalTransferWorkflow() {
  return `
    <header class="chapter-header internal-transfer-header">
      <p class="chapter-number">الباب الثاني · أنواع عمليات التوصيل</p>
      <h1>${internalTransferTour.title}</h1>
      <p>${internalTransferTour.subtitle}</p>
    </header>

    <div class="workflow-content internal-transfer-workflow">
      ${renderWorkflowFlow(internalTransferTour, {
        activeTargetId: internalTransferTour.children[0].targetId,
      })}

      <section id="internal-transfer-step-invoice" class="panel invoice-training-section" aria-labelledby="internalTransferInvoiceTitle">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">01</span>
          <div><h2 id="internalTransferInvoiceTitle">فاتورة من SAP</h2></div>
        </div>
        <p class="field-explanation-intro">تبدأ عملية النقل الداخلي بوصول فاتورة من SAP. وإذا كانت الفاتورة صادرة لفرع أو مدينة معينة بينما البضاعة موجودة في موقع مختلف، يتم إنشاء نقل داخلي داخل Odoo لنقل البضاعة من موقعها الحالي إلى مكان التجميع المطلوب.</p>
        <aside class="internal-transfer-example">
          <strong>مثال:</strong>
          إذا كانت الفاتورة صادرة من جدة بينما البضاعة موجودة في الرياض، يتم إنشاء نقل داخلي من الرياض إلى جدة، باعتبار جدة مكان التجميع.
        </aside>
        <figure class="odoo-screenshot-frame internal-transfer-screenshot">
          <img src="assest/النقل الداخلي/1.png" alt="لوحة عمليات النقل الداخلي في Odoo وتعرض مراحل طلب جديد والتحقق من الجاهزية وحجز الموعد وجاري النقل وتم الاستلام" tabindex="0" role="button" aria-label="اضغط لتكبير صورة لوحة النقل الداخلي في Odoo" title="اضغط لتكبير الصورة" />
        </figure>
      </section>

      <section id="internal-transfer-step-request" class="panel invoice-training-section" aria-labelledby="internalTransferRequestTitle">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">02</span>
          <div><h2 id="internalTransferRequestTitle">طلب جديد</h2></div>
        </div>
        <div class="internal-transfer-substeps">
          <article class="internal-transfer-substep">
            <h3 class="internal-transfer-substep-title">
              <span aria-hidden="true">أ</span>
              فتح عملية النقل <bdi dir="ltr">(Record Transfer)</bdi>
            </h3>
            <p>بعد إنشاء عملية النقل الداخلي وظهورها في مرحلة "طلب جديد"، يتم فتح المهمة والضغط على زر "Record Transfer" لبدء تسجيل عملية النقل.</p>
            <figure class="odoo-screenshot-frame internal-transfer-screenshot">
              <img src="assest/النقل الداخلي/2.png" alt="مهمة النقل الداخلي في Odoo مع تحديد زر Record Transfer" tabindex="0" role="button" aria-label="اضغط لتكبير صورة فتح عملية النقل الداخلي" title="اضغط لتكبير الصورة" />
            </figure>
          </article>

          <article class="internal-transfer-substep">
            <h3 class="internal-transfer-substep-title">
              <span aria-hidden="true">ب</span>
              تسجيل النقل وتحديد الكمية
            </h3>
            <p>بعد الضغط على "Record Transfer"، تظهر نافذة تسجيل النقل. يمكن اختيار النقل الجزئي <bdi dir="ltr">Partial Transfer</bdi> أو النقل الكامل <bdi dir="ltr">Full Remaining Transfer</bdi>، ثم تحديد الكمية المراد نقلها والضغط على "Record Transfer" لتأكيد العملية.</p>
            <figure class="odoo-screenshot-frame internal-transfer-screenshot">
              <img src="assest/النقل الداخلي/3.png" alt="نافذة Record Transfer في Odoo لاختيار نوع النقل وتحديد الكمية" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تسجيل النقل وتحديد الكمية" title="اضغط لتكبير الصورة" />
            </figure>
          </article>
        </div>
        <p class="internal-transfer-transition-note">بعد تسجيل عملية النقل، تنتقل المهمة إلى مرحلة "جاري النقل".</p>
      </section>

      <section id="internal-transfer-step-readiness" class="panel invoice-training-section" aria-labelledby="internalTransferReadinessTitle" hidden>
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">03</span>
          <div><h2 id="internalTransferReadinessTitle">التحقق من الجاهزية وحجز الموعد</h2></div>
        </div>
        <p class="field-explanation-intro">في هذه المرحلة يتم التأكد من جاهزية البضاعة للنقل الداخلي، ثم تحديد موعد تنفيذ النقل عند الحاجة، حتى تكون العملية جاهزة للانتقال إلى مرحلة التنفيذ الفعلي.</p>
        ${renderWorkflowImagePlaceholder("مساحة مخصصة لصورة مرحلة التحقق من الجاهزية وحجز الموعد")}
      </section>

      <section id="internal-transfer-step-transit" class="panel invoice-training-section" aria-labelledby="internalTransferTransitTitle">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">03</span>
          <div><h2 id="internalTransferTransitTitle">جاري النقل</h2></div>
        </div>
        <p class="field-explanation-intro">بعد التأكد من الجاهزية، تنتقل العملية إلى مرحلة "جاري النقل"، حيث يتم تنفيذ عملية نقل البضاعة فعليًا من الموقع الحالي إلى مكان التجميع المحدد.</p>
        <div class="internal-transfer-substeps">
          <article class="internal-transfer-substep">
            <h3 class="internal-transfer-substep-title">
              <span aria-hidden="true">أ</span>
              فتح <bdi dir="ltr">Confirm Receipt</bdi>
            </h3>
            <p>عند وصول الشحنة إلى موقع الاستلام، ومن داخل مرحلة "جاري النقل"، يتم فتح مهمة النقل الداخلي والضغط على زر "Confirm Receipt" لبدء تسجيل الكمية المستلمة.</p>
            <figure class="odoo-screenshot-frame internal-transfer-screenshot">
              <img src="assest/النقل الداخلي/4.png" alt="مهمة النقل الداخلي في مرحلة جاري النقل مع تحديد زر Confirm Receipt" tabindex="0" role="button" aria-label="اضغط لتكبير صورة فتح Confirm Receipt" title="اضغط لتكبير الصورة" />
            </figure>
          </article>

          <article class="internal-transfer-substep">
            <h3 class="internal-transfer-substep-title">
              <span aria-hidden="true">ب</span>
              تسجيل الكمية المستلمة
            </h3>
            <p>تظهر نافذة "Confirm Receipt" وبداخلها الكمية المرسلة. يتم إدخال الكمية التي تم استلامها فعليًا في خانة "Received Quantity"، ثم الضغط على "Confirm Receipt" لتأكيد الاستلام.</p>
            <aside class="internal-transfer-receipt-note">في حال وجود فرق بين الكمية المرسلة والمستلمة، يظهر الفرق ويمكن تسجيل ملاحظة توضح السبب.</aside>
            <figure class="odoo-screenshot-frame internal-transfer-screenshot">
              <img src="assest/النقل الداخلي/5.png" alt="نافذة Confirm Receipt لإدخال الكمية المستلمة وتوضيح فرق الكمية" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تسجيل الكمية المستلمة" title="اضغط لتكبير الصورة" />
            </figure>
          </article>
        </div>
        <p class="internal-transfer-transition-note">بعد نجاح <bdi dir="ltr">Confirm Receipt</bdi>، تنتقل العملية من مرحلة "جاري النقل" إلى مرحلة "تم الاستلام".</p>
      </section>

      <section id="internal-transfer-step-received" class="panel invoice-training-section" aria-labelledby="internalTransferReceivedTitle">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">04</span>
          <div><h2 id="internalTransferReceivedTitle">تم الاستلام</h2></div>
        </div>
        <p class="field-explanation-intro">عند وصول البضاعة إلى مكان التجميع المحدد واستلامها بنجاح، تنتقل العملية إلى مرحلة "تم الاستلام"، وبذلك يكتمل مسار النقل الداخلي.</p>
      </section>
    </div>`;
}

function renderDeliveryOperationsChapter(chapter) {
  return `
    <header class="chapter-header">
      <p class="chapter-number">${chapter.number}</p>
      <h1>${chapter.title}</h1>
      <p>${chapter.description}</p>
    </header>
    <section class="delivery-operations" aria-labelledby="deliveryOperationsTitle">
      <div class="index-heading">
        <span>عمليات خدمة التوصيل</span>
        <h2 id="deliveryOperationsTitle">اختر نوع العملية</h2>
      </div>
      <nav class="operation-tabs" aria-label="أنواع عمليات التوصيل">
        ${chapter.items.filter((item) => item.visible).map((item, index) => `
          <a class="operation-tab ${item.status === "مكتمل" ? "is-ready" : ""}" href="${routeHref("lesson", item.id)}">
            <span class="operation-tab-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <span class="status-badge ${statusClass(item.status)}">${item.status}</span>
            <strong>${item.title}</strong>
            <small>${item.description}</small>
            <span class="operation-tab-action">${item.status === "مكتمل" ? "فتح دورة العمل" : "فتح العملية"} <span aria-hidden="true">←</span></span>
          </a>`).join("")}
      </nav>
    </section>`;
}

function renderServiceCard(service, index) {
  const isAvailable = service.status === "متاح";
  return `
    <article class="service-scope-card ${isAvailable ? "is-available" : ""}">
      <span class="service-card-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      <span class="status-badge ${isAvailable ? "is-complete" : "is-soon"}">${service.status}</span>
      <h2>${service.title}</h2>
      <p>${service.description}</p>
      <a href="${routeHref("service", service.id)}">${isAvailable ? "فتح الخدمة" : "عرض الخدمة"} <span aria-hidden="true">←</span></a>
    </article>`;
}

function renderBookPortal() {
  const portal = document.querySelector("#bookPortal");
  const route = navigationState.route;
  portal.hidden = isDeliveryWorkflowRoute(route) || isInstallationWorkflowRoute(route);
  if (portal.hidden) {
    portal.innerHTML = "";
    return;
  }

  if (route.type === "home") {
    portal.innerHTML = `
      <header class="book-hero">
        <p class="book-kicker">بوابة تدريب خدمات ما بعد البيع</p>
        <h1>دليل خدمات ما بعد البيع</h1>
        <p>اختر نطاق الخدمة، ثم انتقل إلى أبوابها وفصولها التدريبية داخل Odoo.</p>
      </header>
      <section class="service-index" aria-labelledby="serviceIndexTitle">
        <div class="index-heading">
          <span>الخدمات</span>
          <h2 id="serviceIndexTitle">اختر الخدمة</h2>
        </div>
        <div class="service-scope-grid">${services.map(renderServiceCard).join("")}</div>
      </section>`;
    document.title = "دليل خدمات ما بعد البيع";
    return;
  }

  if (route.type === "service") {
    const service = getService(route.serviceId);
    if (service.id === "delivery") {
      const deliveryChapters = service.chapterIds.map(getChapter).filter(Boolean);
      portal.innerHTML = `
        <header class="chapter-header service-header">
          <p class="chapter-number">نطاق الخدمة</p>
          <h1>${service.title}</h1>
          <p>${service.description}</p>
        </header>
        <section class="chapter-index" aria-labelledby="deliveryChaptersTitle">
          <div class="index-heading">
            <span>فهرس خدمة التوصيل</span>
            <h2 id="deliveryChaptersTitle">الأبواب الداخلية</h2>
          </div>
          <div class="chapter-grid">${deliveryChapters.map(renderChapterCard).join("")}</div>
        </section>`;
    } else if (service.id === "installation") {
      portal.innerHTML = `
        <header class="chapter-header service-header">
          <p class="chapter-number">نطاق الخدمة</p>
          <h1>${service.title}</h1>
          <p>${service.description}</p>
        </header>
        <section class="delivery-operations installation-operations" aria-labelledby="installationOperationsTitle">
          <div class="index-heading">
            <span>عمليات التركيب ورفع المقاسات</span>
            <h2 id="installationOperationsTitle">العمليات المتاحة</h2>
          </div>
          <nav class="operation-tabs installation-operation-tabs" aria-label="عمليات التركيب ورفع المقاسات">
            ${service.operations.map((operation, index) => {
              const isAvailable = operation.status === "متاح";
              return `
                <a class="operation-tab ${isAvailable ? "is-ready" : ""}" href="${routeHref("operation", operation.id)}">
                  <span class="operation-tab-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
                  <span class="status-badge ${isAvailable ? "is-complete" : "is-soon"}">${operation.status}</span>
                  <strong>${operation.title}</strong>
                  <small>${operation.description}</small>
                  <span class="operation-tab-action">${isAvailable ? "فتح دورة العمل" : "فتح العملية"} <span aria-hidden="true">←</span></span>
                </a>`;
            }).join("")}
          </nav>
        </section>`;
    } else {
      portal.innerHTML = `
        <article class="placeholder-page service-placeholder">
          <div class="placeholder-icon" aria-hidden="true">${String(services.indexOf(service) + 1).padStart(2, "0")}</div>
          <span class="status-badge is-soon">${service.status}</span>
          <p class="chapter-number">نطاق خدمة مستقل</p>
          <h1>${service.title}</h1>
          <p>سيتم إضافة محتوى هذه الخدمة لاحقًا.</p>
        </article>`;
    }
    document.title = `${service.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (route.type === "chapter") {
    const chapter = getChapter(route.chapterId);

    if (chapter.id === "odoo-entry") {
      portal.innerHTML = renderOdooEntryContent(chapter);
      document.title = `${chapter.title} | دليل خدمات ما بعد البيع`;
      return;
    }

    if (chapter.id === "delivery-services") {
      portal.innerHTML = renderDeliveryOperationsChapter(chapter);
      document.title = `${chapter.title} | دليل خدمات ما بعد البيع`;
      return;
    }

    portal.innerHTML = `
      <header class="chapter-header">
        <p class="chapter-number">${chapter.number}</p>
        <h1>${chapter.title}</h1>
        <p>${chapter.description}</p>
      </header>
      <section class="lesson-index" aria-label="دروس ${chapter.title}">
        ${chapter.items.filter((item) => item.visible).map((item, index) => renderLessonCard(chapter, item, index)).join("")}
      </section>`;
    document.title = `${chapter.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (route.type === "operation" && route.operationId === "measurement") {
    portal.innerHTML = `
      <article class="placeholder-page service-placeholder">
        <div class="placeholder-icon" aria-hidden="true">02</div>
        <span class="status-badge is-soon">قريبًا</span>
        <p class="chapter-number">التركيب ورفع المقاسات</p>
        <h1>رفع المقاسات</h1>
        <p>سيتم إضافة محتوى هذه العملية لاحقًا.</p>
        <a class="secondary-link" href="${routeHref("service", "installation")}">العودة إلى العمليات</a>
      </article>`;
    document.title = "رفع المقاسات | دليل خدمات ما بعد البيع";
    return;
  }

  const match = getItem(route.itemId);
  if (match?.item.id === "internal-transfer") {
    portal.innerHTML = renderInternalTransferWorkflow();
    document.title = `${internalTransferTour.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.experienceId === introductoryTour.id) {
    portal.hidden = true;
    portal.innerHTML = "";
    return;
  }

  portal.innerHTML = `
    <article class="placeholder-page">
      <div class="placeholder-icon" aria-hidden="true">${match.chapter.number.replace("الباب ", "")}</div>
      <span class="status-badge ${statusClass(match.item.status)}">${match.item.status}</span>
      <p class="chapter-number">${match.chapter.number} · ${match.chapter.title}</p>
      <h1>${match.item.title}</h1>
      <p>${match.item.description || "سيتم إضافة محتوى هذا الدرس لاحقًا."}</p>
      <a class="secondary-link" href="${routeHref("chapter", match.chapter.id)}">العودة إلى فهرس الباب</a>
    </article>`;
  document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
}

function renderSidebar() {
  const sidebar = document.querySelector("#bookSidebar");
  const currentMatch = navigationState.route.type === "lesson" ? getItem(navigationState.route.itemId) : null;
  const currentChapterId = navigationState.route.chapterId || currentMatch?.chapter.id;
  const activeServiceId = navigationState.activeServiceId;
  const deliveryService = getService("delivery");
  const installationService = getService("installation");
  sidebar.innerHTML = `
    <button class="toc-drawer-close" type="button" aria-label="إغلاق قائمة الخدمات">×</button>
    <div class="toc-header">
      <span>نطاقات خدمات ما بعد البيع</span>
      <a href="${routeHref("home")}">دليل خدمات ما بعد البيع</a>
    </div>
    <nav class="toc-nav service-toc" aria-label="الخدمات والأبواب التدريبية">
      <details class="toc-service" ${activeServiceId === "delivery" ? "open" : ""}>
        <summary class="${activeServiceId === "delivery" ? "is-current" : ""}" ${activeServiceId === "delivery" ? 'aria-current="true"' : ""}>
          <span>الخدمة 01</span>
          <strong>${deliveryService.title}</strong>
        </summary>
        <div class="toc-service-chapters">
          <a class="${navigationState.route.type === "service" && activeServiceId === "delivery" ? "is-current" : ""}" href="${routeHref("service", "delivery")}">نظرة عامة</a>
          ${deliveryService.chapterIds.map((chapterId) => getChapter(chapterId)).filter(Boolean).map((chapter) => `
            <a class="${currentChapterId === chapter.id ? "is-current" : ""}" href="${routeHref("chapter", chapter.id)}">
              <span>${chapter.number}</span>
              <strong>${chapter.title}</strong>
            </a>`).join("")}
        </div>
      </details>
      <details class="toc-service" ${activeServiceId === "installation" ? "open" : ""}>
        <summary class="${activeServiceId === "installation" ? "is-current" : ""}" ${activeServiceId === "installation" ? 'aria-current="true"' : ""}>
          <span>الخدمة 02</span>
          <strong>${installationService.title}</strong>
        </summary>
        <div class="toc-service-chapters">
          <a class="${navigationState.route.type === "service" && activeServiceId === "installation" ? "is-current" : ""}" href="${routeHref("service", "installation")}">نظرة عامة</a>
          ${installationService.operations.map((operation, index) => `
            <a class="${navigationState.route.type === "operation" && navigationState.route.operationId === operation.id ? "is-current" : ""}" href="${routeHref("operation", operation.id)}">
              <span>العملية ${String(index + 1).padStart(2, "0")}</span>
              <strong>${operation.title}</strong>
            </a>`).join("")}
        </div>
      </details>
      ${services.filter((service) => !["delivery", "installation"].includes(service.id)).map((service, index) => `
        <a class="toc-service-link ${activeServiceId === service.id ? "is-current" : ""}" href="${routeHref("service", service.id)}" ${activeServiceId === service.id ? 'aria-current="page"' : ""}>
          <span>الخدمة ${String(index + 3).padStart(2, "0")}</span>
          <strong>${service.title}</strong>
        </a>`).join("")}
    </nav>`;
}

function renderWorkflowFlow(caseNode, options = {}) {
  const flowNodes = caseNode.children.filter((flowNode) => flowNode.visible !== false);
  const activeTargetId = options.activeTargetId || navigationState.currentTourTargetId;
  const interactive = options.interactive !== false;

  return `
    <div class="workflow-flow" aria-label="جولة تعريفية">
      ${flowNodes
        .map((flowNode, index) => {
          const isActive = activeTargetId === flowNode.targetId;
          const interactionAttributes = interactive
            ? `data-stage-target="${flowNode.targetId}"`
            : 'aria-disabled="true"';

          return `
            <button class="workflow-flow-node ${isActive ? "active" : ""}" type="button" ${interactionAttributes} ${isActive ? 'aria-current="step"' : ""}>
              <span class="workflow-flow-index">${String(index + 1).padStart(2, "0")}</span>
              <span>${flowNode.title}</span>
            </button>
            ${index < flowNodes.length - 1 ? '<span class="workflow-flow-arrow" aria-hidden="true">←</span>' : ""}
          `;
        })
        .join("")}
    </div>
  `;
}

function renderCaseHeader() {
  const caseHeader = document.querySelector("#caseHeader");
  const caseTitle = document.querySelector("#caseTitle");
  const caseSubtitle = document.querySelector("#caseSubtitle");

  caseHeader.hidden = navigationState.selectedExperienceId !== introductoryTour.id;

  if (caseHeader.hidden) {
    caseTitle.textContent = "";
    caseSubtitle.textContent = "";
    return;
  }

  caseTitle.textContent = introductoryTour.title;
  caseSubtitle.textContent = introductoryTour.subtitle;
}

function bindLearningMap() {
  document.querySelectorAll("[data-stage-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.stageTarget;
      setActiveTourStep(targetId);
      requestAnimationFrame(() => {
        document.querySelector(`#${targetId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
}

function setActiveTourStep(targetId) {
  navigationState.currentTourTargetId = targetId;
  document.querySelectorAll("[data-stage-target]").forEach((button) => {
    const isActive = button.dataset.stageTarget === targetId;
    button.classList.toggle("active", isActive);

    if (isActive) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function initTourStepObserver(tour = introductoryTour) {
  if (tourStepObserver) {
    tourStepObserver.disconnect();
  }

  const sections = tour.children
    .filter((step) => step.visible !== false)
    .map((step) => document.querySelector(`#${step.targetId}`))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  tourStepObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveTourStep(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.1, 0.25, 0.5],
    },
  );

  sections.forEach((section) => tourStepObserver.observe(section));
}

function renderWorkflowVisibility() {
  const workflowContent = document.querySelector("#workflowContent");
  const workflowOnlyItems = document.querySelectorAll(".workflow-only");
  const pageAssistant = document.querySelector("#pageAssistant");
  const deliveryInstallationPlaceholder = document.querySelector("#deliveryInstallationPlaceholder");
  const deliveryInstallationWorkflow = document.querySelector("#deliveryInstallationWorkflow");
  const shouldShowWorkflow = navigationState.selectedExperienceId === introductoryTour.id;
  const shouldShowDeliveryInstallation = navigationState.selectedExperienceId === deliveryInstallationTour.id;
  const shouldShowInternalTransfer = navigationState.route.type === "lesson" && navigationState.route.itemId === internalTransferTour.id;

  workflowContent.hidden = !shouldShowWorkflow;
  deliveryInstallationPlaceholder.hidden = !shouldShowDeliveryInstallation;
  workflowOnlyItems.forEach((item) => {
    item.hidden = true;
  });

  if (pageAssistant) {
    pageAssistant.hidden = !(shouldShowWorkflow || shouldShowInternalTransfer);
  }

  if (shouldShowWorkflow) {
    workflowContent.querySelector(".workflow-flow")?.remove();
    workflowContent.insertAdjacentHTML("afterbegin", renderWorkflowFlow(introductoryTour));
    bindLearningMap();
    initTourStepObserver();
  }

  if (shouldShowDeliveryInstallation) {
    deliveryInstallationWorkflow.innerHTML = renderWorkflowFlow(deliveryInstallationTour, {
      activeTargetId: deliveryInstallationTour.children[4].targetId,
      interactive: false,
    });
  }
}

function renderNavigationState() {
  navigationState.route = parseRoute();
  navigationState.activeServiceId = getActiveServiceId(navigationState.route);
  const routeMatch = navigationState.route.type === "lesson" ? getItem(navigationState.route.itemId) : null;
  navigationState.selectedExperienceId = isDeliveryWorkflowRoute()
    ? introductoryTour.id
    : isInstallationWorkflowRoute()
      ? deliveryInstallationTour.id
      : routeMatch?.item.experienceId || null;
  renderBreadcrumbs();
  renderBookPortal();
  renderSidebar();
  renderCaseHeader();
  renderWorkflowVisibility();

  if (navigationState.route.type === "lesson" && navigationState.route.itemId === "internal-transfer") {
    bindLearningMap();
    initTourStepObserver(internalTransferTour);
  } else if (navigationState.selectedExperienceId !== introductoryTour.id && tourStepObserver) {
    tourStepObserver.disconnect();
  }

  if (navigationState.selectedExperienceId === introductoryTour.id) {
    document.title = "التوصيل إلى العميل | دليل خدمات ما بعد البيع";
  } else if (navigationState.selectedExperienceId === deliveryInstallationTour.id) {
    document.title = "تركيب مع توصيل | دليل خدمات ما بعد البيع";
  }

  closeBookSidebar();
}

function closeBookSidebar() {
  const sidebar = document.querySelector("#bookSidebar");
  const toggle = document.querySelector("#tocToggle");
  const backdrop = document.querySelector("#sidebarBackdrop");
  sidebar?.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
  if (backdrop) backdrop.hidden = true;
  document.body.classList.remove("toc-open");
}

function initBookNavigation() {
  const sidebar = document.querySelector("#bookSidebar");
  const toggle = document.querySelector("#tocToggle");
  const backdrop = document.querySelector("#sidebarBackdrop");
  const desktopLayout = window.matchMedia("(min-width: 901px)");
  if (!sidebar || !toggle || !backdrop) return;

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    backdrop.hidden = !isOpen;
    document.body.classList.toggle("toc-open", isOpen);
  });
  sidebar.addEventListener("click", (event) => {
    if (event.target.closest(".toc-drawer-close") || event.target.closest("a")) {
      closeBookSidebar();
    }
  });
  backdrop.addEventListener("click", closeBookSidebar);
  window.addEventListener("hashchange", () => {
    renderNavigationState();
    window.scrollTo({ top: 0, behavior: "auto" });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("is-open")) closeBookSidebar();
  });
  desktopLayout.addEventListener("change", (event) => {
    if (event.matches) closeBookSidebar();
  });
}

function renderWorkflow() {
  const container = document.querySelector("#workflowProgress");
  if (!container) {
    return;
  }

  container.innerHTML = deliveryWorkflow
    .map((stage, index) => {
      const stateClass = stage.active ? "active" : "locked";
      const meta = stage.active ? "نشطة الآن" : "مقفلة";
      const icon = stage.active ? "✓" : "⌕";
      return `
        <article class="stage-step ${stateClass}">
          <strong>${index + 1}. ${stage.title}</strong>
          <span class="stage-meta">${meta}</span>
          <span class="stage-icon" aria-hidden="true">${icon}</span>
        </article>
      `;
    })
    .join("");
}

function renderHeaderProgress() {
  const container = document.querySelector("#headerProgress");
  if (!container) {
    return;
  }

  container.innerHTML = deliveryWorkflow
    .map((stage) => {
      const stateClass = stage.active ? "active" : "locked";
      return `<span class="header-progress-item ${stateClass}"><span>${stage.title}</span></span>`;
    })
    .join("");
}

function renderTrainingFlow() {
  const list = document.querySelector("#trainingFlow");
  if (!list) {
    return;
  }

  list.innerHTML = trainingFlow.map((step) => `<li>${step}</li>`).join("");
}

function renderTaskRows() {
  const body = document.querySelector("#taskRows");
  if (!body) {
    return;
  }

  body.innerHTML = taskRows
    .map(
      (row) => `
        <tr>
          <td>${row.task}</td>
          <td>${row.project}</td>
          <td>${row.stage}</td>
        </tr>
      `,
    )
    .join("");
}

function renderTaskFields() {
  const container = document.querySelector("#taskFields");
  if (!container) {
    return;
  }

  container.innerHTML = taskFields
    .map(
      (field, index) => `
        <article class="field-item">
          <div class="field-top">
            <span class="label">${field.label}</span>
            <button class="info-button" type="button" aria-expanded="false" aria-controls="field-info-${index}" title="عرض التوضيح">i</button>
          </div>
          <p class="field-value">${field.value}</p>
          <p id="field-info-${index}" class="field-info">${field.info}</p>
        </article>
      `,
    )
    .join("");
}

function bindTaskFieldInfo() {
  document.querySelectorAll(".info-button").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.closest(".field-item");
      const isOpen = field.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function renderBusinessRules() {
  const container = document.querySelector("#businessRules");
  if (!container) {
    return;
  }

  container.innerHTML = businessRules
    .map(
      (rule) => `
        <article class="rule-card">
          <span class="rule-id">${rule.id}</span>
          <h3>${rule.title}</h3>
          <p>${rule.description}</p>
        </article>
      `,
    )
    .join("");
}

function renderQuiz() {
  const quiz = document.querySelector("#quiz");
  if (!quiz) {
    return;
  }

  quiz.innerHTML = quizQuestions
    .map(
      (item) => `
        <article class="question-card" data-question="${item.id}" data-correct="${item.correct}">
          <h3>${item.question}</h3>
          <div class="answers">
            ${item.answers
              .map(
                (answer) => `
                  <button class="answer-button" type="button" data-answer="${answer.key}">
                    ${answer.key}) ${answer.text}
                  </button>
                `,
              )
              .join("")}
          </div>
          <p class="feedback" aria-live="polite"></p>
        </article>
      `,
    )
    .join("");
}

function bindQuiz() {
  document.querySelectorAll(".question-card").forEach((card) => {
    const correctAnswer = card.dataset.correct;
    const feedback = card.querySelector(".feedback");

    card.querySelectorAll(".answer-button").forEach((button) => {
      button.addEventListener("click", () => {
        const isCorrect = button.dataset.answer === correctAnswer;

        card.querySelectorAll(".answer-button").forEach((answerButton) => {
          answerButton.classList.remove("correct", "incorrect");
        });

        button.classList.add(isCorrect ? "correct" : "incorrect");
        feedback.textContent = isCorrect ? "إجابة صحيحة" : "راجع هذه النقطة مرة أخرى";
        feedback.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
      });
    });
  });
}

function initImageLightbox() {
  const lightbox = document.querySelector("#imageLightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const closeButton = lightbox?.querySelector(".lightbox-close");

  if (!lightbox || !lightboxImage || !closeButton) {
    return;
  }

  let lastFocusedElement = null;

  function openLightbox(image) {
    lastFocusedElement = document.activeElement;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "صورة مكبرة";
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("lightbox-open");
    lastFocusedElement?.focus?.();
  }

  document.querySelectorAll(".odoo-screenshot-frame img").forEach((image) => {
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "اضغط لتكبير الصورة");
    image.setAttribute("title", "اضغط لتكبير الصورة");
  });

  document.addEventListener("click", (event) => {
    const image = event.target.closest(".odoo-screenshot-frame img");

    if (!image) {
      return;
    }

    openLightbox(image);
  });

  document.addEventListener("keydown", (event) => {
    const image = event.target.closest?.(".odoo-screenshot-frame img");

    if (!image || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    openLightbox(image);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === closeButton || !event.target.closest(".lightbox-stage img")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

function initPageAssistant() {
  const assistant = document.querySelector("#pageAssistant");
  const toggle = document.querySelector("#assistantToggle");
  const panel = document.querySelector("#assistantPanel");
  const close = document.querySelector("#assistantClose");
  const form = document.querySelector("#assistantForm");
  const input = document.querySelector("#assistantQuestion");
  const answer = document.querySelector("#assistantAnswer");

  if (!assistant || !toggle || !panel || !close || !form || !input || !answer) {
    return;
  }

  const ODOO_TERMS = [
    "Appointment From",
    "Appointment To",
    "Source Invoice",
    "Task Forms",
    "Trip Date",
    "End Task",
    "Assignees",
    "Completed",
    "Project",
    "Invoice",
    "Assign",
    "Stage",
    "Start",
    "OTP",
  ];

  function updatePromptState() {
    const hasText = input.value.trim().length > 0;
    const submitButton = form.querySelector("button");

    form.classList.toggle("has-text", hasText);
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;

    if (submitButton && !submitButton.dataset.loading) {
      submitButton.disabled = !hasText;
    }
  }

  function showThinkingState() {
    answer.setAttribute("aria-busy", "true");
    answer.innerHTML = `
      <div id="thinking-orb-root" class="thinking-orb-root" role="status" aria-live="polite" aria-label="جاري إنشاء الإجابة"></div>
    `;

    window.ThinkingOrbMount?.mount(document.querySelector("#thinking-orb-root"));
  }

  function renderAssistantAnswer(text) {
    window.ThinkingOrbMount?.unmount();
    answer.removeAttribute("aria-busy");
    answer.innerHTML = formatAssistantAnswer(stripGroundingIntro(text));
  }

  function stripGroundingIntro(text) {
    return String(text || "")
      .replace(/^\s*(وفقًا للمعلومات المتاحة في الصفحة|وفقًا للمعلومات المتاحة|حسب المعلومات المتاحة|حسب المعلومات المتوفرة|بناءً على المعلومات المتاحة)\s*[:：،.-]?\s*/i, "")
      .trim();
  }

  function formatAssistantAnswer(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => formatAssistantLine(line))
      .join("<br>");
  }

  function formatAssistantLine(line) {
    const cleanedLine = line.replace(/^\s{0,3}#{1,6}\s*/, "").replace(/^\s*[*]\s+/, "");
    const parts = cleanedLine.split(/(\*\*[^*]+\*\*)/g);

    return parts
      .map((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const content = part.slice(2, -2);
          return highlightOdooTerms(escapeHtml(content), true);
        }

        return highlightOdooTerms(escapeHtml(part).replace(/\*/g, ""), false);
      })
      .join("");
  }

  function highlightOdooTerms(escapedText, isStrong) {
    const highlighted = ODOO_TERMS.reduce((currentText, term) => {
      const pattern = escapeRegExp(term).replace(/\s+/g, "\\s+");
      const regex = new RegExp(`(^|[^A-Za-z0-9])(${pattern})(?=$|[^A-Za-z0-9])`, "gi");

      return currentText.replace(regex, `$1<span class="odoo-term">$2</span>`);
    }, escapedText);

    return isStrong && highlighted === escapedText ? `<strong>${highlighted}</strong>` : highlighted;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  let assistantState = panel.hidden ? "closed" : "open";
  let closeFallbackTimer = null;

  function openAssistant() {
    if (assistantState === "open") {
      return;
    }

    window.clearTimeout(closeFallbackTimer);
    assistantState = "open";
    assistant.classList.add("is-expanded");
    panel.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add("is-open");
    });
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
    updatePromptState();
  }

  function closeAssistant() {
    if (assistantState !== "open") {
      return;
    }

    assistantState = "closing";
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");

    const finishClose = () => {
      if (assistantState !== "closing") {
        return;
      }

      window.clearTimeout(closeFallbackTimer);
      panel.removeEventListener("transitionend", handlePanelTransitionEnd);
      panel.hidden = true;
      assistant.classList.remove("is-expanded");
      assistantState = "closed";
      toggle.focus();
    };

    const handlePanelTransitionEnd = (event) => {
      if (event.target === panel && event.propertyName === "opacity") {
        finishClose();
      }
    };

    panel.addEventListener("transitionend", handlePanelTransitionEnd);
    closeFallbackTimer = window.setTimeout(finishClose, 220);
  }

  toggle.addEventListener("click", () => {
    if (panel.hidden) {
      openAssistant();
    } else {
      closeAssistant();
    }
  });

  close.addEventListener("click", closeAssistant);
  input.addEventListener("input", updatePromptState);
  input.addEventListener("focus", updatePromptState);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      answer.textContent = "يرجى كتابة سؤال واضح.";
      return;
    }

    if (question.length > 500) {
      answer.textContent = "يرجى كتابة سؤال لا يتجاوز 500 حرف.";
      return;
    }

    const submitButton = form.querySelector("button");
    showThinkingState();
    submitButton.dataset.loading = "true";
    submitButton.disabled = true;
    input.disabled = true;

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId: getActivePageAssistantId() || introductoryTour.id,
          question,
        }),
      });
      const data = await response.json().catch(() => ({}));

      renderAssistantAnswer(data.answer || "تعذر الحصول على إجابة حاليًا. حاول مرة أخرى.");
    } catch {
      renderAssistantAnswer("تعذر الحصول على إجابة حاليًا. حاول مرة أخرى.");
    } finally {
      delete submitButton.dataset.loading;
      submitButton.disabled = false;
      input.disabled = false;
      input.focus();
      updatePromptState();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      closeAssistant();
    }
  });

  updatePromptState();
}

function init() {
  renderHeaderProgress();
  renderWorkflow();
  renderTrainingFlow();
  renderTaskRows();
  renderTaskFields();
  renderBusinessRules();
  renderQuiz();
  initBookNavigation();
  renderNavigationState();
  bindTaskFieldInfo();
  bindQuiz();
  initImageLightbox();
  initPageAssistant();
}

document.addEventListener("DOMContentLoaded", init);
