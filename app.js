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
    { id: "driver-task-form", title: "ملئ النموذج (سند التحميل)", targetId: "step-driver-task-form" },
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
    { id: "technician-waiting", title: "في انتظار تعيين الفني", targetId: "delivery-installation-step-technician-assignment" },
    { id: "customer-delivery", title: "تنفيذ خدمة التوصيل للعميل", targetId: "delivery-installation-step-customer-delivery", overlayId: "customer-delivery" },
    { id: "installation-form", title: "ملئ النموذج", targetId: "delivery-installation-step-form" },
    { id: "installation-completed", title: "تم التركيب", targetId: "delivery-installation-step-completed" },
  ],
};

// خدمة التركيب → الباب الأول — أنواع خدمات التركيب → تركيب جزئي.
// Partial Installation is not a separate workflow that starts from SAP on its own: it is a
// Sub Task created inside the main Installation task (the Parent Task), and the Sub Task is then
// executed with the normal Installation stages (deliveryInstallationTour).
const installationPartialTour = {
  id: "installation-partial",
  title: "تركيب جزئي",
  children: [
    { id: "invoice", title: "فاتورة من SAP", targetId: "installation-partial-step-invoice" },
    { id: "parent-task", title: "طلب تركيب رئيسي", targetId: "installation-partial-step-parent" },
    { id: "create-sub-task", title: "إنشاء Sub Task", targetId: "installation-partial-step-create" },
    { id: "blocked-by-subtasks", title: "Blocked by Subtasks", targetId: "installation-partial-step-blocked" },
    { id: "execute", title: "تنفيذ التركيب داخل Sub Task", targetId: "installation-partial-step-execute" },
    { id: "completed", title: "اكتمال Sub Task", targetId: "installation-partial-step-completed" },
  ],
};

// Relationship page خدمة التركيب → الباب الثاني → تركيب مع توصيل.
const installationWithDeliveryTour = {
  id: "installation-with-delivery",
  title: "تركيب مع توصيل",
  children: [
    { id: "invoice", title: "فاتورة من SAP", targetId: "installation-with-delivery-step-invoice" },
    { id: "scheduling", title: "جدولة خدمة التركيب وتحديد موعد التوصيل", targetId: "installation-with-delivery-step-scheduling" },
    { id: "delivery", title: "تنفيذ خدمة التوصيل للعميل", targetId: "installation-with-delivery-step-delivery" },
    { id: "installation", title: "استكمال خدمة التركيب", targetId: "installation-with-delivery-step-installation" },
    { id: "completed", title: "تم التركيب", targetId: "installation-with-delivery-step-completed" },
  ],
};

// Relationship page خدمة التركيب → الباب الثاني → تركيب مع التحويلات الداخلية.
const installationWithInternalTransferTour = {
  id: "installation-with-internal-transfer",
  title: "تركيب مع التحويلات الداخلية",
  children: [
    { id: "invoice", title: "فاتورة من SAP", targetId: "installation-with-internal-transfer-step-invoice" },
    { id: "internal-transfer", title: "تنفيذ التحويلات الداخلية", targetId: "installation-with-internal-transfer-step-transfer" },
    { id: "delivery", title: "تنفيذ خدمة التوصيل للعميل", targetId: "installation-with-internal-transfer-step-delivery" },
    { id: "installation", title: "استكمال خدمة التركيب", targetId: "installation-with-internal-transfer-step-installation" },
    { id: "completed", title: "تم التركيب", targetId: "installation-with-internal-transfer-step-completed" },
  ],
};

// Relationship page خدمة التركيب → الباب الثاني → تركيب مع تصنيع.
const installationWithManufacturingTour = {
  id: "installation-with-manufacturing",
  title: "تركيب مع تصنيع",
  children: [
    { id: "invoice", title: "فاتورة من SAP", targetId: "installation-with-manufacturing-step-invoice" },
    { id: "manufacturing", title: "تنفيذ خدمة التصنيع", targetId: "installation-with-manufacturing-step-manufacturing" },
    { id: "delivery", title: "تنفيذ خدمة التوصيل للعميل", targetId: "installation-with-manufacturing-step-delivery" },
    { id: "installation", title: "استكمال خدمة التركيب", targetId: "installation-with-manufacturing-step-installation" },
    { id: "completed", title: "تم التركيب", targetId: "installation-with-manufacturing-step-completed" },
  ],
};

const measurementTour = {
  id: "measurement",
  title: "دورة عمل خدمة رفع المقاسات",
  children: [
    { id: "measurement-invoice", title: "فاتورة من SAP", targetId: "measurement-step-invoice" },
    { id: "measurement-request", title: "طلب رفع مقاسات", targetId: "measurement-step-request", interactive: true },
    { id: "measurement-readiness", title: "التحقق من الجاهزية وحجز الموعد", targetId: "measurement-step-readiness", interactive: true },
    { id: "measurement-technician-assigned", title: "تم تعيين الفني", targetId: "measurement-step-technician-assigned", interactive: true },
    { id: "measurement-form", title: "ملئ النموذج", targetId: "measurement-step-form", interactive: true },
    { id: "measurement-upload", title: "رفع القياسات", targetId: "measurement-step-upload", interactive: true },
    { id: "measurement-completed", title: "تمت الخدمة", targetId: "measurement-step-completed", interactive: true },
  ],
};

const internalTransferTour = {
  id: "internal-transfer",
  title: "دورة عمل التحويلات الداخلية",
  subtitle: "دورة عمل التحويلات الداخلية من الفاتورة وحتى استلام البضاعة في مكان التجميع.",
  children: [
    { id: "internal-invoice", title: "فاتورة من SAP", targetId: "internal-transfer-step-invoice" },
    { id: "internal-request", title: "طلب جديد", targetId: "internal-transfer-step-request" },
    { id: "internal-readiness", title: "التحقق من الجاهزية وحجز الموعد", targetId: "internal-transfer-step-readiness", visible: false },
    { id: "internal-transit", title: "جاري النقل", targetId: "internal-transfer-step-transit" },
    { id: "internal-received", title: "تم الاستلام", targetId: "internal-transfer-step-received" },
  ],
};

const warehousePickupTour = {
  id: "warehouse-pickup",
  title: "خدمة استلام العميل البضاعة من المستودع",
  children: [
    { id: "warehouse-pickup-invoice", title: "فاتورة من SAP", targetId: "warehouse-pickup-step-invoice" },
    { id: "warehouse-pickup-notify", title: "إرسال رسالة إلى العميل", targetId: "warehouse-pickup-step-notify" },
    { id: "warehouse-pickup-confirm", title: "تأكيد استلام العميل", targetId: "warehouse-pickup-step-confirm" },
  ],
};

const designTour = {
  id: "design",
  title: "خدمة التصميم",
  children: [
    { id: "design-invoice", title: "فاتورة من SAP", targetId: "design-step-invoice" },
    { id: "design-request", title: "طلب تصميم", targetId: "design-step-request" },
    { id: "design-assigned", title: "مُسندة لمصمم", targetId: "design-step-assigned" },
    { id: "design-in-progress", title: "جاري العمل على التصميم", targetId: "design-step-in-progress" },
    { id: "design-internal-approvals", title: "موافقات داخلية", targetId: "design-step-internal-approvals" },
    { id: "design-customer-approval", title: "بانتظار موافقة العميل", targetId: "design-step-customer-approval" },
    { id: "design-approved", title: "مكتمل ومعتمد", targetId: "design-step-approved" },
  ],
};

const manufacturingTour = {
  id: "manufacturing",
  title: "خدمة التصنيع",
  children: [
    { id: "manufacturing-invoice", title: "فاتورة من SAP", targetId: "manufacturing-step-invoice" },
    { id: "manufacturing-request", title: "طلب خدمة تصنيع", targetId: "manufacturing-step-request" },
    { id: "manufacturing-workshop", title: "إرسال إلى ورشة التصنيع", targetId: "manufacturing-step-workshop" },
    { id: "manufacturing-in-progress", title: "جاري التصنيع", targetId: "manufacturing-step-in-progress" },
    { id: "manufacturing-completed", title: "تم الانتهاء من الخدمة", targetId: "manufacturing-step-completed" },
  ],
};

// Relationship page خدمة التصنيع → الباب الأول → التصنيع مع رفع المقاسات. The three cards are the
// dependency chain رفع المقاسات ← التصميم ← التصنيع, not a service workflow: each one stands for a
// whole service and links to that service's own page instead of repeating its stages here.
const manufacturingWithMeasurementTour = {
  id: "manufacturing-with-measurement",
  title: "التصنيع مع رفع المقاسات",
  children: [
    { id: "measurement", title: "رفع المقاسات", targetId: "manufacturing-measurement-step-measurement" },
    { id: "design", title: "التصميم", targetId: "manufacturing-measurement-step-design" },
    { id: "manufacturing", title: "التصنيع", targetId: "manufacturing-measurement-step-manufacturing" },
  ],
};

// Relationship page خدمة التصنيع → الباب الأول → التصنيع مع التصميم. Only the direct dependency
// التصميم ← التصنيع: رفع المقاسات is upstream of the design but is not a stage here, because the
// full chain belongs to التصنيع مع رفع المقاسات.
const manufacturingWithDesignTour = {
  id: "manufacturing-with-design",
  title: "التصنيع مع التصميم",
  children: [
    { id: "design", title: "التصميم", targetId: "manufacturing-design-step-design" },
    { id: "manufacturing", title: "التصنيع", targetId: "manufacturing-design-step-manufacturing" },
  ],
};

// Relationship page خدمة التصنيع → الباب الأول → التصنيع مع التوصيل. Only the direct handover
// التصنيع ← التوصيل: what happens inside either service stays on that service's own page.
const manufacturingWithDeliveryTour = {
  id: "manufacturing-with-delivery",
  title: "التصنيع مع التوصيل",
  children: [
    { id: "manufacturing", title: "التصنيع", targetId: "manufacturing-delivery-step-manufacturing" },
    { id: "delivery", title: "التوصيل", targetId: "manufacturing-delivery-step-delivery" },
  ],
};

// Relationship page خدمة التصنيع → الباب الأول → التصنيع مع التركيب. Read from the Manufacturing
// side: التصنيع ← التوصيل ← التركيب. Delivery is a stage of its own here precisely because the
// manufactured product never goes straight from Manufacturing to Installation.
const manufacturingWithInstallationTour = {
  id: "manufacturing-with-installation",
  title: "التصنيع مع التركيب",
  children: [
    { id: "manufacturing", title: "التصنيع", targetId: "manufacturing-installation-step-manufacturing" },
    { id: "delivery", title: "التوصيل", targetId: "manufacturing-installation-step-delivery" },
    { id: "installation", title: "التركيب", targetId: "manufacturing-installation-step-installation" },
  ],
};

// دورات العمل المركبة → دورة متكاملة. Seven stages spanning six services, in the order the project
// documents them: Manufacturing finishes BEFORE the internal transfer in this scenario, and the
// transfer is what the delivery task waits on.
const compositeManufacturingTour = {
  id: "composite-manufacturing-end-to-end",
  title: "دورة العمل المركبة",
  subtitle: "رفع المقاسات ← التصميم ← التصنيع ← التحويلات الداخلية ← التوصيل ← التركيب",
  children: [
    { id: "invoice", title: "فاتورة من SAP", targetId: "composite-step-invoice" },
    { id: "measurement", title: "رفع المقاسات", targetId: "composite-step-measurement" },
    { id: "design", title: "التصميم", targetId: "composite-step-design" },
    { id: "manufacturing", title: "التصنيع", targetId: "composite-step-manufacturing" },
    { id: "internal-transfer", title: "التحويلات الداخلية", targetId: "composite-step-internal-transfer" },
    { id: "delivery", title: "التوصيل", targetId: "composite-step-delivery" },
    { id: "installation", title: "التركيب", targetId: "composite-step-installation" },
  ],
};

// الشكاوى / الاستفسارات as the Helpdesk training flow (00–04), built from the screenshots in
// assest/خدمة العملاء/helpdesk.
const complaintsTour = {
  id: "customer-service-complaints",
  title: "الشكاوى / الاستفسارات",
  children: [
    { id: "helpdesk-entry", title: "الدخول إلى مكتب المساعدة \u2066(Helpdesk)\u2069", targetId: "complaints-step-helpdesk-entry" },
    { id: "ticket-from-invoice", title: "إنشاء تذكرة من فاتورة العميل", targetId: "complaints-step-ticket-from-invoice" },
    { id: "ticket-details", title: "إدخال بيانات التذكرة", targetId: "complaints-step-ticket-details" },
    { id: "ticket-save", title: "حفظ التذكرة", targetId: "complaints-step-ticket-save" },
    { id: "internal-follow-up", title: "المتابعة الداخلية", targetId: "complaints-step-internal-follow-up" },
  ],
};

// خدمة الصيانة (00–07): the top workflow row and the detailed sections.
const maintenanceTour = {
  id: "customer-service-maintenance",
  title: "خدمة الصيانة",
  children: [
    { id: "maintenance-new-request", title: "طلب صيانة جديد", targetId: "maintenance-step-new-request" },
    { id: "maintenance-scheduling", title: "جدولة موعد", targetId: "maintenance-step-scheduling" },
    { id: "maintenance-technician", title: "في انتظار تعيين فني", targetId: "maintenance-step-technician" },
    { id: "maintenance-initial-report", title: "التقرير المبدئي", targetId: "maintenance-step-initial-report" },
    { id: "maintenance-spare-parts", title: "في انتظار قطع الغيار", targetId: "maintenance-step-spare-parts" },
    { id: "maintenance-appointment", title: "تحديد موعد الصيانة", targetId: "maintenance-step-appointment" },
    { id: "maintenance-on-site", title: "جاري العمل بالموقع", targetId: "maintenance-step-on-site" },
    { id: "maintenance-completed", title: "مكتملة", targetId: "maintenance-step-completed" },
  ],
};

const subTaskCycleTour = {
  id: "sub-task-cycle",
  title: "دورة التوصيل الجزئي للعميل",
  children: [
    { id: "sub-task-invoice", title: "فاتورة من SAP", targetId: "sub-task-cycle-step-1" },
    { id: "sub-task-main-invoice", title: "الفاتورة الرئيسية", targetId: "sub-task-cycle-step-1" },
    { id: "sub-task-create", title: "إنشاء مهمة فرعية", targetId: "sub-task-cycle-step-2" },
    { id: "sub-task-execute-delivery", title: "تنفيذ خطوات المهمة الفرعية", targetId: "sub-task-cycle-step-3", overlayId: "customer-delivery" },
    { id: "sub-task-completion", title: "اكتمال خدمة التوصيل الجزئي", targetId: "sub-task-cycle-step-4" },
  ],
};

const partialReturnTour = {
  id: "partial-return",
  title: "مرتجع جزئي للفاتورة",
  children: [
    { id: "partial-return-arrival", title: "وصول مرتجع من SAP" },
    { id: "partial-return-review", title: "التحقق من محتوى المرتجع" },
  ],
};

const navigationState = {
  route: { type: "home" },
  activeServiceId: null,
  selectedExperienceId: null,
};

const sidebarManuallyExpandedBranches = new Set();

const chapters = [
  {
    id: "odoo-entry",
    number: "مدخل عام",
    title: "الدخول إلى النظام",
    description: "ابدأ بالتعرّف على تسجيل الدخول والتنقل داخل نظام خدمات مابعد البيع والوصول إلى خدمات ما بعد البيع.",
    sectionCount: 4,
    visible: true,
    items: [
      {
        id: "odoo-login",
        title: "تسجيل الدخول إلى نظام خدمات مابعد البيع",
        description: "التعرف على طريقة الدخول إلى النظام باستخدام بيانات المستخدم.",
        status: "قيد الإعداد",
        visible: true,
      },
      {
        id: "odoo-home-apps",
        title: "الصفحة الرئيسية والتطبيقات",
        description: "التعرف على التطبيقات المتاحة للمستخدم داخل نظام خدمات مابعد البيع.",
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
    number: "الباب الأول",
    title: "أنواع خدمات التوصيل",
    description: "اختر نوع عملية التوصيل للوصول إلى المحتوى التدريبي الخاص بها.",
    sectionCount: 3,
    visible: true,
    items: [
      {
        id: "customer-delivery",
        title: "خدمة التوصيل إلى العميل",
        description: "دورة عمل خدمة التوصيل من وصول الفاتورة من SAP وحتى استلام العميل للخدمة.",
        status: "مكتمل",
        visible: true,
        experienceId: "intro-tour",
      },
      {
        id: "warehouse-pickup",
        title: "خدمة الاستلام من المستودع",
        description: "دورة عمل خدمة استلام العميل البضاعة من المستودع من وصول الفاتورة من SAP وحتى تأكيد استلام العميل.",
        status: "مكتمل",
        visible: true,
      },
      {
        id: "internal-transfer",
        title: "التحويلات الداخلية",
        description: "دورة عمل التحويلات الداخلية من الفاتورة وحتى استلام البضاعة في مكان التجميع.",
        status: "مكتمل",
        visible: true,
      },
    ],
  },
  {
    id: "delivery-relationships",
    number: "الباب الثاني",
    title: "علاقات خدمات التوصيل",
    description: "مساحة مخصصة للكيسات والسيناريوهات الخاصة بخدمة التوصيل، وسيتم استكمال محتواها لاحقًا.",
    visible: true,
    items: [
      {
        id: "sub-task-cycle",
        title: "دورة التوصيل الجزئي للعميل",
        description: "سيتم توثيق دورة التوصيل الجزئي للعميل وعلاقتها بخدمات التوصيل لاحقًا.",
        status: "قيد الإعداد",
        visible: true,
      },
      {
        id: "internal-transfer-delivery-link",
        title: "علاقة التحويلات الداخلية بخدمة التوصيل للعميل",
        description: "توضيح آلية الاعتماد بين التحويلات الداخلية وخدمة التوصيل للعميل عبر حالة Blocked by Dependency.",
        status: "مكتمل",
        visible: true,
      },
      {
        id: "warehouse-pickup-transfer-link",
        title: "علاقة التحويلات الداخلية باستلام العميل البضاعة من المستودع",
        description: "سيتم توثيق العلاقة بين الخدمتين لاحقًا.",
        status: "قيد الإعداد",
        visible: true,
      },
    ],
  },
  {
    id: "delivery-returns",
    number: "الباب الثالث",
    title: "المرتجعات والإلغاءات",
    description: "قسم خاص بحالات الإلغاء والمرتجعات لخدمة التوصيل، وسيتم استكمال محتواه لاحقًا.",
    visible: true,
    items: [
      {
        id: "full-cancellation",
        title: "إلغاء كامل للفاتورة",
        description: "عند وصول فاتورة إلغاء من SAP إلى نظام خدمات مابعد البيع، يتم إلغاء خدمة التوصيل المرتبطة بالفاتورة ما لم تكن الخدمة قد تم تسليمها أو إكمالها مسبقًا.",
        status: "مكتمل",
        visible: true,
        placeholderOnly: true,
      },
      {
        id: "partial-return",
        title: "مرتجع جزئي للفاتورة",
        description: "إذا كان مرتجع SAP يحتوي على خدمة التوصيل، يتم إلغاء خدمة التوصيل تلقائيًا داخل نظام خدمات مابعد البيع.",
        status: "مكتمل",
        visible: true,
        partialReturnService: "delivery",
      },
    ],
  },
  {
    id: "installation-services",
    number: "الباب الأول",
    title: "أنواع خدمات التركيب",
    description: "سيتم توثيق هذه الدورة لاحقًا.",
    visible: true,
    items: [
      {
        id: "installation-full",
        title: "تركيب كامل",
        description: "دورة عمل خدمة توصيل مع تركيب، من وصول الفاتورة من SAP وحتى مرحلة تم التركيب.",
        status: "مكتمل",
        visible: true,
        // The approved Installation workflow (#deliveryInstallationPlaceholder in index.html).
        experienceId: "delivery-installation",
      },
      {
        id: "installation-partial",
        title: "تركيب جزئي",
        description: "التركيب الجزئي يُنفَّذ كمهمة فرعية (Sub Task) داخل طلب التركيب الرئيسي (Parent Task)، وتبقى المهمة الرئيسية بحالة Blocked by Subtasks حتى تكتمل المهمة الفرعية.",
        status: "مكتمل",
        visible: true,
      },
    ],
  },
  {
    id: "installation-relationships",
    number: "الباب الثاني",
    title: "علاقات خدمة التركيب",
    description: "سيتم توثيق هذه الدورة لاحقًا.",
    visible: true,
    items: [
      {
        id: "installation-with-delivery",
        title: "تركيب مع توصيل",
        description: "علاقة خدمة التركيب بخدمة التوصيل: موعد التوصيل يُحدَّد من موعد التركيب، وبعد اكتمال التوصيل يُستكمل التركيب.",
        status: "مكتمل",
        visible: true,
      },
      {
        id: "installation-with-internal-transfer",
        title: "تركيب مع التحويلات الداخلية",
        description: "التحويلات الداخلية تحظر خدمة التوصيل حتى تصل البضاعة إلى مستودع التجمع، وبعد اكتمال التوصيل يُستكمل التركيب.",
        status: "مكتمل",
        visible: true,
      },
      {
        id: "installation-with-manufacturing",
        title: "تركيب مع تصنيع",
        description: "لا يمكن البدء بتنفيذ خدمة التركيب قبل اكتمال خدمة التصنيع.",
        status: "مكتمل",
        visible: true,
      },
    ],
  },
  {
    id: "installation-returns-cancellations",
    number: "الباب الثالث",
    title: "المرتجعات والإلغاءات",
    description: "سيتم توثيق هذه الدورة لاحقًا.",
    visible: true,
    items: [
      {
        id: "installation-full-cancellation",
        title: "إلغاء كامل للفاتورة",
        description: "عند وصول فاتورة إلغاء من SAP إلى نظام خدمات مابعد البيع، يتم إلغاء خدمة التركيب المرتبطة بالفاتورة ما لم تكن الخدمة قد تم تسليمها أو إكمالها مسبقًا.",
        status: "مكتمل",
        visible: true,
        placeholderOnly: true,
      },
      {
        id: "installation-partial-return",
        title: "مرتجع جزئي للفاتورة",
        description: "إذا كان مرتجع SAP يحتوي على خدمة التركيب، يتم إلغاء خدمة التركيب تلقائيًا داخل نظام خدمات مابعد البيع.",
        status: "مكتمل",
        visible: true,
        partialReturnService: "installation",
      },
    ],
  },
  // The four relationships are documented; each one has its own renderer and page knowledge.
  // The order follows the service chain رفع المقاسات → التصميم → التصنيع → التوصيل → التركيب.
  {
    id: "manufacturing-relationships",
    number: "الباب الأول",
    title: "علاقات خدمة التصنيع",
    description: "علاقات خدمة التصنيع بالخدمات التي تسبقها وتليها: رفع المقاسات، التصميم، التوصيل، والتركيب.",
    visible: true,
    items: [
      {
        id: "manufacturing-with-measurement",
        title: "التصنيع مع رفع المقاسات",
        description: "لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال رفع المقاسات والتصميم المعتمد، والترتيب هو: رفع المقاسات ← التصميم ← التصنيع.",
        status: "مكتمل",
        visible: true,
      },
      {
        id: "manufacturing-with-design",
        title: "التصنيع مع التصميم",
        description: "لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال واعتماد التصميم، ويتم التصنيع وفق التصميم المعتمد.",
        status: "مكتمل",
        visible: true,
      },
      {
        id: "manufacturing-with-delivery",
        title: "التصنيع مع التوصيل",
        description: "لا يمكن تنفيذ توصيل المنتج المُصنَّع قبل اكتمال خدمة التصنيع، والاعتماد المباشر هو: التصنيع ← التوصيل.",
        status: "مكتمل",
        visible: true,
      },
      {
        id: "manufacturing-with-installation",
        title: "التصنيع مع التركيب",
        description: "لا يمكن البدء بتنفيذ خدمة التركيب للمنتج المُصنَّع قبل اكتمال التصنيع ووصول المنتج إلى العميل بالتوصيل، والتسلسل هو: التصنيع ← التوصيل ← التركيب.",
        status: "مكتمل",
        visible: true,
      },
    ],
  },
  // Top-level section, not part of any one service: scenarios that run across several After-Sales
  // services end to end. buildSidebarTree appends it after the services.
  {
    id: "composite-workflows",
    number: "قسم مستقل",
    title: "دورات العمل المركبة",
    description: "سيناريوهات متكاملة تمتد عبر أكثر من خدمة من خدمات ما بعد البيع.",
    visible: true,
    items: [
      {
        id: "composite-manufacturing-end-to-end",
        title: "رفع مقاسات + تصميم + تصنيع + تحويلات داخلية + توصيل + تركيب",
        description:
          "دورة متكاملة من وصول الفاتورة من SAP وحتى اكتمال التركيب، تمر برفع المقاسات والتصميم والتصنيع والتحويلات الداخلية والتوصيل.",
        status: "مكتمل",
        visible: true,
      },
    ],
  },
  {
    id: "customer-service-sources",
    number: "القسم الأول",
    title: "كيف تصل الحالات إلى خدمة العملاء؟",
    description: "ثلاثة مصادر تغذّي جهة واحدة مسؤولة عن كل حالة: الإدارات الداخلية، والعميل مباشرة، والنظام.",
    visible: true,
    items: [],
  },
  {
    id: "customer-service-complaints",
    number: "القسم الثاني",
    title: "الشكاوى / الاستفسارات",
    description: "إنشاء تذكرة الشكوى أو الاستفسار وتصنيف نوعها وإسنادها وحفظها، ثم متابعتها داخليًا من خلال الأنشطة ومراحل التذكرة.",
    visible: true,
    items: [],
  },
  {
    id: "customer-service-maintenance",
    number: "مسار مستقل",
    title: "الصيانة",
    description: "دورة عمل خدمة الصيانة من إنشاء طلب صيانة جديد وحتى تنفيذ أعمال الصيانة وتسليم الخدمة.",
    visible: true,
    items: [],
  },
  // Customer Service employee tools: supporting navigation guides, not Customer Service workflows.
  // Both are guide pages: renderAccessServicesGuide and renderAccessInvoicesGuide.
  {
    id: "customer-service-access-services",
    number: "أداة مساندة",
    title: "الدخول إلى الخدمات",
    description: "استعراض خدمات ما بعد البيع ومتابعة مهام العميل وحالة الخدمة.",
    visible: true,
    items: [],
  },
  {
    id: "customer-service-access-invoices",
    number: "أداة مساندة",
    title: "الدخول إلى فواتير العميل",
    description: "الوصول إلى بيانات العميل وفواتيره والمهام المرتبطة بها ومعلومات SAP والتذاكر.",
    visible: true,
    items: [],
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
    description: "دليل خدمة التوصيل وأبوابها التدريبية داخل نظام خدمات مابعد البيع.",
    status: "متاح",
    chapterIds: ["delivery-services", "delivery-relationships", "delivery-returns"],
  },
  {
    id: "installation",
    title: "خدمة التركيب",
    description: "دورات العمل المتاحة لخدمة التركيب.",
    status: "متاح",
    chapterIds: ["installation-services", "installation-relationships", "installation-returns-cancellations"],
  },
  {
    id: "measurement",
    title: "رفع المقاسات",
    description: "دورة عمل خدمة رفع المقاسات من وصول الفاتورة من SAP وحتى اكتمال الخدمة.",
    status: "متاح",
  },
  {
    id: "design",
    title: "خدمة التصميم",
    description: "دورة عمل خدمة التصميم من وصول الفاتورة من SAP وحتى اعتماد التصميم.",
    status: "متاح",
  },
  {
    id: "manufacturing",
    title: "خدمة التصنيع",
    description: "دورة عمل خدمة التصنيع من وصول الفاتورة من SAP وحتى الانتهاء من الخدمة.",
    status: "متاح",
    chapterIds: ["manufacturing-relationships"],
  },
  {
    id: "customer-service",
    title: "خدمة العملاء",
    description: "كيف تصل الحالات إلى خدمة العملاء، ودورة معالجة الشكاوى والاستفسارات، ومسار الصيانة.",
    status: "متاح",
    chapterIds: [
      "customer-service-sources",
      "customer-service-complaints",
      "customer-service-maintenance",
      "customer-service-access-services",
      "customer-service-access-invoices",
    ],
  },
];


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

// A workflow stage can be linked directly with a third segment: #/lesson/installation-full/installation-form
// (the stage id or its section id from the tour definition).
function parseRoute() {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const route = parseRouteTarget(parts);
  if (route.type !== "home" && parts.length === 3) route.stage = decodeURIComponent(parts[2]);
  return route;
}

function parseRouteTarget(parts) {
  if (!parts.length) return { type: "home" };

  const legacyDeliveryRoutes = {
    delivery: { type: "service", serviceId: "delivery" },
    "intro-tour": { type: "lesson", itemId: "customer-delivery" },
    "customer-delivery": { type: "lesson", itemId: "customer-delivery" },
    "internal-transfer": { type: "lesson", itemId: "internal-transfer" },
    "delivery-installation": { type: "lesson", itemId: "installation-full" },
    measurement: { type: "service", serviceId: "measurement" },
  };
  if (parts.length === 1 && legacyDeliveryRoutes[parts[0]]) {
    return legacyDeliveryRoutes[parts[0]];
  }

  if (parts[0] === "service") {
    const service = getService(parts[1]);
    return service ? { type: "service", serviceId: service.id } : { type: "home" };
  }

  // The Installation workflow moved from the service overview to "تركيب كامل"; old links land there.
  if (parts[0] === "operation" && parts[1] === "delivery-installation") {
    return { type: "lesson", itemId: "installation-full" };
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

// The approved Installation workflow lives under الباب الأول → تركيب كامل.
function isInstallationWorkflowRoute(route = navigationState.route) {
  return route.type === "lesson" && route.itemId === "installation-full";
}

// Which assistant knowledge each completed page uses (pageId in pageKnowledge.js on the server).
// Any other page (home, overviews, placeholders) uses the site-wide After-Sales assistant.
const GLOBAL_ASSISTANT_ID = "after-sales-global";
const PAGE_ASSISTANT_ROUTES = {
  lesson: {
    "customer-delivery": "intro-tour",
    "internal-transfer": "internal-transfer",
    "warehouse-pickup": "warehouse-pickup",
    "internal-transfer-delivery-link": "internal-transfer-delivery-link",
    "full-cancellation": "delivery-returns",
    "partial-return": "delivery-returns",
    "installation-full": "installation",
    "installation-partial": "installation-partial",
    "installation-with-delivery": "installation-delivery-link",
    "installation-with-internal-transfer": "installation-internal-transfer-link",
    "installation-with-manufacturing": "installation-manufacturing-link",
    "manufacturing-with-measurement": "manufacturing-measurement-link",
    "manufacturing-with-design": "manufacturing-design-link",
    "manufacturing-with-delivery": "manufacturing-delivery-link",
    "manufacturing-with-installation": "manufacturing-installation-link",
    "composite-manufacturing-end-to-end": "composite-manufacturing-end-to-end",
    "installation-full-cancellation": "installation-returns",
    "installation-partial-return": "installation-returns",
  },
  service: {
    measurement: "measurement",
    design: "design",
    manufacturing: "manufacturing",
    "customer-service": "customer-service",
  },
  chapter: {
    "customer-service-sources": "customer-service",
    "customer-service-complaints": "complaints",
    "customer-service-maintenance": "maintenance",
    "customer-service-access-services": "access-services",
    "customer-service-access-invoices": "access-invoices",
  },
};

function getActivePageAssistantId() {
  if (navigationState.selectedExperienceId === introductoryTour.id) {
    return introductoryTour.id;
  }

  const route = navigationState.route;
  const routeKey = route.itemId || route.serviceId || route.chapterId || route.operationId;
  return PAGE_ASSISTANT_ROUTES[route.type]?.[routeKey] || GLOBAL_ASSISTANT_ID;
}

// The page the assistant is reading right now. This is metadata only: navigation updates it, and it
// never identifies or resets the conversation, which belongs to the site rather than to a page.
const assistantContext = { pageId: GLOBAL_ASSISTANT_ID, pageTitle: "", stageId: null, stageTitle: "" };

function getAssistantPageTitle(route = navigationState.route) {
  if (route.type === "lesson") return getItem(route.itemId)?.item.title || "";
  if (route.type === "service") return getService(route.serviceId)?.title || "";
  if (route.type === "chapter") return getChapter(route.chapterId)?.title || "";
  return "خدمات ما بعد البيع";
}

function updateAssistantContext() {
  const route = navigationState.route;
  const stageId = route.stage || null;
  const stage = stageId
    ? getRouteWorkflowTour()?.children.find((node) => node.id === stageId || node.targetId === stageId)
    : null;

  assistantContext.pageId = getActivePageAssistantId();
  assistantContext.pageTitle = getAssistantPageTitle(route);
  assistantContext.stageId = stageId;
  assistantContext.stageTitle = stage?.title || "";
}

// One assistant for the whole site: the launcher wording, the title and the shell are fixed in
// index.html and are never rebuilt per page. Navigation only refreshes the context line, so the
// page the reader is on is metadata and never part of the assistant's identity.
function renderAssistantScope(pageAssistant) {
  updateAssistantContext();

  const contextLabel = pageAssistant.querySelector("#assistantContextLabel");

  // Only the context line changes as the reader moves around; the thread below it is left alone.
  if (contextLabel) {
    contextLabel.textContent = assistantContext.stageTitle
      ? `السياق: ${assistantContext.pageTitle} — ${assistantContext.stageTitle}`
      : `السياق: ${assistantContext.pageTitle}`;
  }
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
  const countLabel = `${count} ${chapter.sectionCount ? "أقسام" : count === 1 ? "درس" : "دروس وخدمات"}`;
  return `
    <a class="entry-card" href="${routeHref("chapter", chapter.id)}">
      <span class="entry-card-index" aria-hidden="true">${chapter.number}</span>
      <strong class="entry-card-title">${chapter.title}</strong>
      <span class="entry-card-description">${chapter.description}</span>
      <span class="entry-card-meta">${countLabel}</span>
      <span class="entry-card-action">فتح الباب <span aria-hidden="true">←</span></span>
    </a>`;
}

function renderLessonCard(chapter, item, index) {
  const action = [introductoryTour.id, deliveryInstallationTour.id].includes(item.experienceId) ? "فتح الدورة" : "فتح الدرس";
  return `
    <a class="entry-card" href="${routeHref("lesson", item.id)}" aria-label="${action}: ${item.title}">
      <span class="entry-card-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      <span class="status-badge ${statusClass(item.status)}">${item.status}</span>
      <strong class="entry-card-title">${item.title}</strong>
      <span class="entry-card-description">${item.description || "سيتم إضافة محتوى هذا الدرس لاحقًا."}</span>
      <span class="entry-card-action">${action} <span aria-hidden="true">←</span></span>
    </a>`;
}

function renderMinimalPlaceholderPage(title, description) {
  return `
    <article class="placeholder-page">
      <h1>${title}</h1>
      <p>${description}</p>
    </article>`;
}

function renderPartialReturnFlow() {
  return `
    <div class="partial-return-branch-flow" aria-label="مسار قرار المرتجع الجزئي">
      ${renderWorkflowFlow(partialReturnTour, { interactive: false, numberStart: 0 })}
      <svg class="partial-return-flow-fork" viewBox="0 0 720 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <marker id="partialReturnArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z"></path>
          </marker>
        </defs>
        <path d="M294 0 V28" marker-end="url(#partialReturnArrow)"></path>
        <path d="M294 34 H174 V76" marker-end="url(#partialReturnArrow)"></path>
        <path d="M294 34 H546 V76" marker-end="url(#partialReturnArrow)"></path>
      </svg>
      <span class="partial-return-flow-mobile-split" aria-hidden="true">↓</span>
      <div class="partial-return-flow-branches">
        <div class="partial-return-flow-branch">
          <div class="workflow-flow-node partial-return-flow-box partial-return-flow-box--condition">
            <span>إذا كان المرتجع يحتوي على الخدمة</span>
          </div>
          <span class="partial-return-flow-transition" aria-hidden="true">↓</span>
          <div class="workflow-flow-node partial-return-flow-box partial-return-flow-box--result">
            <span>إلغاء الخدمة تلقائيًا</span>
          </div>
        </div>
        <div class="partial-return-flow-branch">
          <div class="workflow-flow-node partial-return-flow-box partial-return-flow-box--condition">
            <span>إذا كان المرتجع يحتوي على أصناف فقط</span>
          </div>
          <span class="partial-return-flow-transition" aria-hidden="true">↓</span>
          <div class="workflow-flow-node partial-return-flow-box">
            <span>قرار الشخص المسؤول</span>
          </div>
          <span class="partial-return-flow-transition" aria-hidden="true">↓</span>
          <div class="workflow-flow-node partial-return-flow-box partial-return-flow-box--result">
            <span>إلغاء الخدمة أو استمرار الخدمة</span>
          </div>
        </div>
      </div>
    </div>`;
}

function renderPartialReturnContent(serviceId) {
  const rules = serviceId === "installation"
    ? [
        "إذا كان مرتجع SAP يحتوي على خدمة التركيب، يتم إلغاء خدمة التركيب تلقائيًا داخل نظام خدمات مابعد البيع.",
        "إذا كان المرتجع يحتوي على أصناف فقط دون خدمة التركيب، فلا يتم إلغاء خدمة التركيب تلقائيًا، ويكون قرار إلغاء الخدمة أو استمرارها لدى الشخص المسؤول.",
      ]
    : [
        "إذا كان مرتجع SAP يحتوي على خدمة التوصيل، يتم إلغاء خدمة التوصيل تلقائيًا داخل نظام خدمات مابعد البيع.",
        "إذا كان المرتجع يحتوي على أصناف فقط دون خدمة التوصيل، فلا يتم إلغاء خدمة التوصيل تلقائيًا، ويكون قرار إلغاء الخدمة أو استمرارها لدى الشخص المسؤول.",
      ];

  return `
    <div class="workflow-content partial-return-workflow">
      <header class="case-header" aria-labelledby="partialReturnTitle">
        <div>
          <h1 id="partialReturnTitle">مرتجع جزئي للفاتورة</h1>
          ${renderPartialReturnFlow()}
        </div>
      </header>
      ${rules.map((rule, index) => `
        <section class="panel invoice-training-section" aria-labelledby="partialReturnRule${index + 1}">
          <div class="section-title">
            <span class="icon-tile" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <div><h2 id="partialReturnRule${index + 1}">الحالة ${String(index + 1).padStart(2, "0")}</h2></div>
          </div>
          <p class="field-explanation-intro">${rule}</p>
        </section>`).join("")}
    </div>`;
}

function renderOdooEntryContent(chapter) {
  return `
    <header class="chapter-header">
      <p class="chapter-number">${chapter.number}</p>
      <h1>${chapter.title}</h1>
      <p>دليل المستخدم لبدء دورة عمل خدمة التوصيل داخل نظام خدمات مابعد البيع.</p>
    </header>

    <div class="odoo-entry-guide">
      <section class="guide-section" aria-labelledby="guideGoalTitle">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">01</span>
          <h2 id="guideGoalTitle">الهدف من الدليل</h2>
        </div>
        <div class="guide-section-body">
          <p>يهدف هذا الدليل إلى توضيح دورات عمل خدمات مابعد البيع من خلال نظام خدمات مابعد البيع، بدءًا من تسجيل الدخول واستعراض فواتير العميل التي تحتوي على خدمات.</p>
          <p>تعتمد دورة العمل على التكامل بين <bdi dir="ltr">SAP</bdi> ونظام خدمات مابعد البيع، حيث يتم إنشاء وفوترة الفاتورة في <bdi dir="ltr">SAP</bdi>، ثم تظهر الفاتورة في نظام خدمات مابعد البيع ليتم استكمال إجراءات الخدمات التالية: خدمة التوصيل، خدمة رفع المقاسات، خدمة التركيب، خدمة التصميم، وخدمة التصنيع.</p>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guideLoginTitle">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">02</span>
          <h2 id="guideLoginTitle">تسجيل الدخول إلى نظام خدمات مابعد البيع</h2>
        </div>
        <div class="guide-section-body">
          <h3>خطوات الدخول:</h3>
          <p>يمكن الدخول إلى نظام خدمات مابعد البيع من خلال الرابط التالي:</p>
          <p><a href="https://baytalebaa-stage-37367158.dev.odoo.com/"><bdi dir="ltr">https://baytalebaa-stage-37367158.dev.odoo.com/</bdi></a></p>
          <ol class="guide-steps">
            <li>فتح أي متصفح إنترنت.</li>
            <li>الدخول إلى رابط نظام خدمات مابعد البيع.</li>
            <li>إدخال اسم المستخدم <bdi dir="ltr">(Username)</bdi>.</li>
            <li>إدخال كلمة المرور <bdi dir="ltr">(Password)</bdi>.</li>
            <li>الضغط على <bdi dir="ltr">Login</bdi> / تسجيل الدخول.</li>
          </ol>

          <aside class="guide-note">
            <strong>ملاحظة:</strong>
            تختلف التطبيقات والوظائف التي تظهر لكل مستخدم حسب الصلاحيات الممنوحة له في النظام.
          </aside>

          <figure class="odoo-screenshot-frame guide-screenshot">
            <img src="assest/odoo-entry/login.png" alt="شاشة تسجيل الدخول إلى نظام خدمات مابعد البيع وتحديد حقلي اسم المستخدم وكلمة المرور وزر تسجيل الدخول" tabindex="0" role="button" aria-label="اضغط لتكبير صورة شاشة تسجيل الدخول إلى نظام خدمات مابعد البيع" title="اضغط لتكبير الصورة" />
          </figure>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="guideAppsTitle">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">03</span>
          <h2 id="guideAppsTitle">الصفحة الرئيسية والتطبيقات</h2>
        </div>
        <div class="guide-section-body">
          <p>بعد تسجيل الدخول إلى نظام خدمات مابعد البيع، تظهر الصفحة الرئيسية التي تحتوي على التطبيقات المتاحة للمستخدم.</p>
          <p>تختلف التطبيقات الظاهرة من مستخدم إلى آخر حسب الصلاحيات <bdi dir="ltr">(User Permissions)</bdi> المحددة له.</p>
          <p>للبدء في دورة عمل التوصيل، يتم الدخول إلى تطبيق:</p>
          <p class="guide-key-term"><bdi dir="ltr">Project</bdi></p>

          <figure class="odoo-screenshot-frame guide-screenshot guide-screenshot-portrait">
            <img src="assest/odoo-entry/applications.png" alt="الصفحة الرئيسية في نظام خدمات مابعد البيع مع تحديد تطبيق Project" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تطبيقات نظام خدمات مابعد البيع" title="اضغط لتكبير الصورة" />
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

          <p>يظهر لكل مستخدم فقط الخدمات والمعلومات التي تقع ضمن نطاق الصلاحيات الممنوحة له.</p>

          <figure class="odoo-screenshot-frame guide-screenshot">
            <img src="assest/odoo-entry/delivery-project.png" alt="شاشة المشاريع في نظام خدمات مابعد البيع مع تحديد خدمة التوصيل ضمن خدمات ما بعد البيع" tabindex="0" role="button" aria-label="اضغط لتكبير صورة خدمة التوصيل في مشاريع نظام خدمات مابعد البيع" title="اضغط لتكبير الصورة" />
          </figure>
        </div>
      </section>
    </div>`;
}

// Full-cycle overview video, same markup as the delivery and installation videos in index.html.
function renderOverviewVideo(titleId, title, description, src) {
  return `
      <section class="delivery-overview-video" aria-labelledby="${titleId}" dir="rtl">
        <div class="delivery-overview-video-copy">
          <h2 id="${titleId}">${title}</h2>
          <p>${description}</p>
        </div>
        <video class="delivery-overview-video-player" controls preload="metadata">
          <source src="${src}" type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      </section>`;
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
    <div class="workflow-content internal-transfer-workflow">
      ${renderWorkflowFlow(internalTransferTour, {
        activeTargetId: internalTransferTour.children[0].targetId,
        numberStart: 0,
      })}

      <section id="internal-transfer-step-invoice" class="panel invoice-training-section" aria-labelledby="internalTransferInvoiceTitle">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">00</span>
          <div><h2 id="internalTransferInvoiceTitle">فاتورة من SAP</h2></div>
        </div>
        <p class="field-explanation-intro">تبدأ عملية التحويلات الداخلية بوصول فاتورة من SAP. وإذا كانت الفاتورة تحتوي على منتجات موجودة في مستودعات مختلفة عن مستودع التجمع، يتم إنشاء التحويلات الداخلية داخل نظام خدمات مابعد البيع لنقل البضاعة من موقعها الحالي إلى مستودع التجمع.</p>
        <aside class="internal-transfer-example internal-transfer-example--with-result">
          <strong>مثال:</strong> إذا كانت الفاتورة صادرة من جدة ومستودع التجمع هو (J521)، بينما البضاعة أو جزء منها موجود في مدينة الرياض (R574)، يقوم النظام بإنشاء التحويلات الداخلية من مستودع الرياض (R574) إلى مستودع جدة (J521).
        </aside>
        <p class="internal-transfer-result-note"><strong>ملاحظة:</strong> تظهر التحويلات الداخلية في مرحلة طلب جديد.</p>
        <figure class="odoo-screenshot-frame internal-transfer-screenshot">
          <img src="assest/النقل الداخلي/1.png" alt="لوحة عمليات التحويلات الداخلية في نظام خدمات مابعد البيع وتعرض مراحل طلب جديد والتحقق من الجاهزية وحجز الموعد وجاري النقل وتم الاستلام" tabindex="0" role="button" aria-label="اضغط لتكبير صورة لوحة التحويلات الداخلية في نظام خدمات مابعد البيع" title="اضغط لتكبير الصورة" />
        </figure>
      </section>

      <section id="internal-transfer-step-request" class="panel invoice-training-section" aria-labelledby="internalTransferRequestTitle">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">01</span>
          <div><h2 id="internalTransferRequestTitle">طلب جديد</h2></div>
        </div>
        <p class="field-explanation-intro">يمكن استعراض كافة طلبات التحويلات الداخلية من خلال مرحلة طلب جديد، والتي تعرض المعلومات التالية: رقم الفاتورة، كود المستودع الذي يحتوي على البضاعة، وكود مستودع الوجهة (مستودع التجمع).</p>
        <figure class="odoo-screenshot-frame internal-transfer-screenshot internal-transfer-request-intro-screenshot">
          <img src="assest/النقل الداخلي/7.png" alt="التحويلات الداخلية تعرض طلب نقل من مستودع الرياض R574 إلى مستودع جدة J521" tabindex="0" role="button" aria-label="اضغط لتكبير صورة طلب التحويلات الداخلية" title="اضغط لتكبير الصورة" />
        </figure>
        <div class="internal-transfer-substeps">
          <article class="internal-transfer-substep">
            <h3 class="internal-transfer-substep-title">
              <span aria-hidden="true">أ</span>
              بدء عملية النقل <bdi dir="ltr">(Record Transfer)</bdi>
            </h3>
            <p>وفق الصلاحيات المتاحة لموظف المستودع الذي يحتوي على المنتج (مثال: R574)، يمكنه الضغط على Record Transfer لتحديد الأصناف والكميات التي سيتم إرسالها إلى مستودع التجمع (مثال: R521).</p>
            <figure class="odoo-screenshot-frame internal-transfer-screenshot">
              <img src="assest/النقل الداخلي/2.png" alt="مهمة التحويلات الداخلية في نظام خدمات مابعد البيع مع تحديد زر Record Transfer" tabindex="0" role="button" aria-label="اضغط لتكبير صورة فتح عملية التحويلات الداخلية" title="اضغط لتكبير الصورة" />
            </figure>
          </article>

          <article class="internal-transfer-substep">
            <h3 class="internal-transfer-substep-title">
              <span aria-hidden="true">ب</span>
              تحديد الكمية المراد نقلها
            </h3>
            <p>بعد الضغط على زر <bdi dir="ltr">Record Transfer</bdi>، تظهر نافذة تسجيل النقل، حيث يحدد الموظف ما إذا كان النقل جزئيًا (<bdi dir="ltr">Partial Transfer</bdi>) أو لكامل الكمية المتبقية (<bdi dir="ltr">Full Remaining Transfer</bdi>)، ثم يحدد الكمية المراد نقلها ويضغط على <bdi dir="ltr">Record Transfer</bdi> لتأكيد عملية النقل.</p>
            <figure class="odoo-screenshot-frame internal-transfer-screenshot">
              <img src="assest/النقل الداخلي/3.png" alt="نافذة Record Transfer في نظام خدمات مابعد البيع لاختيار نوع النقل وتحديد الكمية" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تسجيل النقل وتحديد الكمية" title="اضغط لتكبير الصورة" />
            </figure>
          </article>
        </div>
        <p class="internal-transfer-transition-note">بعد تسجيل عملية النقل، تنتقل المهمة إلى مرحلة "جاري النقل".</p>
      </section>

      <section id="internal-transfer-step-readiness" class="panel invoice-training-section" aria-labelledby="internalTransferReadinessTitle" hidden>
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">02</span>
          <div><h2 id="internalTransferReadinessTitle">التحقق من الجاهزية وحجز الموعد</h2></div>
        </div>
        <p class="field-explanation-intro">في هذه المرحلة يتم التأكد من جاهزية البضاعة للتحويلات الداخلية، ثم تحديد موعد تنفيذ النقل عند الحاجة، حتى تكون العملية جاهزة للانتقال إلى مرحلة التنفيذ الفعلي.</p>
        ${renderWorkflowImagePlaceholder("مساحة مخصصة لصورة مرحلة التحقق من الجاهزية وحجز الموعد")}
      </section>

      <section id="internal-transfer-step-transit" class="panel invoice-training-section" aria-labelledby="internalTransferTransitTitle">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">02</span>
          <div><h2 id="internalTransferTransitTitle">جاري النقل</h2></div>
        </div>
        <p class="field-explanation-intro">في هذه المرحلة تكون البضاعة قيد النقل من المستودع الحالي إلى مستودع التجمع، وعند وصولها يتم استكمال إجراءات تأكيد الاستلام وتسجيل الكمية المستلمة.</p>
        <div class="internal-transfer-substeps">
          <article class="internal-transfer-substep">
            <h3 class="internal-transfer-substep-title">
              <span aria-hidden="true">أ</span>
              تأكيد الكمية المستلمة
            </h3>
            <p>عند وصول البضاعة إلى مستودع التجمع، يتم فتح مهمة التحويلات الداخلية والضغط على زر Confirm Receipt لبدء تأكيد الكمية المستلمة.</p>
            <figure class="odoo-screenshot-frame internal-transfer-screenshot">
              <img src="assest/النقل الداخلي/4.png" alt="مهمة التحويلات الداخلية في مرحلة جاري النقل مع تحديد زر Confirm Receipt" tabindex="0" role="button" aria-label="اضغط لتكبير صورة فتح Confirm Receipt" title="اضغط لتكبير الصورة" />
            </figure>
          </article>

          <article class="internal-transfer-substep">
            <h3 class="internal-transfer-substep-title">
              <span aria-hidden="true">ب</span>
              تسجيل الكمية المستلمة
            </h3>
            <p>يقوم الموظف بتأكيد استلام كامل الكمية أو جزء منها حسب الاستلام الفعلي، ثم يضغط على زر تأكيد الاستلام.</p>
            <aside class="internal-transfer-receipt-note">في حال وجود فرق بين الكمية المرسلة والمستلمة، يظهر الفرق ويمكن تسجيل ملاحظة توضح السبب.</aside>
            <figure class="odoo-screenshot-frame internal-transfer-screenshot">
              <img src="assest/النقل الداخلي/5.png" alt="نافذة Confirm Receipt لإدخال الكمية المستلمة وتوضيح فرق الكمية" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تسجيل الكمية المستلمة" title="اضغط لتكبير الصورة" />
            </figure>
          </article>
        </div>
        <p class="internal-transfer-transition-note">بعد نجاح عملية تأكيد الاستلام (<bdi dir="ltr">Confirm Receipt</bdi>)، تنتقل المهمة تلقائيًا من مرحلة جاري النقل إلى مرحلة تم الاستلام.</p>
      </section>

      <section id="internal-transfer-step-received" class="panel invoice-training-section" aria-labelledby="internalTransferReceivedTitle">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">03</span>
          <div><h2 id="internalTransferReceivedTitle">تم الاستلام</h2></div>
        </div>
        <p class="field-explanation-intro">بعد تأكيد استلام البضاعة في مستودع التجمع، تنتقل المهمة إلى مرحلة تم الاستلام، وبذلك يكتمل مسار التحويلات الداخلية.</p>
        <figure class="odoo-screenshot-frame internal-transfer-screenshot">
          <img src="assest/النقل الداخلي/8.png" alt="لوحة عمليات التحويلات الداخلية في نظام خدمات مابعد البيع مع تمييز مهمة التحويلات الداخلية في عمود تم الاستلام" tabindex="0" role="button" aria-label="اضغط لتكبير صورة مرحلة تم الاستلام" title="اضغط لتكبير الصورة" />
        </figure>
      </section>
    </div>`;
}

function renderWarehousePickupWorkflow() {
  const stages = [
    {
      title: "فاتورة من SAP",
      description: "وصول فاتورة من SAP تحتوي على خدمة استلام العميل البضاعة من المستودع.",
    },
    {
      title: "إرسال رسالة إلى العميل",
      description: "يقوم النظام تلقائيًا بإرسال رسالة إلى العميل لإبلاغه بجاهزية البضاعة للاستلام من المستودع.",
    },
    {
      title: "تأكيد استلام العميل",
      description: "بعد استلام العميل للبضاعة، يتم تأكيد الاستلام داخل النظام وتكتمل دورة الخدمة.",
    },
  ];

  return `
    <div class="workflow-content warehouse-pickup-workflow">
      <header class="case-header" aria-labelledby="warehousePickupTitle">
        <div>
          <h1 id="warehousePickupTitle">${warehousePickupTour.title}</h1>
          ${renderWorkflowFlow(warehousePickupTour, {
            activeTargetId: warehousePickupTour.children[0].targetId,
            numberStart: 0,
          })}
        </div>
      </header>
      ${stages.map((stage, index) => {
        const step = warehousePickupTour.children[index];
        const titleId = `warehousePickupStage${index}Title`;
        return `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${titleId}">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${String(index).padStart(2, "0")}</span>
          <div><h2 id="${titleId}">${stage.title}</h2></div>
        </div>
        <p class="field-explanation-intro">${stage.description}</p>
        <aside class="internal-transfer-example"><strong>التنفيذ:</strong> آلي من خلال النظام</aside>
      </section>`;
      }).join("")}
    </div>`;
}

function renderDesignWorkflow() {
  const stageDescriptions = [
    "تبدأ دورة خدمة التصميم بوصول فاتورة من SAP تحتوي على خدمة التصميم إلى نظام خدمات ما بعد البيع، حيث يتم إنشاء طلب التصميم وبدء متابعة الخدمة.",
    "بعد وصول الفاتورة وإنشاء خدمة التصميم، يظهر الطلب في مرحلة طلب تصميم ليتم بدء متابعة الخدمة وتجهيزها للإسناد إلى المصمم.",
    "في هذه المرحلة يتم إسناد طلب التصميم إلى المصمم المسؤول عن تنفيذ الخدمة، ليصبح الطلب جاهزًا للبدء في إعداد التصميم.",
    "بعد إسناد الطلب إلى المصمم، تنتقل المهمة إلى مرحلة جاري العمل على التصميم، حيث يبدأ المصمم بإعداد التصميم ومتابعة متطلبات العميل والمواصفات المطلوبة.",
    "بعد إعداد التصميم، يتم استكمال المراجعات والموافقات الداخلية المطلوبة للتأكد من جاهزية التصميم قبل عرضه على العميل.",
    "بعد اكتمال الموافقات الداخلية، ينتقل الطلب إلى مرحلة بانتظار موافقة العميل، حيث يتم عرض أو إرسال التصميم للعميل لاعتماده.",
    "بعد اعتماد العميل للتصميم، تنتقل المهمة إلى مرحلة مكتمل ومعتمد، وبذلك تكتمل دورة خدمة التصميم.",
  ];
  const stageFigures = {
    0: `
        <figure class="odoo-screenshot-frame">
          <img src="assest/التصميم/1.png" alt="لوحة عمليات خدمة التصميم في نظام خدمات مابعد البيع وتعرض مراحل طلب تصميم ومُسندة لمصمم وجاري العمل على التصميم وموافقات داخلية وبانتظار موافقة العميل ومكتمل ومعتمد" tabindex="0" role="button" aria-label="اضغط لتكبير صورة لوحة خدمة التصميم" title="اضغط لتكبير الصورة" />
        </figure>`,
  };

  return `
    <div class="workflow-content design-workflow">
      <header class="case-header" aria-labelledby="designWorkflowTitle">
        <div>
          <h1 id="designWorkflowTitle">${designTour.title}</h1>
          ${renderWorkflowFlow(designTour, {
            activeTargetId: designTour.children[0].targetId,
            numberStart: 0,
          })}
        </div>
      </header>
      ${designTour.children.map((step, index) => {
        const titleId = `designStage${index}Title`;
        return `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${titleId}">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${String(index).padStart(2, "0")}</span>
          <div><h2 id="${titleId}">${step.title}</h2></div>
        </div>
        <p class="field-explanation-intro">${stageDescriptions[index]}</p>
        <aside class="internal-transfer-example"><strong>التنفيذ:</strong> يدوي / إدارة التصميم</aside>${stageFigures[index] || ""}
      </section>`;
      }).join("")}
    </div>`;
}

function renderManufacturingWorkflow() {
  const stages = [
    {
      description: "تبدأ دورة خدمة التصنيع بوصول فاتورة من SAP تحتوي على خدمة التصنيع إلى نظام خدمات ما بعد البيع، حيث يتم إنشاء طلب الخدمة وبدء متابعة دورة التصنيع.",
      execution: "آلي من خلال النظام",
      figure: `
        <figure class="odoo-screenshot-frame">
          <img src="assest/التصنيع/1.png" alt="لوحة عمليات خدمة التصنيع في نظام خدمات مابعد البيع وتعرض مراحل طلب خدمة تصنيع وإرسال إلى ورشة التصنيع وجاري التصنيع وتم الانتهاء من الخدمة" tabindex="0" role="button" aria-label="اضغط لتكبير صورة لوحة خدمة التصنيع" title="اضغط لتكبير الصورة" />
        </figure>`,
    },
    {
      description: "بعد وصول الفاتورة وإنشاء الخدمة، يظهر الطلب في مرحلة طلب خدمة تصنيع ليتم تجهيز الطلب وبدء متابعته قبل تحويله إلى ورشة التصنيع.",
      execution: "آلي من خلال النظام",
    },
    {
      description: "في هذه المرحلة يتم تحويل طلب التصنيع إلى ورشة التصنيع المختصة، لتبدأ الجهة المسؤولة باستلام الطلب وتجهيزه للتنفيذ حسب المواصفات المطلوبة.",
      execution: "يدوي / إدارة التصنيع",
    },
    {
      description: "بعد إرسال الطلب إلى ورشة التصنيع، تنتقل المهمة إلى مرحلة جاري التصنيع، حيث يتم تنفيذ أعمال التصنيع ومتابعة سير العمل وفق المواصفات المعتمدة.",
      execution: "يدوي / إدارة التصنيع",
    },
    {
      description: "بعد اكتمال أعمال التصنيع، تنتقل المهمة إلى مرحلة تم الانتهاء من الخدمة، وبذلك تكتمل دورة خدمة التصنيع داخل النظام.",
      execution: "يدوي / إدارة التصنيع",
    },
  ];

  return `
    <div class="workflow-content manufacturing-workflow">
      <header class="case-header" aria-labelledby="manufacturingWorkflowTitle">
        <div>
          <h1 id="manufacturingWorkflowTitle">${manufacturingTour.title}</h1>
          ${renderWorkflowFlow(manufacturingTour, {
            activeTargetId: manufacturingTour.children[0].targetId,
            numberStart: 0,
          })}
        </div>
      </header>
      ${manufacturingTour.children.map((step, index) => {
        const stage = stages[index];
        const titleId = `manufacturingStage${index}Title`;
        return `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${titleId}">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${String(index).padStart(2, "0")}</span>
          <div><h2 id="${titleId}">${step.title}</h2></div>
        </div>
        <p class="field-explanation-intro">${stage.description}</p>
        <aside class="internal-transfer-example"><strong>التنفيذ:</strong> ${stage.execution}</aside>${stage.figure || ""}
      </section>`;
      }).join("")}
    </div>`;
}

// الشكاوى / الاستفسارات — the Helpdesk training flow. Same markup and classes as the Delivery flow
// (#workflowContent in index.html): numbered sections, lettered sub-steps (title → explanation →
// screenshot), full-width frames for full Odoo screens and booking-tour-grid pairs for related steps.
// Screenshots: helpdesk/1–3 → 00; complaint folder 1–2 → 01, 3–5 → 02, 6–7 → 03 (ticket #00265);
// 8–11 → 04 (a different ticket, #00202).
function renderComplaintsWorkflow() {
  const helpdesk = "assest/خدمة العملاء/helpdesk";
  const tickets = `${helpdesk}/من وين تأتي الشكوى وانواع الشكوى`;
  const ltr = (text) => `<bdi dir="ltr">${text}</bdi>`;
  // Arabic meaning first, the original Odoo term in parentheses. Non-breaking spaces keep the
  // English term, and the term with its Arabic meaning, from splitting across lines.
  const term = (ar, en) => `${ar}\u00A0${ltr(`(${en.replace(/ /g, "\u00A0")})`)}`;
  const shot = (src, alt, label, frameClass = "") => `
            <figure class="odoo-screenshot-frame${frameClass ? ` ${frameClass}` : ""}">
              <img src="${src}" alt="${alt}" tabindex="0" role="button" aria-label="اضغط لتكبير صورة ${label}" title="اضغط لتكبير الصورة" />
            </figure>`;
  const substep = (badge, id, title, explanation, figure, articleClass = "") => `
          <article class="training-screen-column${articleClass ? ` ${articleClass}` : ""}" aria-labelledby="${id}">
            <div class="section-title compact">
              <span class="icon-tile" aria-hidden="true">${badge}</span>
              <div><h2 id="${id}">${title}</h2></div>
            </div>
            ${figure}
            <div class="field-explanation" aria-label="${title.replace(/<[^>]+>/g, "")}">
              <p class="field-explanation-intro">${explanation}</p>
            </div>
          </article>`;
  const single = (...args) => substep(...args, "booking-confirmation-step");
  const pair = (...steps) => `
        <div class="booking-tour-grid">${steps.join("")}
        </div>`;
  const reference = (title, body) => `
        <div class="field-explanation helpdesk-reference">
          <h3 class="installation-substep-heading"><strong>${title}</strong></h3>
          ${body}
        </div>`;

  const bodies = [
    // 00 — الدخول إلى Helpdesk
    `
        <p class="field-explanation-intro" dir="rtl">تتم معالجة الشكاوى والاستفسارات من خلال تطبيق ${term("مكتب المساعدة", "Helpdesk")}، حيث تُسجَّل الحالة على شكل ${term("تذكرة", "Ticket")} ضمن فريق ${term("خدمة العملاء", "Customer Care")}.</p>
        ${single("أ", "helpdeskAppTitle", `فتح تطبيق ${term("مكتب المساعدة", "Helpdesk")}`,
          `من الصفحة الرئيسية لنظام خدمات مابعد البيع، يتم الضغط على تطبيق ${term("مكتب المساعدة", "Helpdesk")}.`,
          shot(`${helpdesk}/1.png`, "الصفحة الرئيسية لنظام خدمات مابعد البيع مع تحديد تطبيق Helpdesk", "تطبيق Helpdesk", "booking-confirmation-frame"))}
        ${single("ب", "helpdeskTeamTitle", `الدخول إلى ${term("خدمة العملاء", "Customer Care")} وفتح ${term("التذاكر", "Tickets")}`,
          `تظهر صفحة ${term("نظرة عامة على مكتب المساعدة", "Helpdesk Overview")}، ومنها يتم الضغط على زر ${term("التذاكر", "Tickets")} داخل بطاقة فريق ${term("خدمة العملاء", "Customer Care")} لعرض تذاكر الفريق.`,
          shot(`${helpdesk}/2.png`, "صفحة Helpdesk Overview مع تحديد زر Tickets في بطاقة فريق Customer Care", "بطاقة فريق Customer Care"))}
        ${single("ج", "helpdeskBoardTitle", "عرض لوحة التذاكر",
          `تظهر لوحة تذاكر ${term("خدمة العملاء", "Customer Care")} وفيها التذاكر موزعة على مراحل ${term("مكتب المساعدة", "Helpdesk")}، ويظهر على كل بطاقة عنوان التذكرة ورقمها واسم العميل و${term("الوسوم", "Tags")} الخاصة بها.`,
          shot(`${helpdesk}/3.png`, "لوحة تذاكر Customer Care وتظهر فيها مراحل New و Assigned to و In Progress و waiting on CS و Solved", "لوحة التذاكر"))}
        ${reference(`مراحل التذكرة في ${term("مكتب المساعدة", "Helpdesk")}`, `
          <p class="driver-portal-flow">${term("جديد", "New")} ← ${term("مُسند إلى", "Assigned to")} ← ${term("قيد التنفيذ", "In Progress")} ← ${term("بانتظار خدمة العملاء", "waiting on CS")} ← ${term("تم الحل", "Solved")}</p>
          <p class="field-explanation-intro">كما تتوفر مرحلة ${term("ملغي", "Cancelled")} ضمن مراحل لوحة التذاكر.</p>`)}`,
    // 01 — إنشاء تذكرة من فاتورة العميل
    `
        <p class="field-explanation-intro" dir="rtl">يمكن إنشاء التذكرة من داخل فاتورة العميل، بحيث ترتبط التذكرة بالعميل والفاتورة الخاصة بالشكوى أو الاستفسار.</p>
        ${single("أ", "ticketInvoiceTitle", `فتح فاتورة العميل والدخول إلى ${term("مكتب المساعدة", "Helpdesk")}`,
          `من فاتورة العميل، يتم الضغط على زر ${term("مكتب المساعدة", "Helpdesk")} أعلى الفاتورة لعرض التذاكر المرتبطة بها، ويظهر على الزر عدد هذه التذاكر.`,
          shot(`${tickets}/1 انشئ تذكرة للعميل على مكشلة معينة.png`, "فاتورة العميل في نظام خدمات مابعد البيع مع تحديد زر Helpdesk", "زر Helpdesk في فاتورة العميل"))}
        ${single("ب", "ticketListTitle", "عرض التذاكر الموجودة وإنشاء تذكرة جديدة",
          `تظهر قائمة التذاكر الموجودة على هذه الفاتورة مع المرحلة الحالية لكل تذكرة، ولإنشاء تذكرة جديدة يتم الضغط على زر ${term("جديد", "New")}.`,
          shot(`${tickets}/2 هون منشوف التذاكر الموجودة على هل فاتورة.png`, "قائمة التذاكر الموجودة على الفاتورة مع تحديد زر New لإنشاء تذكرة جديدة", "قائمة تذاكر الفاتورة"))}`,
    // 02 — إدخال بيانات التذكرة
    `
        <p class="field-explanation-intro" dir="rtl">بعد الضغط على ${term("جديد", "New")} يُفتح نموذج التذكرة الجديدة ضمن فريق ${term("خدمة العملاء", "Customer Care")}، وتظهر فيه بيانات ${term("العميل", "Customer")} و${term("حالة العملية", "Operation Case")} و${term("الفاتورة", "Invoice")}، ثم يتم إدخال بيانات الشكوى أو الاستفسار.</p>
        ${single("أ", "ticketMainDataTitle", "عنوان التذكرة ونوعها ووصفها وأولويتها",
          `يتم إدخال اسم الشكوى كعنوان للتذكرة، مثل «تأخير التوصيل»، ثم اختيار نوع الحالة من حقل ${term("نوع الاستفسار", "Inquiry Type")}، وكتابة تفاصيل الحالة في تبويب ${term("الوصف", "Description")}، وتحديد ${term("أولوية التذكرة", "Priority")} من خلال النجوم.`,
          shot(`${tickets}/3 هون منحط اسم الشكوى ونوع الشكوى  وديسكبريشن وقوة العميل يعني البيروتي.png`, "نموذج تذكرة جديدة بعنوان تأخير التوصيل مع تحديد حقول Inquiry Type و Priority و Description", "بيانات التذكرة"))}
        ${reference(`أنواع الحالة في حقل ${term("نوع الاستفسار", "Inquiry Type")}`, `
          <p class="field-explanation-intro">يحتوي حقل ${term("نوع الاستفسار", "Inquiry Type")} على أربعة أنواع: ${term("استفسار مباشر", "Direct Inquiry")}، ${term("استفسار غير مباشر", "Indirect Inquiry")}، ${term("شكوى فنية", "Technical Complaint")}، ${term("شكوى إدارية", "Administrative Complaint")}.</p>`)}
        ${pair(
          substep("ب", "ticketAssigneeTitle", `حقل ${term("مُسند إلى", "Assigned to")}`,
            `يتم اختيار الشخص المسؤول عن متابعة الحالة مع العميل من حقل ${term("مُسند إلى", "Assigned to")}.`,
            shot(`${tickets}/4 عميل اسين لشخص للمتابعه مع العميل .png`, "قائمة المستخدمين في حقل Assigned to داخل التذكرة", "حقل Assigned to")),
          substep("ج", "ticketTaskTitle", `ربط التذكرة ${term("بالمهمة", "Task")}`,
            `يتم اختيار المهمة من حقل ${term("المهمة", "Task")} لربط التذكرة بالخدمة الموجودة على الفاتورة.`,
            shot(`${tickets}/5 الخدمات الموجودة على هل فاتورة.png`, "قائمة المهام في حقل Task داخل التذكرة", "حقل Task")),
        )}`,
    // 03 — حفظ التذكرة
    `
        <p class="field-explanation-intro" dir="rtl">بعد الانتهاء من إدخال بيانات التذكرة وحفظها، يظهر رقم التذكرة ويتم إرسال رسالة إلى العميل برقم الشكوى.</p>
        ${single("أ", "ticketNumberTitle", "ظهور رقم التذكرة ورسالة العميل",
          `يظهر رقم التذكرة بجانب عنوانها ${ltr("(#00265)")}، وتظهر في سجل التذكرة الرسالة المرسلة إلى العميل، والتي تفيد باستلام طلبه ومراجعته من فريق ${term("خدمة العملاء", "Customer Care")}، وتتضمن رقم مرجع التذكرة ${ltr("00265")}.`,
          shot(`${tickets}/6 عند الانتهاء من ادخال بيانات الشكوى يتم ارسال رساله للعميل برقم الشكوةى.png`, "التذكرة بعد الحفظ برقم 00265 والرسالة المرسلة إلى العميل في سجل التذكرة", "رقم التذكرة ورسالة العميل"))}
        ${single("ب", "ticketNewStageTitle", `ظهور التذكرة في مرحلة ${term("جديد", "New")}`,
          `بعد إنشاء التذكرة تظهر في لوحة تذاكر ${term("خدمة العملاء", "Customer Care")} ضمن مرحلة ${term("جديد", "New")}.`,
          shot(`${tickets}/7 بعد انتهاء من انشاء التذكرة تظهر في نيو.png`, "لوحة تذاكر Customer Care وتظهر فيها تذكرة تأخير التوصيل في مرحلة New", "التذكرة في مرحلة New"))}`,
    // 04 — المتابعة الداخلية (a different ticket: #00202)
    `
        <p class="field-explanation-intro" dir="rtl">يمكن مشاركة التذكرة مع شخص آخر في الإدارة، مثل فني أو مشرف، لمتابعة الحالة وتسجيل الإجراء الذي تم.</p>
        <p class="field-explanation-intro" dir="rtl"><strong>ملاحظة:</strong> صور هذه المرحلة مأخوذة من تذكرة أخرى ${ltr("(#00202)")} غير التذكرة المستخدمة في المراحل السابقة، وتظهر فيها التذكرة في مرحلة ${term("قيد التنفيذ", "In Progress")}.</p>
        ${single("أ", "ticketShareTitle", `${term("مشاركة التذكرة", "Share Ticket")}`,
          `لمشاركة التذكرة مع شخص آخر، يتم الضغط على زر ${term("مشاركة التذكرة", "Share Ticket")} أعلى التذكرة.`,
          shot(`${tickets}/8 لمشاركة التذكرة مع شخص اخر في الادارة مع فني او مشرف نضغط.png`, "تذكرة في مرحلة In Progress مع تحديد زر Share Ticket", "زر Share Ticket"))}
        ${pair(
          substep("ب", "ticketShareWithTitle", "اختيار من تتم مشاركة التذكرة معه",
            `تظهر نافذة ${term("مشاركة المستند", "Share Document")}، ويتم من خلالها اختيار مشاركة التذكرة داخليًا أو خارجيًا من قائمة ${term("المشاركة مع", "Share With")} التي تتضمن ${term("مستخدمون داخليون", "Internal Users")} و${term("مستخدمو البوابة", "Portal Users")} و${term("جهة اتصال", "Contact")}، ثم تحديد ${term("المستلمين", "Recipients")} والضغط على ${term("إرسال", "Send")}.`,
            shot(`${tickets}/9 بعد الضغط على شير تيكت يمكن اختيار من تريد انت تعمله شير داخلي ام خارجي.png`, "نافذة Share Document مع خيارات Internal Users و Portal Users و Contact", "نافذة Share Document")),
          substep("ج", "ticketActivityTitle", `${term("جدولة نشاط", "Schedule Activity")}`,
            `يفتح الشخص الذي تمت مشاركة التذكرة معه التذكرة ويضغط على ${term("النشاط", "Activity")}، فتظهر نافذة ${term("جدولة نشاط", "Schedule Activity")}، ثم يختار نوع النشاط مثل ${term("مكالمة", "Call")} ويكتب الإجراء الذي تم، مثل: «تم التواصل مع العميل وسيتم ارسال فني لمعالجة المشكلة»، ثم يحفظ النشاط.`,
            shot(`${tickets}/10 يضغط الشخص لي عملناله شير على اكتفيتي ويكتب شو عمل .png`, "نافذة Schedule Activity لتسجيل الإجراء الذي تم على التذكرة", "نافذة Schedule Activity")),
        )}
        ${single("د", "ticketPlannedActivitiesTitle", `ظهور النشاط في ${term("الأنشطة المخططة", "Planned Activities")}`,
          `يظهر النشاط المسجل في قسم ${term("الأنشطة المخططة", "Planned Activities")} على يمين التذكرة، مع موعد استحقاقه ونص الإجراء الذي تم تسجيله.`,
          shot(`${tickets}/11 تظهر في الاكفيتي عل اليمين.png`, "قسم Planned Activities في التذكرة ويظهر فيه نشاط Call والإجراء المسجل", "قسم Planned Activities"))}`,
  ];

  return `
    <div class="workflow-content customer-service-complaints-workflow">
      <header class="case-header" aria-labelledby="complaintsTitle">
        <div>
          <h1 id="complaintsTitle">${complaintsTour.title}</h1>
          ${renderWorkflowFlow(complaintsTour, { activeTargetId: complaintsTour.children[0].targetId, numberStart: 0 })}
        </div>
      </header>
      ${renderOverviewVideo("complaintsOverviewVideoTitle", "فيديو شرح دورة الشكاوى والاستفسارات كاملة", "شاهد دورة معالجة الشكاوى والاستفسارات كاملة داخل تطبيق مكتب المساعدة، من فتح التذكرة وحتى متابعتها داخليًا.", "videos/customer-service-complaints.mp4")}
      ${complaintsTour.children.map((step, index) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="complaintsStage${index}Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${String(index).padStart(2, "0")}</span>
          <div><h2 id="complaintsStage${index}Title">${step.title}</h2></div>
        </div>${bodies[index]}
      </section>`).join("")}
    </div>`;
}

// خدمة الصيانة. Screenshots from assest/الصيانة: 1–2 → 00, 3 → 01, 4–8 → 03 (activating and filling
// the maintenance form, then its approvals & signatures), 9 → 06 (Send OTP), 10 → 07.
function renderMaintenanceWorkflow() {
  const images = "assest/الصيانة";
  const shot = (file, alt, label) => `
          <figure class="odoo-screenshot-frame">
            <img src="${images}/${file}" alt="${alt}" tabindex="0" role="button" aria-label="اضغط لتكبير صورة ${label}" title="اضغط لتكبير الصورة" />
          </figure>`;
  const execution = (label) => `<aside class="internal-transfer-example"><strong>التنفيذ:</strong> ${label}</aside>`;
  const substep = (badge, title, body) => `
          <article class="technician-assignment-step">
            <h3 class="installation-substep-heading" aria-label="${badge} — ${title}"><span class="installation-substep-badge" aria-hidden="true">${badge}</span><span>— ${title}</span></h3>
            ${body}
          </article>`;
  const transition = `<span class="technician-assignment-transition" aria-hidden="true">↓</span>`;
  const bodies = [
    // 00 — طلب صيانة جديد
    `
        <p class="field-explanation-intro">تبدأ دورة خدمة الصيانة بإنشاء طلب صيانة جديد داخل نظام خدمات ما بعد البيع من قبل خدمة العملاء، فيظهر الطلب في مرحلة طلب صيانة جديد ويصبح جاهزًا للمعالجة ضمن مراحل الصيانة.</p>
        ${shot("1.png", "لوحة مهام الصيانة في نظام خدمات مابعد البيع وتظهر فيها الطلبات في مرحلة طلب صيانة جديد", "لوحة طلبات الصيانة")}
        ${shot("2.png", "طلب صيانة جديد مفتوح في مرحلة طلب صيانة جديد ويعرض المشروع والفاتورة ومستودع التشغيل", "بيانات طلب الصيانة الجديد")}
        ${execution("يدوي / خدمة العملاء")}`,
    // 01 — جدولة موعد
    `
        <p class="field-explanation-intro">بعد إنشاء الطلب ينتقل إلى مرحلة جدولة موعد، حيث يتم تحديد موعد وإرسال رسالة للعميل لحجز موعد للصيانة ومعاينة المشكلة بشكل ميداني.</p>
        <p class="field-explanation-intro">هذا الموعد هو موعد المعاينة الأولية في موقع العميل، والهدف منه أن يقوم الفني بفحص الحالة وتحديد طبيعة المشكلة، ومعرفة الإجراء المطلوب، مثل ما إذا كانت الحالة تحتاج إلى صيانة، إصلاح، استبدال جزء، أو أي إجراء آخر قبل الانتقال إلى المراحل التالية من الخدمة.</p>
        ${shot("3.png", "مهمة الصيانة في مرحلة جدولة موعد وتظهر فيها حقول Appointment From و Appointment To", "جدولة موعد المعاينة")}
        ${execution("يدوي / خدمة العملاء")}`,
    // 02 — في انتظار تعيين فني
    `
        <p class="field-explanation-intro">بعد جدولة موعد المعاينة، يكون طلب الصيانة في مرحلة في انتظار تعيين فني حتى يتم تعيين الفني المسؤول عن زيارة المعاينة الأولى وتشخيص المشكلة في موقع العميل، ويتم التعيين من قبل الجهة المختصة.</p>
        ${execution("يدوي / الجهة المختصة")}`,
    // 03 — التقرير المبدئي
    `
        <p class="field-explanation-intro">يزور الفني موقع العميل ويعاين المشكلة، ثم يعبئ التقرير المبدئي من خلال نموذج الصيانة المرتبط بالمهمة:</p>
        <div class="technician-assignment-flow" aria-label="خطوات تفعيل وتعبئة نموذج الصيانة">
          ${substep("أ", "تفعيل نموذج الصيانة", `<p class="field-explanation-intro">من داخل المهمة، يتم فتح تبويب Task Forms لتفعيل نموذج الصيانة.</p>
            ${shot("4.png", "مهمة الصيانة في مرحلة التقرير المبدئي مع تحديد تبويب Task Forms", "تبويب Task Forms")}`)}
          ${transition}
          ${substep("ب", "اختيار نموذج الصيانة وحفظ المهمة", `<p class="field-explanation-intro">في تبويب Task Forms، يتم اختيار نموذج الصيانة ضمن النماذج الظاهرة على المهمة، ثم حفظ المهمة.</p>
            ${shot("5.png", "تبويب Task Forms مع اختيار نموذج الصيانة وحفظ المهمة", "اختيار نموذج الصيانة")}`)}
          ${transition}
          ${substep("ج", "فتح نموذج الصيانة", `<p class="field-explanation-intro">بعد الحفظ يظهر زر نموذج الصيانة أعلى المهمة، ومنه يتم فتح النموذج.</p>
            ${shot("6.png", "زر نموذج الصيانة يظهر أعلى مهمة الصيانة بعد تفعيل النموذج", "زر نموذج الصيانة")}`)}
          ${transition}
          ${substep("د", "تعبئة بيانات التقرير", `<p class="field-explanation-intro">يعبئ الفني بيانات المعاينة في النموذج، مثل بيانات المستودع وتاريخ الفحص، ووصف المشكلة وكود الصنف والكمية المعيوبة، وملاحظات الورشة، وصور التوثيق.</p>
            ${shot("7.png", "نموذج الصيانة ويعرض بيانات المستودع والعميل ووصف المشكلة والكمية المعيوبة وملاحظات الورشة وصورة التوثيق", "نموذج الصيانة")}`)}
          ${transition}
          ${substep("هـ", "الاعتمادات والتوقيعات", `<p class="field-explanation-intro">يتضمن النموذج قسم الاعتمادات والتوقيعات <bdi dir="ltr">(Approvals &amp; Signatures)</bdi>، الذي يوثّق توقيعات المسؤولين على التقرير: فني الصيانة، وأمين المستودع، ومشرف الورشة الفنية، ومشرف الفرع، ومسؤول إدارة الصنف.</p>
            ${shot("8.png", "قسم الاعتمادات والتوقيعات في نموذج الصيانة ويضم توقيع فني الصيانة وأمين المستودع ومشرف الورشة الفنية ومشرف الفرع", "الاعتمادات والتوقيعات")}`)}
        </div>
        ${execution("يدوي / الجهة المختصة")}`,
    // 04 — في انتظار قطع الغيار
    `
        <p class="field-explanation-intro">إذا أظهر التقرير المبدئي أن الحالة تحتاج إلى قطع غيار، ينتظر طلب الصيانة في هذه المرحلة حتى تتوفر القطع المطلوبة.</p>`,
    // 05 — تحديد موعد الصيانة
    `
        <p class="field-explanation-intro">بعد جاهزية الحالة، تقوم خدمة العملاء بتحديد موعد تنفيذ أعمال الصيانة.</p>
        <p class="field-explanation-intro">هذا موعد تنفيذ أعمال الصيانة الفعلية بعد التشخيص وجاهزية الحالة، ويختلف عن موعد المرحلة 01 (جدولة موعد) الذي يُحدَّد لمعاينة المشكلة في موقع العميل.</p>
        ${execution("يدوي / خدمة العملاء")}`,
    // 06 — جاري العمل بالموقع
    `
        <p class="field-explanation-intro">في الموعد المحدد يقوم الفني بتنفيذ أعمال الصيانة في موقع العميل.</p>
        <p class="field-explanation-intro">بعد الانتهاء من الأعمال، يُستخدم زر <bdi dir="ltr">Send OTP &amp; PDF</bdi> في نموذج الصيانة لإرسال رمز التحقق (OTP) كخطوة تأكيد نهائية قبل إغلاق مهمة الصيانة. ويعرض النموذج حالاته: <bdi dir="ltr">Draft</bdi> ثم <bdi dir="ltr">OTP Sent</bdi> ثم <bdi dir="ltr">Verified</bdi>.</p>
        ${shot("9.png", "زر Send OTP & PDF في نموذج الصيانة للتأكيد النهائي قبل إغلاق المهمة", "زر Send OTP & PDF")}
        ${execution("يدوي / الفني")}`,
    // 07 — مكتملة
    `
        <p class="field-explanation-intro">بعد التأكيد النهائي من خلال OTP، تنتقل مهمة الصيانة إلى مرحلة مكتملة، وبذلك تكتمل خدمة الصيانة وتُغلق بنجاح.</p>
        ${shot("10.png", "لوحة مهام الصيانة مع تحديد مرحلة مكتملة وفيها طلب صيانة مكتمل", "مرحلة مكتملة")}`,
  ];

  return `
    <div class="workflow-content customer-service-maintenance-workflow">
      <header class="case-header" aria-labelledby="maintenanceTitle">
        <div>
          <h1 id="maintenanceTitle">${maintenanceTour.title}</h1>
          ${renderWorkflowFlow(maintenanceTour, { activeTargetId: maintenanceTour.children[0].targetId, numberStart: 0 })}
        </div>
      </header>
      ${maintenanceTour.children.map((step, index) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="maintenanceStage${index}Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${String(index).padStart(2, "0")}</span>
          <div><h2 id="maintenanceStage${index}Title">${step.title}</h2></div>
        </div>${bodies[index]}
      </section>`).join("")}
    </div>`;
}

const customerServiceSources = [
  {
    title: "من الإدارات الداخلية",
    description: "تصل الحالة إلى خدمة العملاء من إحدى الإدارات الداخلية عندما يظهر موقف مع العميل يحتاج إلى متابعة من خدمة العملاء.",
    examples: ["عميل رفض التوقيع", "عميل غير راضٍ عن التركيب", "صعوبة تواصل"],
    flow: renderConvertToTicketFlow,
  },
  {
    title: "من العميل مباشرة",
    description: "يتواصل العميل مباشرة مع خدمة العملاء لتقديم استفسار أو شكوى.",
    examples: ["استفسار", "شكوى"],
    flow: renderNoAccountComplaintFlow,
  },
  {
    title: "من النظام",
    description: "تظهر الحالة من خلال النظام عند وجود طلب يحتاج إلى متابعة من خدمة العملاء.",
    examples: ["حالة عالقة", "عميل لم يحجز موعد", "تأخر في إجراء مطلوب"],
    flow: renderAppointmentNotBookedFlow,
  },
];

function renderCustomerServiceSources() {
  return `
    <div class="workflow-content customer-service-sources">
      <header class="case-header" aria-labelledby="customerServiceSourcesTitle">
        <div>
          <h1 id="customerServiceSourcesTitle">كيف تصل الحالات إلى خدمة العملاء؟</h1>
          <p>ثلاثة مصادر تغذّي جهة واحدة مسؤولة عن كل حالة.</p>
          <div class="cs-sources-diagram" aria-label="مصادر الحالات التي تصل إلى خدمة العملاء">
            <div class="cs-sources-row">
              ${customerServiceSources.map((source, index) => `
                <div class="cs-source-card">
                  <span class="workflow-flow-index">${String(index + 1).padStart(2, "0")}</span>
                  <strong>${source.title}</strong>
                  <ul>${source.examples.map((example) => `<li>${example}</li>`).join("")}</ul>
                </div>`).join("")}
            </div>
            <span class="cs-sources-merge" aria-hidden="true">↓</span>
            <div class="workflow-flow-node active cs-sources-target">
              <span>خدمة العملاء</span>
            </div>
          </div>
        </div>
      </header>
      ${renderOverviewVideo("customerServiceSourcesVideoTitle", "فيديو شرح مصادر الحالات", "شاهد كيف تصل الحالات إلى خدمة العملاء من المصادر الثلاثة: الإدارات الداخلية، والعميل مباشرة، والنظام.", "videos/customer-service-sources.mp4")}
      <p class="internal-transfer-result-note"><strong>ملاحظة:</strong> جميع القنوات الثلاثة تصب في جهة واحدة لإدارة الحالة ومتابعتها حتى الإغلاق.</p>
      ${customerServiceSources.map((source, index) => `
      <section class="panel invoice-training-section" aria-labelledby="customerServiceSource${index + 1}Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <div><h2 id="customerServiceSource${index + 1}Title">${source.title}</h2></div>
        </div>
        <p class="field-explanation-intro">${source.description}</p>
        <aside class="internal-transfer-example"><strong>أمثلة:</strong> ${source.examples.join("، ")}.</aside>${source.flow ? source.flow() : ""}
      </section>`).join("")}
    </div>`;
}

// Worked examples under the case sources on كيف تصل الحالات إلى خدمة العملاء؟, in the Helpdesk /
// Delivery sub-step style (title → screenshot → explanation). Screenshots are frames from the
// Customer Service training video in assest/review_selected_frames, used uncropped.
const sourceLtr = (text) => `<bdi dir="ltr">${text}</bdi>`;
// Arabic meaning first, the original Odoo term in parentheses, kept on one line.
const sourceTerm = (ar, en) => `${ar}\u00A0${sourceLtr(`(${en.replace(/ /g, "\u00A0")})`)}`;

function renderSourceExampleFlow({ images, heading, intro, steps }) {
  const step = ({ badge, id, title, explanation, file, alt, label }) => `
        <article class="training-screen-column booking-confirmation-step" aria-labelledby="${id}">
          <div class="section-title compact">
            <span class="icon-tile" aria-hidden="true">${badge}</span>
            <div><h2 id="${id}">${title}</h2></div>
          </div>${file ? `
          <figure class="odoo-screenshot-frame">
            <img src="${images}/${file}" alt="${alt}" tabindex="0" role="button" aria-label="اضغط لتكبير صورة ${label}" title="اضغط لتكبير الصورة" />
          </figure>` : ""}
          <div class="field-explanation" aria-label="${title.replace(/<[^>]+>/g, "")}">
            <p class="field-explanation-intro">${explanation}</p>
          </div>
        </article>`;

  return `
        <div class="field-explanation source-example-flow">
          <h3 class="installation-substep-heading"><strong>مثال: ${heading}</strong></h3>
          <p class="field-explanation-intro">${intro}</p>
        </div>${steps.map(step).join("")}`;
}

// مصدر «من العميل مباشرة»: an administrative complaint from a customer with no account or invoice.
// Frames: a new contact, the saved contact, a ticket opened from the contact, the saved
// Administrative Complaint (In Progress), Share Ticket, and the copied ticket link.
function renderNoAccountComplaintFlow() {
  const term = sourceTerm;
  return renderSourceExampleFlow({
    images: "assest/review_selected_frames/03_شكوى_بلا_حساب",
    heading: "شكوى إدارية لعميل ليس له حساب",
    intro: "عندما يتواصل العميل مباشرة بشكوى وليس له حساب أو فاتورة في النظام، مثل شكوى عن استقبال غير جيد، يتم إنشاء كرت عميل له أولًا، ثم إنشاء التذكرة من كرت العميل.",
    steps: [
      {
        badge: "أ",
        id: "noAccountNewContactTitle",
        title: "إنشاء كرت عميل جديد",
        explanation: `من تطبيق ${term("جهات الاتصال", "Contacts")}، يتم الضغط على ${term("جديد", "New")} لفتح كرت عميل جديد.`,
        file: "00-35-12__frame_002112500.png",
        alt: "كرت جهة اتصال جديد فارغ في تطبيق Contacts",
        label: "كرت عميل جديد",
      },
      {
        badge: "ب",
        id: "noAccountContactSavedTitle",
        title: "إدخال بيانات العميل وحفظ الكرت",
        explanation: `يتم إدخال اسم العميل والبريد الإلكتروني ورقم الجوال والعنوان، ثم حفظ الكرت، فيظهر في سجل الكرت ${term("تم إنشاء جهة الاتصال", "Contact created")}.`,
        file: "00-35-41__frame_002141500.png",
        alt: "كرت العميل بعد إدخال الاسم والبريد ورقم الجوال والعنوان ويظهر في سجله Contact created",
        label: "كرت العميل بعد الحفظ",
      },
      {
        badge: "ج",
        id: "noAccountTicketFromContactTitle",
        title: "فتح تذكرة جديدة من كرت العميل",
        explanation: `من كرت العميل، يتم فتح تذاكره ثم الضغط على ${term("جديد", "New")}، كما يوضح مسار التنقل أعلى الصفحة: ${term("جهات الاتصال", "Contacts")} ← اسم العميل ← ${term("مكتب المساعدة", "Helpdesk")}. تظهر في التذكرة بيانات ${term("العميل", "Customer")} و${term("رقم الجوال", "Phone")} ضمن فريق ${term("خدمة العملاء", "Customer Care")}، بينما تبقى حقول ${term("حالة العملية", "Operation Case")} و${term("الفاتورة", "Invoice")} و${term("المهمة", "Task")} فارغة لعدم وجود فاتورة.`,
        file: "00-35-55__frame_002155000.png",
        alt: "تذكرة جديدة مفتوحة من كرت العميل وتظهر فيها بيانات العميل ورقم الجوال بينما حقول Operation Case و Invoice و Task فارغة",
        label: "تذكرة جديدة من كرت العميل",
      },
      {
        badge: "د",
        id: "noAccountAdministrativeTitle",
        title: `${term("شكوى إدارية", "Administrative Complaint")} وحفظ التذكرة`,
        explanation: `يتم إدخال عنوان الشكوى ووصفها، مثل «استقبال غير جيد»، واختيار ${term("شكوى إدارية", "Administrative Complaint")} في حقل ${term("نوع الاستفسار", "Inquiry Type")}، ثم الحفظ. بعد الحفظ تنتقل التذكرة تلقائيًا إلى مرحلة ${term("قيد التنفيذ", "In Progress")} وتُسند إلى الموظف الذي أنشأها، ويُضاف وسم «شكوى إدارية»، ويظهر زر ${term("مشاركة التذكرة", "Share Ticket")}.`,
        file: "00-36-17__frame_002177000.png",
        alt: "تذكرة استقبال غير جيد بنوع Administrative Complaint في مرحلة In Progress وعليها وسم شكوى إدارية ويظهر زر Share Ticket",
        label: "الشكوى الإدارية بعد الحفظ",
      },
      {
        badge: "هـ",
        id: "noAccountShareTitle",
        title: "مشاركة التذكرة مع الجهة المختصة",
        explanation: `من زر ${term("مشاركة التذكرة", "Share Ticket")} تظهر نافذة ${term("مشاركة المستند", "Share Document")}، وعند المشاركة مع ${term("مستخدمون داخليون", "Internal Users")} يتم اختيار الأشخاص من قائمة ${term("المستلمين", "Recipients")}.`,
        file: "00-36-37__frame_002197500.png",
        alt: "نافذة Share Document مع اختيار Internal Users وقائمة المستلمين",
        label: "مشاركة التذكرة",
      },
      {
        badge: "و",
        id: "noAccountCopyLinkTitle",
        title: "نسخ رابط التذكرة",
        explanation: `كما يمكن نسخ رابط التذكرة من حقل ${term("الرابط", "Link")} في النافذة نفسها وإرساله، مثل إرساله بالبريد الإلكتروني.`,
        file: "00-36-56__frame_002216083.png",
        alt: "نافذة Share Document بعد نسخ رابط التذكرة وظهور Copied",
        label: "نسخ رابط التذكرة",
      },
      {
        badge: "ز",
        id: "noAccountFollowUpTitle",
        title: "متابعة التذكرة",
        explanation: `بعد المشاركة، تتم متابعة التذكرة بالطريقة نفسها الموضحة في <a href="${routeHref("chapter", "customer-service-complaints")}/internal-follow-up">مرحلة المتابعة الداخلية</a> في صفحة الشكاوى / الاستفسارات.`,
      },
    ],
  });
}

// مصدر «من النظام»: the Appointment not booked ticket. Frames: the OdooBot message in the delivery
// task, the task's Appointments tab, and the ticket in Helpdesk. Booking on the customer's behalf
// links to the existing Delivery booking steps.
function renderAppointmentNotBookedFlow() {
  const term = sourceTerm;
  return renderSourceExampleFlow({
    images: "assest/review_selected_frames/02_Appointment_not_booked",
    heading: term("تذكرة عدم حجز الموعد", "Appointment not booked"),
    intro: `إذا لم يحجز العميل موعد التوصيل من خلال الرابط المرسل إليه، يقوم النظام تلقائيًا بإنشاء تذكرة في ${term("مكتب المساعدة", "Helpdesk")} لتتابع خدمة العملاء الحالة مع العميل.`,
    steps: [
      {
        badge: "أ",
        id: "appointmentNotBookedCreatedTitle",
        title: "إنشاء التذكرة تلقائيًا",
        explanation: `إذا لم يحجز العميل الموعد خلال 24 ساعة، يقوم النظام تلقائيًا بإنشاء ${term("تذكرة عدم حجز الموعد", "Appointment not booked")} مع رقم المهمة، وتظهر في سجل مهمة التوصيل رسالة من النظام توضح عدم حجز الموعد خلال 24 ساعة ورقم التذكرة التي تم إنشاؤها.`,
        file: "01-21-16__frame_004876500.png",
        alt: "سجل مهمة التوصيل وتظهر فيه رسالة النظام بعدم حجز العميل للموعد خلال 24 ساعة وإنشاء تذكرة Appointment not booked",
        label: "رسالة النظام في مهمة التوصيل",
      },
      {
        badge: "ب",
        id: "appointmentNotBookedEscalatedTitle",
        title: `حالة الرابط في تبويب ${term("المواعيد", "Appointments")}`,
        explanation: `في تبويب ${term("المواعيد", "Appointments")} داخل مهمة التوصيل، يظهر رابط الحجز بحالة ${term("مُصعَّد", "Escalated")} مع رقم التذكرة المرتبطة في عمود ${term("مكتب المساعدة", "Helpdesk")}، بينما يظهر الرابط الذي تم الحجز من خلاله بحالة ${term("محجوز", "Booked")}.`,
        file: "01-21-17__frame_004877500.png",
        alt: "تبويب Appointments في مهمة التوصيل ويظهر فيه رابط حجز بحالة Escalated مرتبط بتذكرة وآخر بحالة Booked",
        label: "تبويب المواعيد",
      },
      {
        badge: "ج",
        id: "appointmentNotBookedTicketTitle",
        title: "التذكرة في مكتب المساعدة",
        explanation: `تظهر التذكرة ضمن فريق ${term("خدمة العملاء", "Customer Care")} وعليها وسم ${sourceLtr("(Appointment)")}، وترتبط بالعميل والفاتورة والمهمة، ويتضمن ${term("الوصف", "Description")} تاريخ إرسال رابط الحجز عبر واتساب ورابط الحجز نفسه.`,
        file: "01-05-12__frame_003912500.png",
        alt: "تذكرة Appointment not booked في مكتب المساعدة ضمن فريق Customer Care وعليها وسم Appointment ويظهر في وصفها رابط الحجز",
        label: "تذكرة عدم حجز الموعد",
      },
      {
        badge: "د",
        id: "appointmentNotBookedBookingTitle",
        title: "التواصل مع العميل وحجز الموعد",
        explanation: `تتواصل خدمة العملاء مع العميل، ويمكنها فتح رابط الحجز واستكمال حجز موعد التوصيل نيابةً عنه، باتباع خطوات الحجز نفسها الموضحة في <a href="${routeHref("lesson", "customer-delivery")}/delivery-scheduling">مرحلة جدولة التوصيل</a>: اختيار الموعد، ثم بيانات العميل وموقع التسليم، ثم تأكيد الموعد.`,
      },
    ],
  });
}

// مصدر «من الإدارات الداخلية»: a technician converts a problem on a service task into a Customer
// Service ticket (Convert to Ticket). Frames: the button on an installation task, the dialog, the
// created ticket, and the ticket taken to Assigned to. Follow-up links to the Helpdesk page.
function renderConvertToTicketFlow() {
  const term = sourceTerm;
  return renderSourceExampleFlow({
    images: "assest/review_selected_frames/01_Convert_to_Ticket",
    heading: term("تذكرة محوّلة من الفني", "Convert to Ticket"),
    intro: `عندما تظهر مشكلة مع العميل أثناء تنفيذ مهمة الخدمة، مثل رفض العميل الاستلام، يمكن للفني تحويلها إلى تذكرة لدى خدمة العملاء من داخل المهمة باستخدام زر ${term("تحويل إلى تذكرة", "Convert to Ticket")}.`,
    steps: [
      {
        badge: "أ",
        id: "convertToTicketButtonTitle",
        title: `زر ${term("تحويل إلى تذكرة", "Convert to Ticket")} في المهمة`,
        explanation: `من مهمة الخدمة، يضغط الفني على زر ${term("تحويل إلى تذكرة", "Convert to Ticket")} أعلى المهمة. في المثال، مهمة في مشروع خدمة التركيب وهي في مرحلة جاري التركيب.`,
        file: "00-40-39__frame_002439000.png",
        alt: "مهمة تركيب في مرحلة جاري التركيب ويظهر أعلاها زر Convert to Ticket",
        label: "زر تحويل إلى تذكرة",
      },
      {
        badge: "ب",
        id: "convertToTicketDialogTitle",
        title: "نافذة التحويل",
        explanation: `تظهر نافذة ${term("تحويل إلى تذكرة", "Convert to Ticket")}، ويكون فيها ${term("الفريق", "Team")} ${term("خدمة العملاء", "Customer Care")} و${term("المرحلة", "Stage")} ${term("جديد", "New")}، ويكتب الفني تفاصيل المشكلة في ${term("الوصف", "Description")}، ثم يضغط ${term("تحويل", "Convert")}.`,
        file: "00-40-47__frame_002447000.png",
        alt: "نافذة Convert to Ticket ويظهر فيها الفريق Customer Care والمرحلة New وحقل الوصف وزر Convert",
        label: "نافذة التحويل",
      },
      {
        badge: "ج",
        id: "convertToTicketCreatedTitle",
        title: "إنشاء التذكرة لدى خدمة العملاء",
        explanation: `يتم إنشاء تذكرة في مرحلة ${term("جديد", "New")} وعليها وسم «محوله»، مرتبطة بالعميل والفاتورة والمهمة، ويظهر فيها وصف المشكلة الذي كتبه الفني، مثل «العميل رفض الاستلام». ويظهر في سجل التذكرة أنها أُنشئت من المهمة، مع رسالة استلام الطلب المرسلة إلى العميل ورقم التذكرة.`,
        file: "00-41-00__frame_002460500.png",
        alt: "تذكرة جديدة في مرحلة New عليها وسم محوله ووصف العميل رفض الاستلام ومرتبطة بالمهمة",
        label: "التذكرة المحوّلة",
      },
      {
        badge: "د",
        id: "convertToTicketAssignedTitle",
        title: "استلام خدمة العملاء للتذكرة",
        explanation: `تنقل خدمة العملاء بطاقة التذكرة في لوحة التذاكر من مرحلة ${term("جديد", "New")} إلى ${term("مُسند إلى", "Assigned to")}، فتُسند التذكرة تلقائيًا إلى الموظف الذي نقلها، ويظهر تغيير المرحلة والإسناد في سجل التذكرة.`,
        file: "00-41-41__frame_002501000.png",
        alt: "التذكرة في مرحلة Assigned to ومسندة إلى الموظف ويظهر في سجلها تغيير المرحلة من New إلى Assigned to",
        label: "التذكرة بعد الإسناد",
      },
      {
        badge: "هـ",
        id: "convertToTicketFollowUpTitle",
        title: "متابعة التذكرة",
        explanation: `بعد استلام التذكرة، تتم متابعتها بالطريقة نفسها الموضحة في <a href="${routeHref("chapter", "customer-service-complaints")}/internal-follow-up">مرحلة المتابعة الداخلية</a> في صفحة الشكاوى / الاستفسارات.`,
      },
    ],
  });
}

// أداة مساندة — الدخول إلى الخدمات: a guide page in the same style as الدخول إلى النظام
// (renderOdooEntryContent). Screenshots from assest/خدمة العملاء/الدخول الى الخدمات in order:
// 1 → 01, 2 → 02, 3 → 04, 3.5 → 05. Step 03 has no screenshot: none shows the project being opened.
function renderAccessServicesGuide() {
  const chapter = getChapter("customer-service-access-services");
  const images = "assest/خدمة العملاء/الدخول الى الخدمات";
  // Arabic meaning first, the original Odoo term in parentheses, kept on one line.
  const term = (ar, en) => `${ar}\u00A0<bdi dir="ltr">(${en.replace(/ /g, "\u00A0").replace(/-/g, "\u2011")})</bdi>`;
  const shot = (file, alt, label, frameClass = "guide-screenshot") => `
          <figure class="odoo-screenshot-frame ${frameClass}">
            <img src="${images}/${file}" alt="${alt}" tabindex="0" role="button" aria-label="اضغط لتكبير صورة ${label}" title="اضغط لتكبير الصورة" />
          </figure>`;
  const section = (number, id, title, body) => `
      <section class="guide-section" aria-labelledby="${id}">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">${number}</span>
          <h2 id="${id}">${title}</h2>
        </div>
        <div class="guide-section-body">${body}
        </div>
      </section>`;

  return `
    <header class="chapter-header">
      <p class="chapter-number">${chapter.number}</p>
      <h1>${chapter.title}</h1>
      <p>${chapter.description}</p>
    </header>

    <div class="odoo-entry-guide">
      ${section("01", "accessServicesProjectTitle", `فتح ${term("المشاريع", "Project")}`, `
          <p>من الصفحة الرئيسية لنظام خدمات مابعد البيع، يتم الضغط على تطبيق ${term("المشاريع", "Project")}.</p>
          <p class="guide-key-term">${term("المشاريع", "Project")}</p>
          ${shot("1.png", "الصفحة الرئيسية لنظام خدمات مابعد البيع مع تحديد تطبيق Project", "تطبيق المشاريع", "guide-screenshot guide-screenshot-portrait")}`)}

      ${section("02", "accessServicesProjectsTitle", "عرض مشاريع خدمات ما بعد البيع", `
          <p>بعد فتح تطبيق ${term("المشاريع", "Project")} تظهر صفحة ${term("المشاريع", "Projects")}، وتُعرض فيها مشاريع الخدمات على شكل بطاقات مجمّعة في أعمدة، ويظهر على كل بطاقة عدد ${term("المهام", "Tasks")} الخاصة بالمشروع.</p>
          <p>ومن الخدمات الظاهرة في الصفحة:</p>
          <ul>
            <li>عمود خدمات مابعد البيع: خدمة التركيب، خدمة رفع القياسات، خدمة تصميم، التحويلات الداخلية.</li>
            <li>عمود ${term("خدمات ما بعد البيع", "After-sales services")}: ${term("خدمة التوصيل", "Delivery service")}، خدمة التصنيع، الصيانة الميدانية، الاستلام من المستودع.</li>
          </ul>
          ${shot("2.png", "صفحة المشاريع في تطبيق Project وتظهر فيها مشاريع خدمات ما بعد البيع وعدد المهام لكل مشروع", "صفحة المشاريع")}`)}

      ${section("03", "accessServicesSelectTitle", "اختيار الخدمة المطلوبة", `
          <p>من صفحة ${term("المشاريع", "Projects")}، يختار الموظف مشروع الخدمة المطلوبة حسب الخدمة التي يتابعها مع العميل، فتُفتح لوحة مهام هذه الخدمة.</p>
          <aside class="guide-note">
            <strong>ملاحظة:</strong>
            يعرض المثال في الخطوة التالية لوحة مهام خدمة التركيب.
          </aside>`)}

      ${section("04", "accessServicesBoardTitle", "فتح لوحة مهام الخدمة", `
          <p>تظهر لوحة مهام الخدمة المختارة، وتُعرض فيها المهام موزعة على مراحل الخدمة. في مثال خدمة التركيب تظهر المراحل: طلب تركيب، جدولة خدمة التركيب، في انتظار تعيين الفني، ملئ النموذج، جاري التركيب، تم التركيب.</p>
          <p>يظهر على كل بطاقة مهمة رقم الفاتورة واسم العميل و${term("عدد الأيام في المرحلة", "days in stage")}، ويظهر في شريط البحث فلتر ${term("مفتوح", "Open")} مطبقًا على اللوحة.</p>
          ${shot("3.png", "لوحة مهام خدمة التركيب مع تحديد شريط البحث وفلتر Open", "لوحة مهام الخدمة")}`)}

      ${section("05", "accessServicesSearchTitle", "استخدام أدوات البحث والتصفية عند الحاجة", `
          <p>عند الحاجة إلى الوصول إلى مهمة معينة أو عرض المهام بطريقة مختلفة، يتم الضغط على السهم بجانب شريط البحث لفتح خيارات البحث، وتتضمن:</p>
          <ul>
            <li>${term("الفلاتر", "Filters")}: مثل ${term("مهامي", "My Tasks")}، ${term("غير مُسندة", "Unassigned")}، ${term("مفتوح", "Open")}، ${term("مغلق", "Closed")}.</li>
            <li>${term("التجميع حسب", "Group By")}: مثل ${term("المرحلة", "Stage")}، ${term("المُسند إليهم", "Assignees")}، ${term("المشروع", "Project")}، ${term("الأولوية", "Priority")}.</li>
            <li>${term("المفضلة", "Favorites")}: ${term("حفظ البحث الحالي", "Save current search")}.</li>
          </ul>
          ${shot("3.5.png", "قائمة خيارات البحث في لوحة مهام الخدمة وتظهر فيها أقسام Filters و Group By و Favorites", "خيارات البحث")}`)}
    </div>`;
}

// أداة مساندة — الدخول إلى فواتير العميل: a guide page in the same style as الدخول إلى الخدمات
// (renderAccessServicesGuide). Screenshots from assest/خدمة العملاء/الدخول الى فواتير العميل in
// order: 1 → 01, 2 → 02, 3 → 03, 4 → 04, 5 → 05, 6 → 06, 6.5 → 07, 7 → 08. The screenshots come
// from different customers and invoices, so each step is written as an example, not one transaction.
function renderAccessInvoicesGuide() {
  const chapter = getChapter("customer-service-access-invoices");
  const images = "assest/خدمة العملاء/الدخول الى فواتير العميل";
  // Arabic meaning first, the original Odoo term in parentheses. Short terms stay on one line;
  // long ones (e.g. SAP Collection Warehouse Code) may wrap between words on narrow screens.
  const term = (ar, en) => `${ar}\u00A0<bdi dir="ltr">(${(en.length > 22 ? en : en.replace(/ /g, "\u00A0")).replace(/-/g, "\u2011")})</bdi>`;
  const shot = (file, alt, label, frameClass = "guide-screenshot") => `
          <figure class="odoo-screenshot-frame ${frameClass}">
            <img src="${images}/${file}" alt="${alt}" tabindex="0" role="button" aria-label="اضغط لتكبير صورة ${label}" title="اضغط لتكبير الصورة" />
          </figure>`;
  const section = (number, id, title, body) => `
      <section class="guide-section" aria-labelledby="${id}">
        <div class="guide-section-heading">
          <span class="guide-section-number" aria-hidden="true">${number}</span>
          <h2 id="${id}">${title}</h2>
        </div>
        <div class="guide-section-body">${body}
        </div>
      </section>`;
  const note = (text) => `
          <aside class="guide-note">
            <strong>ملاحظة:</strong>
            ${text}
          </aside>`;

  return `
    <header class="chapter-header">
      <p class="chapter-number">${chapter.number}</p>
      <h1>${chapter.title}</h1>
      <p>${chapter.description}</p>
    </header>

    <div class="odoo-entry-guide">
      ${section("01", "accessInvoicesContactsTitle", `فتح ${term("جهات الاتصال", "Contacts")}`, `
          <p>من الصفحة الرئيسية لنظام خدمات مابعد البيع، يتم الضغط على تطبيق ${term("جهات الاتصال", "Contacts")}.</p>
          <p class="guide-key-term">${term("جهات الاتصال", "Contacts")}</p>
          ${note("الصور في هذا الدليل أمثلة مأخوذة من عملاء وفواتير مختلفة، والهدف منها توضيح أماكن التنقل والمعلومات المتاحة لموظف خدمة العملاء، وليست خطوات معاملة واحدة متصلة.")}
          ${shot("1.png", "الصفحة الرئيسية لنظام خدمات مابعد البيع مع تحديد تطبيق Contacts", "تطبيق جهات الاتصال")}`)}

      ${section("02", "accessInvoicesSearchTitle", "البحث عن العميل", `
          <p>تظهر قائمة ${term("جهات الاتصال", "Contacts")}، ويُعرض فيها لكل جهة اتصال ${term("الاسم", "Name")} و${term("البريد الإلكتروني", "Email")} و${term("الرقم المرجعي في SAP", "SAP Reference Number")} و${term("الهاتف", "Phone")}.</p>
          <p>للوصول إلى العميل المطلوب، يتم البحث عنه من خلال شريط البحث أعلى القائمة.</p>
          ${shot("2.png", "قائمة جهات الاتصال في تطبيق Contacts وتظهر فيها أعمدة الاسم والبريد الإلكتروني والرقم المرجعي في SAP والهاتف", "قائمة جهات الاتصال")}`)}

      ${section("03", "accessInvoicesIdentifyTitle", "تحديد العميل الصحيح", `
          <p>في المثال، تم البحث عن العميل باستخدام ${term("الاسم", "Name")}، فظهرت في النتائج عدة جهات اتصال بأسماء متقاربة.</p>
          <p>لتحديد العميل الصحيح، يتم الاستعانة بالمعلومات الظاهرة في النتائج:</p>
          <ul>
            <li>${term("الاسم", "Name")}.</li>
            <li>${term("الهاتف", "Phone")}.</li>
            <li>${term("الرقم المرجعي في SAP", "SAP Reference Number")}.</li>
          </ul>
          ${shot("3.png", "نتائج البحث عن العميل باستخدام الاسم مع تحديد عمود الهاتف والرقم المرجعي في SAP", "نتائج البحث عن العميل")}`)}

      ${section("04", "accessInvoicesRecordTitle", "فتح سجل العميل", `
          <p>عند فتح سجل العميل تظهر بياناته، وتظهر أعلى السجل أزرار مختصرة تساعد موظف خدمة العملاء على الوصول إلى معلومات العميل، منها:</p>
          <ul>
            <li>${term("المهام", "Tasks")}: مهام العميل.</li>
            <li>${term("التذاكر", "Tickets")}: تذاكر العميل.</li>
            <li>${term("المفوتر", "Invoiced")}: ويظهر عليه إجمالي المبلغ المفوتر للعميل.</li>
          </ul>
          <p>كما يعرض تبويب ${term("واتساب", "WhatsApp")} في سجل العميل ${term("سجل محادثات واتساب للعميل", "Customer WhatsApp Timeline")}، ويتضمن الرسائل المرسلة إلى العميل مع وقت كل رسالة واتجاهها وحالتها.</p>
          ${shot("4.png", "سجل العميل في تطبيق Contacts مع تحديد زر Invoiced وتبويب WhatsApp", "سجل العميل")}`)}

      ${section("05", "accessInvoicesListTitle", "فتح فواتير العميل", `
          <p>يتم فتح فواتير العميل من سجل العميل، فتظهر قائمة ${term("الفواتير", "Invoices")} الخاصة به، كما يوضح مسار التنقل أعلى الصفحة: ${term("جهات الاتصال", "Contacts")} ← اسم العميل ← ${term("الفواتير", "Invoices")}.</p>
          <p>للوصول إلى فاتورة معينة، يتم كتابة رقمها في شريط البحث ثم اختيار نوع البحث المناسب، ومنها:</p>
          <ul>
            <li>البحث في ${term("الرقم", "Number")}: رقم الفاتورة في نظام خدمات مابعد البيع.</li>
            <li>البحث في ${term("رقم فاتورة SAP", "SAP Invoice Number")}.</li>
          </ul>
          ${shot("5.png", "قائمة فواتير العميل مع خيارات البحث وتحديد خياري Number و SAP Invoice Number", "قائمة فواتير العميل")}`)}

      ${section("06", "accessInvoicesInvoiceTitle", "فتح الفاتورة ومراجعة بياناتها", `
          <p>عند فتح الفاتورة تظهر بياناتها، ومن المعلومات المهمة لموظف خدمة العملاء:</p>
          <ul>
            <li>${term("رقم فاتورة SAP", "SAP Invoice")}.</li>
            <li>${term("رقم عميل SAP", "SAP Customer No")}.</li>
            <li>${term("بنود الفاتورة", "Invoice Lines")}: المنتجات أو الخدمات الموجودة على الفاتورة مع الكمية والسعر والمبلغ.</li>
          </ul>
          <p>وتظهر أعلى الفاتورة أزرار مختصرة، منها ${term("المهام", "Tasks")} لعرض مهام الخدمات المرتبطة بالفاتورة، و${term("مكتب المساعدة", "Helpdesk")} لعرض التذاكر المرتبطة بها.</p>
          ${shot("6.png", "فاتورة العميل مع تحديد الأزرار المختصرة وزر Tasks ورقم فاتورة SAP ورقم عميل SAP وبنود الفاتورة", "بيانات الفاتورة")}`)}

      ${section("07", "accessInvoicesTasksTitle", "مراجعة مهام الخدمات المرتبطة بالفاتورة", `
          <p>قد ترتبط الفاتورة الواحدة بعدة مهام لخدمات ما بعد البيع. تعرض قائمة ${term("المهام", "Tasks")} الخاصة بالفاتورة هذه المهام مجمّعة حسب مرحلتها، ويمكن أن تشمل خدمات مختلفة، مثل:</p>
          <ul>
            <li>التركيب: مهام في مرحلة طلب تركيب.</li>
            <li>التوصيل: مهمة في مرحلة ${term("طلب توصيل", "Delivery Request")}.</li>
            <li>التصنيع: مهمة في مرحلة إرسال إلي ورشة التصنيع.</li>
            <li>الصيانة الميدانية: مهمة في مرحلة التقرير المبدئي.</li>
          </ul>
          <p>ومن الأعمدة المفيدة في القائمة: ${term("تاريخ الرحلة", "Trip Date")} و${term("المرحلة", "Stage")}، والتي توضح موعد الخدمة والمرحلة الحالية لكل مهمة.</p>
          ${note("تعرض هذه الصورة مهام فاتورة أخرى غير الفاتورة المعروضة في الخطوة السابقة.")}
          ${shot("6.5.png", "قائمة مهام الخدمات المرتبطة بفاتورة ومجمّعة حسب المرحلة مع تحديد عمودي Trip Date و Stage", "مهام الخدمات المرتبطة بالفاتورة")}`)}

      ${section("08", "accessInvoicesSapTitle", "مراجعة معلومات SAP والبائع", `
          <p>من تبويب ${term("المعلومات الأخرى", "Other Info")} في الفاتورة، يمكن مراجعة معلومات ${term("تكامل SAP", "SAP Integration")} ومعلومات ${term("البائع", "Seller")}، ومنها:</p>
          <ul>
            <li>${term("رقم فاتورة SAP", "SAP Invoice Number")}.</li>
            <li>${term("الرقم المرجعي في SAP", "SAP Reference Number")}.</li>
            <li>${term("نوع فاتورة SAP", "SAP Invoice Type")}.</li>
            <li>${term("اسم بائع SAP", "SAP Seller Name")}.</li>
            <li>${term("كود المعرض", "SAP Seller Hall Code")}.</li>
            <li>${term("كود مستودع التحصيل", "SAP Collection Warehouse Code")}.</li>
          </ul>
          ${shot("7.png", "تبويب Other Info في الفاتورة ويعرض معلومات SAP Integration ومعلومات البائع", "معلومات SAP والبائع")}`)}
    </div>`;
}

// `title` overrides the chapter title on the overview card only; `tool` renders the lighter card used
// for the employee tools.
function renderCustomerServiceEntryCard(chapterId, meta, { title, tool = false } = {}) {
  const chapter = getChapter(chapterId);
  return `
    <a class="entry-card${tool ? " entry-card--tool" : ""}" href="${routeHref("chapter", chapter.id)}">
      <span class="entry-card-index" aria-hidden="true">${chapter.number}</span>
      <strong class="entry-card-title">${title || chapter.title}</strong>
      <span class="entry-card-description">${chapter.description}</span>
      <span class="entry-card-meta">${meta}</span>
      <span class="entry-card-action">${tool ? "فتح الأداة" : "فتح القسم"} <span aria-hidden="true">←</span></span>
    </a>`;
}

const CUSTOMER_SERVICE_OVERVIEW_INTRO =
  "إدارة حالات العملاء من استقبال الطلب أو الشكوى، وإنشاء التذكرة ومتابعتها، مع الوصول إلى خدمات العميل وفواتيره ومسار الصيانة.";

function renderCustomerServiceOverview(service) {
  return `
    <header class="chapter-header service-header">
      <p class="chapter-number">نطاق الخدمة</p>
      <h1>${service.title}</h1>
      <p>${CUSTOMER_SERVICE_OVERVIEW_INTRO}</p>
    </header>
    <div class="customer-service-layout">
      <section class="chapter-index customer-service-main" aria-labelledby="customerServiceContentTitle">
        <div class="index-heading">
          <span>فهرس خدمة العملاء</span>
          <h2 id="customerServiceContentTitle">محتوى خدمة العملاء</h2>
        </div>
        <div class="chapter-grid">
          ${renderCustomerServiceEntryCard("customer-service-sources", "3 مصادر", { title: "مصادر الحالات" })}
          ${renderCustomerServiceEntryCard("customer-service-complaints", "5 مراحل", { title: "الشكاوى والاستفسارات" })}
        </div>
      </section>
      <aside class="chapter-index customer-service-maintenance-path" aria-labelledby="customerServiceMaintenanceTitle">
        <div class="index-heading">
          <span>مسار مستقل</span>
          <h2 id="customerServiceMaintenanceTitle">الصيانة</h2>
        </div>
        ${renderCustomerServiceEntryCard("customer-service-maintenance", "8 مراحل")}
      </aside>
    </div>
    <section class="chapter-index customer-service-tools" aria-labelledby="customerServiceToolsTitle">
      <div class="index-heading">
        <span>أدوات مساندة</span>
        <h2 id="customerServiceToolsTitle">أدوات موظف خدمة العملاء</h2>
      </div>
      <div class="chapter-grid">
        ${renderCustomerServiceEntryCard("customer-service-access-services", "5 خطوات", { tool: true })}
        ${renderCustomerServiceEntryCard("customer-service-access-invoices", "8 خطوات", { tool: true })}
      </div>
    </section>`;
}

// Overview (نظرة عامة) of خدمة التركيب: an index of its three chapters. The workflow itself is
// under الباب الأول → تركيب كامل.
const INSTALLATION_CHAPTER_SUMMARIES = {
  "installation-services": "يضم هذا الباب أنواع خدمة التركيب المختلفة.",
  "installation-relationships": "يغطي هذا الباب دورات خدمة التركيب التي تعتمد على خدمات أخرى أو تتكامل معها.",
  "installation-returns-cancellations": "يغطي هذا الباب حالات الإلغاء والمرتجعات المرتبطة بخدمة التركيب.",
};

function renderInstallationOverview(service) {
  const chapters = service.chapterIds.map(getChapter).filter((chapter) => chapter?.visible !== false);
  return `
    <header class="chapter-header service-header">
      <p class="chapter-number">نطاق الخدمة</p>
      <h1>${service.title}</h1>
      <p>${service.description}</p>
    </header>
    ${chapters
      .map(
        (chapter) => `
      <section class="chapter-index" aria-labelledby="installationChapter-${chapter.id}">
        <div class="index-heading">
          <span>${chapter.number}</span>
          <h2 id="installationChapter-${chapter.id}">${chapter.title}</h2>
          <p>${INSTALLATION_CHAPTER_SUMMARIES[chapter.id] || chapter.description}</p>
        </div>
        <div class="chapter-grid">
          ${chapter.items
            .filter((item) => item.visible !== false)
            .map((item, index) => renderLessonCard(chapter, item, index))
            .join("")}
        </div>
      </section>`,
      )
      .join("")}`;
}

function renderRelationshipFlowDiagram() {
  return `
    <div class="workflow-flow relationship-flow" aria-label="علاقة التحويلات الداخلية بخدمة التوصيل">
      <div class="workflow-flow-node" aria-disabled="true">
        <span class="workflow-flow-index">00</span>
        <span>فاتورة من SAP</span>
      </div>
      <span class="workflow-flow-arrow" aria-hidden="true">←</span>
      <button class="workflow-flow-node workflow-flow-node--openable" type="button" data-workflow-overlay="internal-transfer">
        <span class="workflow-flow-index">01</span>
        <span>تنفيذ التحويلات الداخلية</span>
        <span class="workflow-flow-node-hint" aria-hidden="true">عرض دورة العمل ↗</span>
      </button>
      <span class="workflow-flow-arrow" aria-hidden="true">←</span>
      <button class="workflow-flow-node workflow-flow-node--openable" type="button" data-workflow-overlay="customer-delivery">
        <span class="workflow-flow-index">02</span>
        <span>تنفيذ خدمة التوصيل للعميل</span>
        <span class="workflow-flow-node-hint" aria-hidden="true">عرض دورة العمل ↗</span>
      </button>
    </div>`;
}

function renderInternalTransferDeliveryLinkContent() {
  return `
    <div class="workflow-content internal-transfer-workflow">
      ${renderRelationshipFlowDiagram()}
      ${renderOverviewVideo("internalTransferDeliveryLinkVideoTitle", "فيديو شرح علاقة التحويلات الداخلية بخدمة التوصيل", "شاهد كيف تبقى خدمة التوصيل محظورة بسبب الاعتماد حتى تكتمل التحويلات الداخلية، ثم تصبح جاهزة للمتابعة.", "videos/internal-transfer-delivery.mp4")}

      <p class="field-explanation-intro internal-transfer-delivery-link-summary">تعتمد خدمة التوصيل للعميل على توفر البضاعة في مستودع التجمع. فإذا كانت البضاعة أو جزء منها موجودة في مستودع مختلف عن مستودع التجمع، فلا يمكن البدء بخدمة التوصيل مباشرة، ويجب أولًا تنفيذ التحويلات الداخلية لنقل البضاعة إلى مستودع التجمع.</p>

      <div class="dependency-status-definitions" aria-label="تعريف حالات اعتماد خدمة التوصيل">
        <article class="dependency-status-definition dependency-status-definition--blocked">
          <h2>الحالة الحمراء — محظور بسبب الاعتماد</h2>
          <bdi class="dependency-status-technical-label" dir="ltr">(Blocked by Dependency)</bdi>
          <p>تعني أن خدمة التوصيل موجودة، ولكن لا يمكن البدء بها لأن التحويلات الداخلية لم تكتمل بعد.</p>
        </article>
        <article class="dependency-status-definition dependency-status-definition--ready">
          <h2>الحالة الخضراء — جاهز بعد اكتمال الاعتماد</h2>
          <bdi class="dependency-status-technical-label" dir="ltr">(Dependency Ready)</bdi>
          <p>تعني أن التحويلات الداخلية اكتملت، وأصبحت خدمة التوصيل جاهزة للمتابعة.</p>
        </article>
      </div>

      <section class="panel invoice-training-section" aria-labelledby="internalTransferDeliveryLinkStep1Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">00</span>
          <div><h2 id="internalTransferDeliveryLinkStep1Title">فاتورة من SAP</h2></div>
        </div>
        <p class="field-explanation-intro">تبدأ العلاقة بوصول فاتورة من SAP تحتوي على خدمة توصيل والتحويلات الداخلية، ويظهر لكل خدمة طلبها داخل نظام خدمات مابعد البيع. وإذا كانت البضاعة أو جزء منها موجودة في مستودع مختلف عن مستودع التجمع، فلا يمكن البدء بخدمة التوصيل مباشرة، ويجب أولًا تنفيذ التحويلات الداخلية لنقل البضاعة إلى مستودع التجمع.</p>
        <div class="internal-transfer-delivery-link-image-pair">
          <figure class="odoo-screenshot-frame">
            <img src="assest/علاقة خدمة النقل الداخلي بخدمة التوصيل للعميل/1.png" alt="مهام الفاتورة في نظام خدمات مابعد البيع تعرض التحويلات الداخلية وخدمة التوصيل معًا على نفس الفاتورة" tabindex="0" role="button" aria-label="اضغط لتكبير صورة مهمتي التحويلات الداخلية والتوصيل على نفس الفاتورة" title="اضغط لتكبير الصورة" />
          </figure>
          <figure class="odoo-screenshot-frame">
            <img src="assest/علاقة خدمة النقل الداخلي بخدمة التوصيل للعميل/1.5.png" alt="لوحة مهام خدمة التوصيل في نظام خدمات مابعد البيع تعرض الحالة الحمراء محظور بسبب الاعتماد (Blocked by Dependency) والحالة الخضراء جاهز بعد اكتمال الاعتماد (Dependency Ready)" tabindex="0" role="button" aria-label="اضغط لتكبير صورة لوحة مهام التوصيل بالحالتين الحمراء والخضراء للاعتماد" title="اضغط لتكبير الصورة" />
          </figure>
        </div>
        <p class="internal-transfer-delivery-link-pair-note">توضح الصورتان أن التحويلات الداخلية وخدمة التوصيل قد تظهران ضمن نفس الفاتورة، وأن حالة خدمة التوصيل تختلف بحسب اكتمال التحويلات الداخلية. قد تظهر خدمة التوصيل بالحالة الحمراء (محظور بسبب الاعتماد)، ثم تتحول إلى الحالة الخضراء (جاهز بعد اكتمال الاعتماد) بعد اكتمال التحويلات الداخلية.</p>
      </section>

      <section class="panel invoice-training-section" aria-labelledby="internalTransferDeliveryLinkStep2Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">01</span>
          <div>
            <h2 id="internalTransferDeliveryLinkStep2Title">الحالة الحمراء — محظور بسبب الاعتماد</h2>
            <bdi class="internal-transfer-status-system-label" dir="ltr">(Blocked by Dependency)</bdi>
          </div>
        </div>
        <p class="field-explanation-intro">طالما أن التحويلات الداخلية لم تكتمل بعد، تبقى خدمة التوصيل غير جاهزة للتنفيذ وتظهر بالحالة الحمراء (محظور بسبب الاعتماد). وهذا يعني أن خدمة التوصيل موجودة، لكنها لا تستطيع المتابعة لأن البضاعة لم تصل بعد إلى الموقع المطلوب.</p>
        <aside class="internal-transfer-dependency-note"><strong>ملاحظة:</strong> عند ظهور خدمة التوصيل بالحالة الحمراء، يمكن معرفة الخدمة المرتبطة بها من خلال الـ Tag الظاهر أسفل اسم العميل. إذا ظهر اسم مدينة، فهذا يعني أن خدمة التوصيل مرتبطة بالتحويلات الداخلية. وإذا ظهر تصنيع ورش، فهذا يعني أنها مرتبطة بخدمة التصنيع. أما إذا ظهر صحية أو تركيب، فهذا يعني أنها مرتبطة بخدمة التركيب.</aside>
        <figure class="odoo-screenshot-frame internal-transfer-delivery-link-screenshot">
          <img src="assest/علاقة خدمة النقل الداخلي بخدمة التوصيل للعميل/4.png" alt="بطاقة خدمة التوصيل في نظام خدمات مابعد البيع تظهر بالحالة الحمراء محظور بسبب الاعتماد (Blocked by Dependency)" tabindex="0" role="button" aria-label="اضغط لتكبير صورة الحالة الحمراء محظور بسبب الاعتماد" title="اضغط لتكبير الصورة" />
        </figure>
      </section>

      <section class="panel invoice-training-section" aria-labelledby="internalTransferDeliveryLinkStep3Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">02</span>
          <div>
            <h2 id="internalTransferDeliveryLinkStep3Title">الحالة الخضراء — جاهز بعد اكتمال الاعتماد</h2>
            <bdi class="internal-transfer-status-system-label" dir="ltr">(Dependency Ready)</bdi>
          </div>
        </div>
        <p class="field-explanation-intro">بعد اكتمال التحويلات الداخلية ووصول البضاعة إلى مكان التجميع أو الموقع المطلوب، يتم فك الاعتماد وتتحول خدمة التوصيل إلى الحالة الخضراء (جاهز بعد اكتمال الاعتماد)، وبذلك تصبح جاهزة لمتابعة دورة التوصيل للعميل.</p>
        <figure class="odoo-screenshot-frame internal-transfer-delivery-link-screenshot">
          <img src="assest/علاقة خدمة النقل الداخلي بخدمة التوصيل للعميل/3.png" alt="بطاقة خدمة التوصيل في نظام خدمات مابعد البيع تظهر بالحالة الخضراء جاهز بعد اكتمال الاعتماد (Dependency Ready)" tabindex="0" role="button" aria-label="اضغط لتكبير صورة الحالة الخضراء جاهز بعد اكتمال الاعتماد" title="اضغط لتكبير الصورة" />
        </figure>
      </section>

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        إذا كانت البضاعة غير موجودة في موقع التوصيل المطلوب، يتم تنفيذ التحويلات الداخلية أولًا. تبقى خدمة التوصيل في الحالة الحمراء (محظور بسبب الاعتماد) حتى اكتمال التحويلات الداخلية، وبعدها تتحول إلى الحالة الخضراء (جاهز بعد اكتمال الاعتماد) ويمكن متابعة تنفيذ التوصيل للعميل.
      </aside>
    </div>`;
}

function renderInstallationDeliveryScreenshot(src, alt, label) {
  return `
          <figure class="odoo-screenshot-frame">
            <img src="${src}" alt="${alt}" tabindex="0" role="button" aria-label="اضغط لتكبير صورة ${label}" title="اضغط لتكبير الصورة" />
          </figure>`;
}

// خدمة التركيب → الباب الثاني → تركيب مع توصيل: the relationship between the two services, not a copy
// of either workflow (the full workflows open from stage 02 and stage 04).
function renderInstallationDeliveryLinkContent() {
  const [invoice, scheduling, delivery, installation, completed] = installationWithDeliveryTour.children;
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content installation-with-delivery-workflow">
      <header class="case-header" aria-labelledby="installationWithDeliveryTitle">
        <div>
          <h1 id="installationWithDeliveryTitle">${installationWithDeliveryTour.title}</h1>
          ${renderWorkflowFlow(installationWithDeliveryTour, { numberStart: 0 })}
        </div>
      </header>

      <p class="field-explanation-intro internal-transfer-delivery-link-summary">عندما تحتوي الفاتورة على خدمة التوصيل وخدمة التركيب، يحجز العميل موعد التركيب، ويُحدَّد موعد التوصيل بناءً عليه، فتُنفَّذ خدمة التوصيل أولًا، ثم تُستكمل خدمة التركيب بعد اكتمال التوصيل ووصول البضاعة إلى العميل.</p>

      ${section(invoice, "00", `
        <p class="field-explanation-intro">تبدأ الدورة بوصول فاتورة من SAP تحتوي على خدمة التوصيل وخدمة التركيب إلى نظام خدمات مابعد البيع، وتظهر الفاتورة ضمن دورة عمل خدمة التركيب في مرحلة طلب تركيب.</p>
        ${renderInstallationDeliveryScreenshot("assest/installation/1.png", "شاشة نظام خدمات مابعد البيع تعرض خدمة التوصيل والتركيب في مرحلة طلب تركيب", "الفاتورة في مرحلة طلب تركيب")}`)}

      ${section(scheduling, "01", `
        <p class="field-explanation-intro">يحدد المشرف موعد التركيب والفترة المسموح للعميل بالحجز ضمنها، ثم يرسل النظام تلقائيًا رابط حجز موعد التركيب إلى العميل، فيختار العميل موعد التركيب ضمن الفترة المسموحة ويؤكد الحجز.</p>
        <p class="field-explanation-intro">بعد حجز موعد التركيب، يتم تحديد موعد التوصيل قبل موعد التركيب بـ 24 أو 48 ساعة حسب الإعداد المعتمد، بحيث تصل البضاعة إلى العميل قبل تنفيذ أعمال التركيب.</p>
        <div class="internal-transfer-delivery-link-image-pair">
          ${renderInstallationDeliveryScreenshot("assest/installation/3.png", "سؤال في نظام خدمات مابعد البيع لمعرفة موعد التوصيل قبل التركيب بكم ساعة", "سؤال موعد التوصيل قبل التركيب")}
          ${renderInstallationDeliveryScreenshot("assest/installation/5.png", "شاشة اختيار التاريخ والوقت لموعد التركيب", "اختيار موعد التركيب")}
        </div>`)}

      ${section(delivery, "02", `
        <p class="field-explanation-intro">بعد تحديد موعد التوصيل، لا تبدأ مهمة التوصيل من بداية دورة عمل خدمة التوصيل، وإنما تنتقل مباشرة إلى مرحلة "ربط الخدمة بالسائق"، ثم تستكمل مراحل خدمة التوصيل: <strong>ربط الخدمة بالسائق ← ملئ النموذج (سند التحميل) ← جاري التوصيل ← استلام الخدمة</strong>.</p>
        <p class="field-explanation-intro">بعد تأكيد استلام العميل للخدمة تكتمل خدمة التوصيل.</p>
        <aside class="internal-transfer-example"><strong>التنفيذ:</strong> إدارة المستودعات</aside>
        ${renderInstallationDeliveryScreenshot("assest/installation/9.png", "مهمة التوصيل في مرحلة ربط الخدمة بالسائق ضمن دورة التوصيل مع التركيب", "مهمة التوصيل في مرحلة ربط الخدمة بالسائق")}
        <p><a class="secondary-link" href="${routeHref("lesson", "customer-delivery")}" data-workflow-overlay="customer-delivery">عرض دورة التوصيل <span aria-hidden="true">↗</span></a></p>`)}

      ${section(installation, "03", `
        <p class="field-explanation-intro">بعد اكتمال خدمة التوصيل ووصول البضاعة إلى العميل، يصل الفني إلى موقع العميل وتظهر مهمة التركيب في مرحلة ملئ النموذج، حيث يفتح الفني نموذج التركيب، ثم يضغط على زر بدء التركيب (Start Installation)، وينفذ أعمال التركيب ويعبئ البيانات المطلوبة، ثم يضغط على زر إنهاء التركيب (Finish Installation)، ويتم توثيق استلام العميل للخدمة من خلال توقيعه على النموذج.</p>
        <div class="internal-transfer-delivery-link-image-pair">
          ${renderInstallationDeliveryScreenshot("assest/installation/11.png", "زر بدء التركيب (Start Installation) لبدء تنفيذ خدمة التركيب في موقع العميل", "بدء تنفيذ التركيب")}
          ${renderInstallationDeliveryScreenshot("assest/installation/12.png", "إنهاء خدمة التركيب وتوثيق استلام العميل من خلال توقيعه على النموذج", "إنهاء التركيب واستلام العميل")}
        </div>`)}

      ${section(completed, "04", `
        <p class="field-explanation-intro">بعد إنهاء أعمال التركيب وتوثيق استلام العميل للخدمة، تنتقل مهمة التركيب إلى مرحلة تم التركيب، وبذلك تكتمل دورة التوصيل مع التركيب.</p>
        ${renderInstallationDeliveryScreenshot("assest/installation/14.png", "اكتمال دورة خدمة التركيب وانتقال المهمة إلى مرحلة تم التركيب", "مرحلة تم التركيب")}
        <p><a class="secondary-link" href="${routeHref("lesson", "installation-full")}">عرض تركيب كامل <span aria-hidden="true">←</span></a></p>`)}

      <aside class="internal-transfer-dependency-note"><strong>الاعتماد بين الخدمتين:</strong> موعد التوصيل يُحدَّد بناءً على موعد التركيب، وتُنفَّذ خدمة التوصيل قبل تنفيذ التركيب، واكتمال التوصيل ووصول البضاعة إلى العميل هو ما يسمح باستكمال أعمال التركيب في موقع العميل.</aside>

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        موعد التوصيل يُحدَّد من موعد التركيب قبله بـ 24 أو 48 ساعة حسب الإعداد المعتمد، وتُنفَّذ خدمة التوصيل قبل التركيب بدءًا من مرحلة ربط الخدمة بالسائق، وبعد اكتمال التوصيل ووصول البضاعة إلى العميل يستكمل الفني خدمة التركيب حتى مرحلة تم التركيب.
      </aside>
    </div>`;
}

// خدمة التركيب → الباب الثاني → تركيب مع التحويلات الداخلية: the chain
// التحويلات الداخلية → (يحظر) التوصيل → مستودع التجمع → التوصيل جاهز → اكتمال التوصيل → استكمال التركيب.
// The Blocked / Ready statuses belong to the Delivery task here, never to the Installation task.
function renderInstallationInternalTransferLinkContent() {
  const [invoice, transfer, delivery, installation, completed] = installationWithInternalTransferTour.children;
  const linkImages = "assest/علاقة خدمة النقل الداخلي بخدمة التوصيل للعميل";
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content installation-with-internal-transfer-workflow">
      <header class="case-header" aria-labelledby="installationWithInternalTransferTitle">
        <div>
          <h1 id="installationWithInternalTransferTitle">${installationWithInternalTransferTour.title}</h1>
          ${renderWorkflowFlow(installationWithInternalTransferTour, { numberStart: 0 })}
        </div>
      </header>

      <p class="field-explanation-intro internal-transfer-delivery-link-summary">عندما تحتوي فاتورة SAP على خدمة التركيب وخدمة التوصيل وتحويل داخلي، فهذا يعني أن البضاعة غير متوفرة بالكامل بعد في مستودع التجمع. لذلك تُنفَّذ التحويلات الداخلية أولًا، وتبقى خدمة التوصيل محظورة بسبب الاعتماد حتى تصل البضاعة كاملة إلى مستودع التجمع، ثم تُنفَّذ خدمة التوصيل للعميل، وبعد اكتمالها ووصول البضاعة إلى العميل تُستكمل خدمة التركيب.</p>

      ${section(invoice, "00", `
        <p class="field-explanation-intro">تبدأ الدورة بوصول فاتورة من SAP تحتوي على خدمة التركيب وخدمة التوصيل وتحويل داخلي إلى نظام خدمات مابعد البيع.</p>
        <p class="field-explanation-intro">وجود التحويل الداخلي يعني أن البضاعة، أو جزءًا منها، غير متوفرة بعد في مستودع التجمع، لذلك لا يمكن متابعة خدمة التوصيل بشكل طبيعي لأنها تعتمد على اكتمال التحويلات الداخلية.</p>
        ${renderInstallationDeliveryScreenshot(`${linkImages}/1.png`, "مهام الفاتورة في نظام خدمات مابعد البيع تعرض التحويلات الداخلية وخدمة التوصيل معًا على نفس الفاتورة", "مهمتي التحويلات الداخلية والتوصيل على نفس الفاتورة")}`)}

      ${section(transfer, "01", `
        <p class="field-explanation-intro">يتم نقل البضاعة من المستودع المصدر إلى مستودع التجمع من خلال دورة عمل التحويلات الداخلية الحالية، حتى تصل البضاعة إلى مستودع التجمع ويتم تأكيد استلامها، فتنتقل مهمة التحويلات الداخلية إلى مرحلة تم الاستلام.</p>
        <p class="field-explanation-intro">خلال هذه المرحلة تظهر خدمة التوصيل بالحالة الحمراء: محظور بسبب الاعتماد <bdi dir="ltr">(Blocked by Dependency)</bdi>.</p>
        <p class="field-explanation-intro">خدمة التوصيل موجودة، ولكن لا يمكن البدء بها لأن التحويلات الداخلية لم تكتمل بعد.</p>
        ${renderInstallationDeliveryScreenshot(`${linkImages}/4.png`, "بطاقة خدمة التوصيل في نظام خدمات مابعد البيع تظهر بالحالة الحمراء محظور بسبب الاعتماد (Blocked by Dependency)", "الحالة الحمراء محظور بسبب الاعتماد")}
        <p><a class="secondary-link" href="${routeHref("lesson", "internal-transfer")}" data-workflow-overlay="internal-transfer">عرض دورة التحويلات الداخلية <span aria-hidden="true">↗</span></a></p>`)}

      ${section(delivery, "02", `
        <p class="field-explanation-intro">بعد اكتمال التحويلات الداخلية ووصول البضاعة إلى مستودع التجمع، تصبح خدمة التوصيل جاهزة للمتابعة، ويُفك الاعتماد وتتحول إلى الحالة الخضراء: جاهز بعد اكتمال الاعتماد <bdi dir="ltr">(Dependency Ready)</bdi>.</p>
        <p class="field-explanation-intro">في دورة التوصيل مع التركيب، يُحدَّد موعد التوصيل بناءً على موعد التركيب قبله بـ 24 أو 48 ساعة حسب الإعداد المعتمد، ولا تبدأ مهمة التوصيل من بداية دورة عمل خدمة التوصيل، وإنما تنتقل مباشرة إلى مرحلة "ربط الخدمة بالسائق"، ثم تستكمل مراحل خدمة التوصيل: <strong>ربط الخدمة بالسائق ← ملئ النموذج (سند التحميل) ← جاري التوصيل ← استلام الخدمة</strong>.</p>
        <p class="field-explanation-intro">بعد تأكيد استلام العميل للخدمة تكتمل خدمة التوصيل.</p>
        <aside class="internal-transfer-example"><strong>التنفيذ:</strong> إدارة المستودعات</aside>
        ${renderInstallationDeliveryScreenshot(`${linkImages}/3.png`, "بطاقة خدمة التوصيل في نظام خدمات مابعد البيع تظهر بالحالة الخضراء جاهز بعد اكتمال الاعتماد (Dependency Ready)", "الحالة الخضراء جاهز بعد اكتمال الاعتماد")}
        <p><a class="secondary-link" href="${routeHref("lesson", "customer-delivery")}" data-workflow-overlay="customer-delivery">عرض دورة التوصيل <span aria-hidden="true">↗</span></a></p>`)}

      ${section(installation, "03", `
        <p class="field-explanation-intro">لا يُستكمل التركيب بمجرد اكتمال التحويلات الداخلية، وإنما يجب تحقق الشرط الكامل التالي:</p>
        <ol class="guide-steps">
          <li>اكتمال التحويلات الداخلية.</li>
          <li>تصبح خدمة التوصيل جاهزة.</li>
          <li>اكتمال خدمة التوصيل.</li>
          <li>وصول البضاعة إلى العميل.</li>
          <li>استكمال تنفيذ خدمة التركيب.</li>
        </ol>
        <p class="field-explanation-intro">بعد وصول البضاعة إلى العميل، يصل الفني إلى موقع العميل وتظهر مهمة التركيب في مرحلة ملئ النموذج، حيث يفتح الفني نموذج التركيب، ثم يضغط على زر بدء التركيب (Start Installation)، وينفذ أعمال التركيب ويعبئ البيانات المطلوبة، ثم يضغط على زر إنهاء التركيب (Finish Installation)، ويتم توثيق استلام العميل للخدمة من خلال توقيعه على النموذج.</p>
        <div class="internal-transfer-delivery-link-image-pair">
          ${renderInstallationDeliveryScreenshot("assest/installation/11.png", "زر بدء التركيب (Start Installation) لبدء تنفيذ خدمة التركيب في موقع العميل", "بدء تنفيذ التركيب")}
          ${renderInstallationDeliveryScreenshot("assest/installation/12.png", "إنهاء خدمة التركيب وتوثيق استلام العميل من خلال توقيعه على النموذج", "إنهاء التركيب واستلام العميل")}
        </div>`)}

      ${section(completed, "04", `
        <p class="field-explanation-intro">بعد إنهاء أعمال التركيب وتوثيق استلام العميل للخدمة، تنتقل مهمة التركيب إلى مرحلة تم التركيب، وبذلك تكتمل دورة التحويلات الداخلية والتوصيل والتركيب.</p>
        ${renderInstallationDeliveryScreenshot("assest/installation/14.png", "اكتمال دورة خدمة التركيب وانتقال المهمة إلى مرحلة تم التركيب", "مرحلة تم التركيب")}
        <p><a class="secondary-link" href="${routeHref("lesson", "installation-full")}">عرض تركيب كامل <span aria-hidden="true">←</span></a></p>`)}

      <div class="dependency-status-definitions" aria-label="حالات اعتماد خدمة التوصيل على التحويلات الداخلية">
        <article class="dependency-status-definition dependency-status-definition--blocked">
          <h2>الحالة الحمراء — محظور بسبب الاعتماد</h2>
          <bdi class="dependency-status-technical-label" dir="ltr">(Blocked by Dependency)</bdi>
          <p>تعني أن خدمة التوصيل موجودة، ولكن لا يمكن متابعتها لأن التحويلات الداخلية لم تكتمل بعد.</p>
        </article>
        <article class="dependency-status-definition dependency-status-definition--ready">
          <h2>الحالة الخضراء — جاهز بعد اكتمال الاعتماد</h2>
          <bdi class="dependency-status-technical-label" dir="ltr">(Dependency Ready)</bdi>
          <p>تعني أن التحويلات الداخلية اكتملت وأن البضاعة متوفرة في مستودع التجمع، وأصبح بالإمكان متابعة خدمة التوصيل.</p>
        </article>
      </div>

      <aside class="internal-transfer-dependency-note"><strong>ملاحظة:</strong> تنطبق الحالتان الحمراء والخضراء في هذه العلاقة على خدمة التوصيل، وليس على مهمة التركيب. وعند ظهور خدمة التوصيل بالحالة الحمراء، إذا ظهر اسم مدينة في الـ Tag أسفل اسم العميل، فهذا يعني أن خدمة التوصيل مرتبطة بالتحويلات الداخلية.</aside>

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        تحظر التحويلات الداخلية خدمة التوصيل حتى تصل البضاعة كاملة إلى مستودع التجمع، ثم تصبح خدمة التوصيل جاهزة وتُنفَّذ للعميل بدءًا من مرحلة ربط الخدمة بالسائق، وبعد اكتمال التوصيل ووصول البضاعة إلى العميل يستكمل الفني خدمة التركيب حتى مرحلة تم التركيب.
      </aside>
    </div>`;
}

// خدمة التركيب → الباب الثاني → تركيب مع تصنيع. The confirmed rule is only that Installation
// execution waits for Manufacturing completion ("تم الانتهاء من الخدمة"); no Manufacturing → Delivery
// Blocked / Ready rule is documented, so none is shown.
function renderInstallationManufacturingLinkContent() {
  const [invoice, manufacturing, delivery, installation, completed] = installationWithManufacturingTour.children;
  const manufacturingExecution = [
    ["00", "فاتورة من SAP", "آلي من خلال النظام"],
    ["01", "طلب خدمة تصنيع", "آلي من خلال النظام"],
    ["02", "إرسال إلى ورشة التصنيع", "يدوي / إدارة التصنيع"],
    ["03", "جاري التصنيع", "يدوي / إدارة التصنيع"],
    ["04", "تم الانتهاء من الخدمة", "يدوي / إدارة التصنيع"],
  ];
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content installation-with-manufacturing-workflow">
      <header class="case-header" aria-labelledby="installationWithManufacturingTitle">
        <div>
          <h1 id="installationWithManufacturingTitle">${installationWithManufacturingTour.title}</h1>
          ${renderWorkflowFlow(installationWithManufacturingTour, { numberStart: 0 })}
        </div>
      </header>

      <p class="field-explanation-intro internal-transfer-delivery-link-summary">لا يمكن البدء بتنفيذ خدمة التركيب قبل اكتمال خدمة التصنيع. وبعد اكتمال التصنيع، تستمر دورة التركيب وفق مسارها المعتمد، بما في ذلك تنفيذ خدمة التوصيل ووصول البضاعة إلى العميل قبل بدء أعمال التركيب.</p>

      ${section(invoice, "00", `
        <p class="field-explanation-intro">تبدأ العلاقة بوصول فاتورة من SAP تحتوي على خدمة التصنيع وخدمة التركيب. في هذه الحالة يجب استكمال دورة التصنيع أولًا قبل البدء بتنفيذ أعمال التركيب في موقع العميل.</p>
        <p class="field-explanation-intro">وبما أن التركيب الكامل في هذا المشروع يتضمن التوصيل، تُنفَّذ خدمة التوصيل ضمن مسار التركيب الكامل.</p>`)}

      ${section(manufacturing, "01", `
        <p class="field-explanation-intro">تمر خدمة التصنيع بمراحلها المعتمدة حتى تصل مهمة التصنيع إلى مرحلة "04 — تم الانتهاء من الخدمة"، وعندها تكتمل دورة خدمة التصنيع.</p>
        <p class="field-explanation-intro">مسار خدمة التصنيع: <strong>00 فاتورة من SAP ← 01 طلب خدمة تصنيع ← 02 إرسال إلى ورشة التصنيع ← 03 جاري التصنيع ← 04 تم الانتهاء من الخدمة</strong>.</p>
        <p class="field-explanation-intro">التنفيذ في مراحل خدمة التصنيع:</p>
        <ul class="guide-steps">
          ${manufacturingExecution.map(([number, title, execution]) => `<li>${number} — ${title}: ${execution}</li>`).join("\n          ")}
        </ul>
        ${renderInstallationDeliveryScreenshot("assest/التصنيع/1.png", "لوحة عمليات خدمة التصنيع في نظام خدمات مابعد البيع وتعرض مراحل طلب خدمة تصنيع وإرسال إلى ورشة التصنيع وجاري التصنيع وتم الانتهاء من الخدمة", "لوحة خدمة التصنيع")}
        <p><a class="secondary-link" href="${routeHref("service", "manufacturing")}" data-workflow-overlay="manufacturing">عرض دورة التصنيع <span aria-hidden="true">↗</span></a></p>`)}

      ${section(delivery, "02", `
        <p class="field-explanation-intro">بعد اكتمال التصنيع، تستمر دورة التركيب وفق مسارها المعتمد، بما في ذلك تنفيذ خدمة التوصيل للعميل.</p>
        <p class="field-explanation-intro">في دورة التوصيل مع التركيب، يُحدَّد موعد التوصيل بناءً على موعد التركيب قبله بـ 24 أو 48 ساعة حسب الإعداد المعتمد، ولا تبدأ مهمة التوصيل من بداية دورة عمل خدمة التوصيل، وإنما تنتقل مباشرة إلى مرحلة "ربط الخدمة بالسائق"، ثم تستكمل مراحل خدمة التوصيل: <strong>ربط الخدمة بالسائق ← ملئ النموذج (سند التحميل) ← جاري التوصيل ← استلام الخدمة</strong>.</p>
        <p class="field-explanation-intro">بعد تأكيد استلام العميل للخدمة تكتمل خدمة التوصيل.</p>
        <aside class="internal-transfer-example"><strong>التنفيذ:</strong> إدارة المستودعات</aside>
        ${renderInstallationDeliveryScreenshot("assest/installation/9.png", "مهمة التوصيل في مرحلة ربط الخدمة بالسائق ضمن دورة التوصيل مع التركيب", "مهمة التوصيل في مرحلة ربط الخدمة بالسائق")}
        <p><a class="secondary-link" href="${routeHref("lesson", "customer-delivery")}" data-workflow-overlay="customer-delivery">عرض دورة التوصيل <span aria-hidden="true">↗</span></a></p>`)}

      ${section(installation, "03", `
        <p class="field-explanation-intro">لا يمكن البدء بتنفيذ خدمة التركيب قبل اكتمال خدمة التصنيع، كما يتطلب التنفيذ الفعلي للتركيب اكتمال خدمة التوصيل ووصول البضاعة إلى العميل، وفق التسلسل التالي:</p>
        <ol class="guide-steps">
          <li>اكتمال خدمة التصنيع.</li>
          <li>تنفيذ خدمة التوصيل.</li>
          <li>وصول البضاعة إلى العميل.</li>
          <li>وصول الفني إلى الموقع.</li>
          <li>فتح نموذج التركيب.</li>
          <li>الضغط على زر بدء التركيب <bdi dir="ltr">(Start Installation)</bdi>.</li>
          <li>تنفيذ أعمال التركيب.</li>
          <li>الضغط على زر إنهاء التركيب <bdi dir="ltr">(Finish Installation)</bdi>.</li>
          <li>توثيق استلام العميل للخدمة من خلال توقيعه على النموذج.</li>
        </ol>
        <div class="internal-transfer-delivery-link-image-pair">
          ${renderInstallationDeliveryScreenshot("assest/installation/11.png", "زر بدء التركيب (Start Installation) لبدء تنفيذ خدمة التركيب في موقع العميل", "بدء تنفيذ التركيب")}
          ${renderInstallationDeliveryScreenshot("assest/installation/12.png", "إنهاء خدمة التركيب وتوثيق استلام العميل من خلال توقيعه على النموذج", "إنهاء التركيب واستلام العميل")}
        </div>`)}

      ${section(completed, "04", `
        <p class="field-explanation-intro">بعد إنهاء أعمال التركيب وتوثيق استلام العميل للخدمة، تنتقل مهمة التركيب إلى مرحلة تم التركيب، وبذلك تكتمل علاقة التصنيع والتوصيل والتركيب.</p>
        ${renderInstallationDeliveryScreenshot("assest/installation/14.png", "اكتمال دورة خدمة التركيب وانتقال المهمة إلى مرحلة تم التركيب", "مرحلة تم التركيب")}
        <p><a class="secondary-link" href="${routeHref("lesson", "installation-full")}">عرض تركيب كامل <span aria-hidden="true">←</span></a></p>`)}

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        تكتمل خدمة التصنيع أولًا عند وصول مهمتها إلى مرحلة تم الانتهاء من الخدمة، ثم تستمر دورة التركيب وتُنفَّذ خدمة التوصيل للعميل بدءًا من مرحلة ربط الخدمة بالسائق، وبعد اكتمال التوصيل ووصول البضاعة إلى العميل يبدأ الفني تنفيذ أعمال التركيب حتى مرحلة تم التركيب.
      </aside>
    </div>`;
}

// A dependency page, not a workflow page: it says why Manufacturing waits for Measurement and for
// the approved Design, and sends the reader to each service's own page for that service's stages.
function renderManufacturingMeasurementLinkContent() {
  const [measurement, design, manufacturing] = manufacturingWithMeasurementTour.children;
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content manufacturing-with-measurement-workflow">
      <header class="case-header" aria-labelledby="manufacturingWithMeasurementTitle">
        <div>
          <h1 id="manufacturingWithMeasurementTitle">${manufacturingWithMeasurementTour.title}</h1>
          ${renderWorkflowFlow(manufacturingWithMeasurementTour, { numberStart: 0 })}
        </div>
      </header>

      <p class="field-explanation-intro"><strong>لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال رفع المقاسات والتصميم المعتمد.</strong></p>

      <p class="field-explanation-intro">المنتج المُصنَّع في هذا المسار، مثل مغسلة مفصّلة حسب الطلب، يحتاج إلى مقاسات فعلية قبل إعداد التصميم، ويُنفَّذ التصنيع بناءً على التصميم المعتمد. لذلك تمر هذه العلاقة بثلاث خدمات بالترتيب: رفع المقاسات، ثم التصميم، ثم التصنيع.</p>

      ${section(measurement, "00", `
        <p class="field-explanation-intro">يتم رفع المقاسات الفعلية للمنتج أو موقع التنفيذ، وهي الأساس الذي سيتم الاعتماد عليه في إعداد التصميم.</p>
        <p><a class="secondary-link" href="${routeHref("service", "measurement")}">فتح خدمة رفع المقاسات <span aria-hidden="true">↗</span></a></p>`)}

      ${section(design, "01", `
        <p class="field-explanation-intro">يتم إعداد التصميم بناءً على المقاسات المعتمدة، ويجب اعتماد التصميم قبل الانتقال إلى التصنيع.</p>
        <p><a class="secondary-link" href="${routeHref("service", "design")}">فتح خدمة التصميم <span aria-hidden="true">↗</span></a></p>`)}

      ${section(manufacturing, "02", `
        <p class="field-explanation-intro">بعد اكتمال رفع المقاسات واعتماد التصميم، يمكن البدء بتنفيذ خدمة التصنيع وفق التصميم المعتمد.</p>
        <p><a class="secondary-link" href="${routeHref("service", "manufacturing")}">فتح خدمة التصنيع <span aria-hidden="true">↗</span></a></p>`)}

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        التسلسل المعتمد لهذه العلاقة هو رفع المقاسات ← التصميم ← التصنيع. تبدأ العلاقة برفع المقاسات الفعلية، ثم يُعد التصميم بناءً على هذه المقاسات ويُعتمد، وبعد اعتماد التصميم يمكن البدء بتنفيذ خدمة التصنيع. لا تنتقل خدمة رفع المقاسات إلى التصنيع مباشرة، لأن التصميم يقع بينهما.
      </aside>
    </div>`;
}

// The direct dependency only: Manufacturing executes against the approved design. The upstream
// رفع المقاسات is named once as a pointer to its own relationship page, never as a stage here.
function renderManufacturingDesignLinkContent() {
  const [design, manufacturing] = manufacturingWithDesignTour.children;
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content manufacturing-with-design-workflow">
      <header class="case-header" aria-labelledby="manufacturingWithDesignTitle">
        <div>
          <h1 id="manufacturingWithDesignTitle">${manufacturingWithDesignTour.title}</h1>
          ${renderWorkflowFlow(manufacturingWithDesignTour, { numberStart: 0 })}
        </div>
      </header>

      <p class="field-explanation-intro"><strong>لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال واعتماد التصميم.</strong></p>

      <p class="field-explanation-intro">توضح هذه الصفحة الاعتماد المباشر لخدمة التصنيع على التصميم المعتمد. التصميم المعتمد هو المرجع الذي يُنفَّذ المنتج بناءً عليه، ولا يدخل المنتج مرحلة التصنيع قبل اكتمال التصميم واعتماده.</p>

      ${section(design, "00", `
        <p class="field-explanation-intro">يتم إعداد التصميم واعتماده قبل بدء التصنيع، ويصبح التصميم المعتمد المرجع الذي سيتم تنفيذ المنتج بناءً عليه.</p>
        <p><a class="secondary-link" href="${routeHref("service", "design")}">فتح خدمة التصميم <span aria-hidden="true">↗</span></a></p>`)}

      ${section(manufacturing, "01", `
        <p class="field-explanation-intro">بعد اكتمال واعتماد التصميم، يمكن البدء بتنفيذ خدمة التصنيع وفق التفاصيل والمواصفات الواردة في التصميم المعتمد.</p>
        <p><a class="secondary-link" href="${routeHref("service", "manufacturing")}">فتح خدمة التصنيع <span aria-hidden="true">↗</span></a></p>`)}

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        الاعتماد المباشر في هذه العلاقة هو التصميم ← التصنيع. يُعد التصميم ويُعتمد أولًا، ثم يُنفَّذ التصنيع وفق التصميم المعتمد، ولا يبدأ التصنيع قبل اعتماد التصميم.
      </aside>

      <p class="field-explanation-intro">أما السلسلة الكاملة التي تسبق التصميم فهي موضحة في صفحة <a class="secondary-link" href="${routeHref("lesson", "manufacturing-with-measurement")}">التصنيع مع رفع المقاسات <span aria-hidden="true">↗</span></a></p>
    </div>`;
}

// The handover only: the manufactured product continues into Delivery once Manufacturing is
// complete. Whether that handover is created or unlocked by the system is not documented, so this
// page says when Delivery may run, never how the task gets there.
function renderManufacturingDeliveryLinkContent() {
  const [manufacturing, delivery] = manufacturingWithDeliveryTour.children;
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content manufacturing-with-delivery-workflow">
      <header class="case-header" aria-labelledby="manufacturingWithDeliveryTitle">
        <div>
          <h1 id="manufacturingWithDeliveryTitle">${manufacturingWithDeliveryTour.title}</h1>
          ${renderWorkflowFlow(manufacturingWithDeliveryTour, { numberStart: 0 })}
        </div>
      </header>

      <p class="field-explanation-intro"><strong>لا يمكن تنفيذ توصيل المنتج المُصنَّع قبل اكتمال خدمة التصنيع.</strong></p>

      <p class="field-explanation-intro">توضح هذه الصفحة انتقال المنتج المُصنَّع من خدمة التصنيع إلى خدمة التوصيل. بالنسبة للمنتج الذي يتطلب تصنيعًا، يجب اكتمال المنتج المُصنَّع أولًا، وبعدها تكون خدمة التوصيل هي الخدمة التالية التي ينتقل بها المنتج إلى العميل.</p>

      ${section(manufacturing, "00", `
        <p class="field-explanation-intro">يتم تنفيذ خدمة التصنيع حتى يصبح المنتج المُصنَّع جاهزًا للانتقال إلى الخدمة التالية.</p>
        <p><a class="secondary-link" href="${routeHref("service", "manufacturing")}">فتح خدمة التصنيع <span aria-hidden="true">↗</span></a></p>`)}

      ${section(delivery, "01", `
        <p class="field-explanation-intro">بعد اكتمال خدمة التصنيع، يمكن متابعة دورة المنتج من خلال خدمة التوصيل حتى يصل المنتج إلى العميل.</p>
        <p><a class="secondary-link" href="${routeHref("service", "delivery")}">فتح خدمة التوصيل <span aria-hidden="true">↗</span></a></p>`)}

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        الاعتماد المباشر في هذه العلاقة هو التصنيع ← التوصيل. يكتمل التصنيع أولًا، وبعد اكتماله يمكن تنفيذ خدمة التوصيل لإيصال المنتج المُصنَّع إلى العميل.
      </aside>

      <p class="field-explanation-intro">تقع هذه العلاقة ضمن سلسلة الخدمات الأوسع، والجزء الذي يسبق التصنيع موضح في صفحة <a class="secondary-link" href="${routeHref("lesson", "manufacturing-with-measurement")}">التصنيع مع رفع المقاسات <span aria-hidden="true">↗</span></a></p>
    </div>`;
}

// The Manufacturing-side view of the chain. The same dependency is documented from the Installation
// side on تركيب مع تصنيع, which keeps the installation execution detail; this page links to it
// instead of repeating it.
function renderManufacturingInstallationLinkContent() {
  const [manufacturing, delivery, installation] = manufacturingWithInstallationTour.children;
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content manufacturing-with-installation-workflow">
      <header class="case-header" aria-labelledby="manufacturingWithInstallationTitle">
        <div>
          <h1 id="manufacturingWithInstallationTitle">${manufacturingWithInstallationTour.title}</h1>
          ${renderWorkflowFlow(manufacturingWithInstallationTour, { numberStart: 0 })}
        </div>
      </header>

      <p class="field-explanation-intro"><strong>لا يمكن البدء بتنفيذ خدمة التركيب للمنتج المُصنَّع قبل اكتمال خدمة التصنيع ووصول المنتج إلى العميل من خلال خدمة التوصيل.</strong></p>

      <p class="field-explanation-intro">توضح هذه الصفحة كيف يصل المنتج المُصنَّع إلى خدمة التركيب. لا ينتقل المنتج من التصنيع إلى التركيب مباشرة، لأن خدمة التوصيل تقع بينهما: يكتمل التصنيع أولًا، ثم يُنفَّذ التوصيل لإيصال المنتج إلى العميل، وبعد وصوله يمكن البدء بأعمال التركيب.</p>

      ${section(manufacturing, "00", `
        <p class="field-explanation-intro">يتم تنفيذ خدمة التصنيع حتى يكتمل المنتج المُصنَّع ويصبح جاهزًا للانتقال إلى الخدمة التالية.</p>
        <p><a class="secondary-link" href="${routeHref("service", "manufacturing")}">فتح خدمة التصنيع <span aria-hidden="true">↗</span></a></p>`)}

      ${section(delivery, "01", `
        <p class="field-explanation-intro">بعد اكتمال التصنيع، يتم تنفيذ خدمة التوصيل لإيصال المنتج المُصنَّع إلى العميل.</p>
        <p><a class="secondary-link" href="${routeHref("service", "delivery")}">فتح خدمة التوصيل <span aria-hidden="true">↗</span></a></p>`)}

      ${section(installation, "02", `
        <p class="field-explanation-intro">بعد اكتمال التوصيل ووصول المنتج إلى العميل، يمكن البدء بتنفيذ خدمة التركيب.</p>
        <p><a class="secondary-link" href="${routeHref("service", "installation")}">فتح خدمة التركيب <span aria-hidden="true">↗</span></a></p>`)}

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        التسلسل المعتمد لهذه العلاقة هو التصنيع ← التوصيل ← التركيب. التوصيل يقع بين التصنيع والتركيب، ولا ينتقل المنتج المُصنَّع من التصنيع إلى التركيب مباشرة.
      </aside>

      <p class="field-explanation-intro">هذه العلاقة موثقة من جهة خدمة التركيب أيضًا في صفحة <a class="secondary-link" href="${routeHref("lesson", "installation-with-manufacturing")}">تركيب مع تصنيع <span aria-hidden="true">↗</span></a></p>
    </div>`;
}

// دورات العمل المركبة → the end-to-end scenario. A training page, so every stage keeps its own
// section and screenshots, but the detail of each service stays on that service's page: this page
// explains the order and the one dependency the reader can see on screen (Delivery waiting on the
// internal transfer), and links out for the rest.
function renderCompositeManufacturingContent() {
  const [invoice, measurement, design, manufacturing, internalTransfer, delivery, installation] =
    compositeManufacturingTour.children;
  const measurementImages = "assest/رفع مقاسات";
  const transferImages = "assest/النقل الداخلي";
  const dependencyImages = "assest/علاقة خدمة النقل الداخلي بخدمة التوصيل للعميل";
  const installationImages = "assest/installation";

  const shot = (src, alt, label) => `
        <figure class="odoo-screenshot-frame">
          <img src="${src}" alt="${alt}" tabindex="0" role="button" aria-label="اضغط لتكبير صورة ${label}" title="اضغط لتكبير الصورة" />
        </figure>`;
  const openService = (type, id, label) =>
    `<p><a class="secondary-link" href="${routeHref(type, id)}">${label} <span aria-hidden="true">↗</span></a></p>`;
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content composite-manufacturing-workflow">
      <header class="case-header" aria-labelledby="compositeManufacturingTitle">
        <div>
          <h1 id="compositeManufacturingTitle">${compositeManufacturingTour.title}</h1>
          <p>${compositeManufacturingTour.subtitle}</p>
          ${renderWorkflowFlow(compositeManufacturingTour, { numberStart: 0 })}
        </div>
      </header>

      <p class="field-explanation-intro">تجمع هذه الدورة ست خدمات في سيناريو واحد: تبدأ بفاتورة من SAP تحتوي على الخدمات المطلوبة، ثم تمر برفع المقاسات والتصميم والتصنيع، وبعد اكتمال التصنيع تُنفَّذ التحويلات الداخلية لنقل البضاعة إلى مستودع التجمع، ثم تُنفَّذ خدمة التوصيل، وأخيرًا تبدأ خدمة التركيب لدى العميل.</p>

      <p class="field-explanation-intro"><strong>في هذا السيناريو يأتي التصنيع قبل التحويلات الداخلية.</strong> ولا يمكن البدء بتنفيذ خدمة التركيب قبل اكتمال التوصيل ووصول المنتج إلى العميل.</p>

      ${section(invoice, "00", `
        <p class="field-explanation-intro">تبدأ الدورة بوصول فاتورة من SAP إلى نظام خدمات مابعد البيع، وتحتوي على الخدمات والمنتجات المطلوبة في هذا السيناريو. يُنشأ لكل خدمة طلبها الخاص داخل النظام، وتظهر الخدمات المرتبطة بالفاتورة معًا.</p>
        ${shot("assest/2a.png", "تفاصيل فاتورة SAP داخل نظام خدمات مابعد البيع", "تفاصيل فاتورة SAP")}
        ${shot(`${dependencyImages}/1.png`, "مهام الفاتورة في نظام خدمات مابعد البيع تعرض التحويلات الداخلية وخدمة التوصيل معًا على نفس الفاتورة", "مهام الفاتورة")}`)}

      ${section(measurement, "01", `
        <p class="field-explanation-intro">يتم رفع المقاسات الفعلية المطلوبة للمنتج المُصنَّع. هذه المقاسات هي الأساس الذي سيتم الاعتماد عليه في إعداد التصميم، ورفع المقاسات مطلوب قبل التصميم.</p>
        ${shot(`${measurementImages}/1.png`, "طلب رفع المقاسات المنشأ من فاتورة SAP ويظهر في مرحلة طلب رفع مقاسات", "طلب رفع المقاسات")}
        ${shot(`${measurementImages}/12.png`, "تسجيل الغرف والمقاسات وإرفاق الصور والملاحظات داخل نموذج رفع المقاسات", "تسجيل المقاسات")}
        ${openService("service", "measurement", "فتح خدمة رفع المقاسات")}`)}

      ${section(design, "02", `
        <p class="field-explanation-intro">يتم إعداد التصميم بناءً على المقاسات المعتمدة. ويجب اكتمال التصميم واعتماده قبل البدء بالتصنيع، لأن التصنيع يُنفَّذ وفق التصميم المعتمد.</p>
        ${shot("assest/التصميم/1.png", "لوحة عمليات خدمة التصميم في نظام خدمات مابعد البيع وتعرض مراحل طلب تصميم ومُسندة لمصمم وجاري العمل على التصميم وموافقات داخلية وبانتظار موافقة العميل ومكتمل ومعتمد", "لوحة خدمة التصميم")}
        ${openService("service", "design", "فتح خدمة التصميم")}`)}

      ${section(manufacturing, "03", `
        <p class="field-explanation-intro">بعد اعتماد التصميم يبدأ تنفيذ خدمة التصنيع، ويُصنَّع المنتج وفق التصميم المعتمد. ويجب اكتمال خدمة التصنيع قبل الانتقال إلى بقية خدمات هذا السيناريو.</p>
        ${shot("assest/التصنيع/1.png", "لوحة عمليات خدمة التصنيع في نظام خدمات مابعد البيع وتعرض مراحل طلب خدمة تصنيع وإرسال إلى ورشة التصنيع وجاري التصنيع وتم الانتهاء من الخدمة", "لوحة خدمة التصنيع")}
        ${openService("service", "manufacturing", "فتح خدمة التصنيع")}`)}

      ${section(internalTransfer, "04", `
        <p class="field-explanation-intro">في هذا السيناريو يكون التصنيع قد اكتمل قبل هذه المرحلة. وإذا كانت البضاعة أو جزء منها موجودة في مستودع مختلف عن مستودع التجمع، تُنفَّذ التحويلات الداخلية لنقل البضاعة إلى مستودع التجمع وفق دورة عمل التحويلات الداخلية الحالية، حتى يتم تأكيد استلامها وتنتقل المهمة إلى مرحلة تم الاستلام.</p>
        ${shot(`${transferImages}/7.png`, "التحويلات الداخلية تعرض طلب نقل من مستودع الرياض R574 إلى مستودع جدة J521", "طلب نقل بين المستودعات")}
        ${shot(`${transferImages}/8.png`, "لوحة عمليات التحويلات الداخلية في نظام خدمات مابعد البيع مع تمييز مهمة التحويلات الداخلية في عمود تم الاستلام", "مرحلة تم الاستلام")}
        ${openService("lesson", "internal-transfer", "فتح خدمة التحويلات الداخلية")}`)}

      ${section(delivery, "05", `
        <p class="field-explanation-intro">تعتمد خدمة التوصيل في هذا السيناريو على وصول البضاعة إلى مستودع التجمع. فطالما لم تكتمل التحويلات الداخلية، تكون خدمة التوصيل موجودة لكنها لا تستطيع المتابعة.</p>

        <div class="dependency-status-definitions" aria-label="تعريف حالات اعتماد خدمة التوصيل">
          <article class="dependency-status-definition dependency-status-definition--blocked">
            <h2>الحالة الحمراء — محظور بسبب الاعتماد</h2>
            <bdi class="dependency-status-technical-label" dir="ltr">(Blocked by Dependency)</bdi>
            <p>تعني أن خدمة التوصيل موجودة، ولكن لا يمكن البدء بها لأن التحويلات الداخلية لم تكتمل بعد.</p>
          </article>
          <article class="dependency-status-definition dependency-status-definition--ready">
            <h2>الحالة الخضراء — جاهز بعد اكتمال الاعتماد</h2>
            <bdi class="dependency-status-technical-label" dir="ltr">(Dependency Ready)</bdi>
            <p>تعني أن التحويلات الداخلية اكتملت، وأصبحت خدمة التوصيل جاهزة للمتابعة.</p>
          </article>
        </div>

        <p class="field-explanation-intro">قبل اكتمال التحويلات الداخلية تظهر خدمة التوصيل بالحالة الحمراء: محظور بسبب الاعتماد <bdi dir="ltr">(Blocked by Dependency)</bdi>.</p>
        ${shot(`${dependencyImages}/4.png`, "بطاقة خدمة التوصيل في نظام خدمات مابعد البيع تظهر بالحالة الحمراء محظور بسبب الاعتماد (Blocked by Dependency)", "الحالة الحمراء محظور بسبب الاعتماد")}

        <p class="field-explanation-intro">بعد اكتمال التحويلات الداخلية ووصول البضاعة بالكامل إلى مستودع التجمع، يُفك الاعتماد وتتحول خدمة التوصيل إلى الحالة الخضراء: جاهز بعد اكتمال الاعتماد <bdi dir="ltr">(Dependency Ready)</bdi>، وعندها يمكن متابعة دورة التوصيل للعميل.</p>
        ${shot(`${dependencyImages}/3.png`, "بطاقة خدمة التوصيل في نظام خدمات مابعد البيع تظهر بالحالة الخضراء جاهز بعد اكتمال الاعتماد (Dependency Ready)", "الحالة الخضراء جاهز بعد اكتمال الاعتماد")}

        ${openService("service", "delivery", "فتح خدمة التوصيل")}
        ${openService("lesson", "customer-delivery", "عرض دورة عمل التوصيل")}`)}

      ${section(installation, "06", `
        <p class="field-explanation-intro">بعد اكتمال خدمة التوصيل ووصول المنتج إلى العميل، يمكن البدء بتنفيذ خدمة التركيب، وهي الخدمة الأخيرة في هذه الدورة المركبة.</p>
        ${shot(`${installationImages}/11.png`, "زر بدء التركيب (Start Installation) لبدء تنفيذ خدمة التركيب في موقع العميل", "بدء التركيب")}
        ${shot(`${installationImages}/14.png`, "اكتمال دورة خدمة التركيب وانتقال المهمة إلى مرحلة تم التركيب", "اكتمال التركيب")}
        ${openService("service", "installation", "فتح خدمة التركيب")}`)}

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        التسلسل الكامل لهذه الدورة هو: فاتورة من SAP ← رفع المقاسات ← التصميم ← التصنيع ← التحويلات الداخلية ← التوصيل ← التركيب. رفع المقاسات يسبق التصميم، والتصميم يسبق التصنيع، والتصنيع يسبق التحويلات الداخلية في هذا السيناريو، والتحويلات الداخلية تسبق التوصيل عندما تحتاج البضاعة إلى النقل إلى مستودع التجمع، والتوصيل يسبق التركيب.
      </aside>
    </div>`;
}

function renderSubTaskCycleFlowDiagram() {
  return renderWorkflowFlow(subTaskCycleTour, { numberStart: 0 });
}

function renderSubTaskCycleContent() {
  return `
    <div class="workflow-content sub-task-cycle-workflow">
      ${renderSubTaskCycleFlowDiagram()}

      <section id="sub-task-cycle-step-1" class="panel invoice-training-section" aria-labelledby="subTaskCycleStep1Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">01</span>
          <div><h2 id="subTaskCycleStep1Title">الفاتورة الرئيسية</h2></div>
        </div>
        <p class="field-explanation-intro">تظهر الفاتورة الرئيسية ضمن مراحل خدمة التوصيل، مثل مرحلة طلب توصيل الظاهرة في الصورة. ومن داخل الفاتورة الرئيسية يمكن إنشاء مهمة فرعية عند الحاجة إلى استكمال توصيل جزء من الكمية.</p>
        <figure class="odoo-screenshot-frame">
          <img src="assest/subtask/2.png" alt="الفاتورة الرئيسية في مرحلة طلب توصيل مع إظهار تبويب Sub-tasks لإنشاء مهمة فرعية" tabindex="0" role="button" aria-label="اضغط لتكبير صورة الفاتورة الرئيسية" title="اضغط لتكبير الصورة" />
        </figure>
        <aside class="sub-task-cycle-note">ملاحظة: يمكن إنشاء مهمة فرعية (Sub Task) من الفاتورة الرئيسية في أي مرحلة من مراحل خدمة التوصيل، حسب الحاجة إلى استكمال جزء من عملية التوصيل.</aside>
      </section>

      <section id="sub-task-cycle-step-2" class="panel invoice-training-section" aria-labelledby="subTaskCycleStep2Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">02</span>
          <div><h2 id="subTaskCycleStep2Title">إنشاء مهمة فرعية</h2></div>
        </div>
        <p class="field-explanation-intro">عند الضغط على الفاتورة الرئيسية، ننتقل إلى التبويبة السفلية الخاصة بإنشاء مهمة فرعية داخل المهمة الرئيسية. بعد ذلك يتم إدخال عنوان المهمة الفرعية، واختيار المسؤول عن تنفيذها، ثم الضغط على زر View لاستعراض مراحل المهمة الفرعية والبدء بتنفيذها.</p>
        <figure class="odoo-screenshot-frame">
          <img src="assest/subtask/2 - Copy.png" alt="إنشاء مهمة فرعية من تبويب Sub-tasks داخل الفاتورة الرئيسية مع تحديد عنوان المهمة وتعيين المشرف" tabindex="0" role="button" aria-label="اضغط لتكبير صورة إنشاء مهمة فرعية" title="اضغط لتكبير الصورة" />
        </figure>
      </section>

      <section id="sub-task-cycle-step-3" class="panel invoice-training-section" aria-labelledby="subTaskCycleStep3Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">03</span>
          <div><h2 id="subTaskCycleStep3Title">تنفيذ خطوات المهمة الفرعية</h2></div>
        </div>
        <p class="field-explanation-intro">بعد إنشاء مهمة التوصيل الجزئي، تظهر المهمة الفرعية مرتبطة بالفاتورة الرئيسية، ويصبح لها مسار خدمة توصيل مستقل لتنفيذ الكمية المتبقية. يتم استكمال دورة التوصيل من خلال نفس مراحل خدمة التوصيل المعتمدة حتى إتمام استلام الخدمة.</p>
        <figure class="odoo-screenshot-frame">
          <img src="assest/subtask/3.png" alt="المهمة الفرعية بعد إنشائها مع ظهور ارتباط Parent Task بالفاتورة الرئيسية" tabindex="0" role="button" aria-label="اضغط لتكبير صورة ارتباط المهمة الفرعية بالفاتورة الرئيسية" title="اضغط لتكبير الصورة" />
        </figure>
      </section>

      <section id="sub-task-cycle-step-4" class="panel invoice-training-section" aria-labelledby="subTaskCycleStep4Title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">04</span>
          <div><h2 id="subTaskCycleStep4Title">اكتمال خدمة التوصيل الجزئي</h2></div>
        </div>
        <p class="field-explanation-intro">بعد إتمام دورة التوصيل للمهمة الفرعية، تظهر الفاتورة الرئيسية موضحة اكتمال مهمة التوصيل الجزئي المرتبطة بها. ويظهر مؤشر المهام الفرعية بحالة 1/1، ما يدل على اكتمال المهمة الفرعية المرتبطة بالفاتورة الرئيسية.</p>
        <figure class="odoo-screenshot-frame sub-task-cycle-completion-screenshot">
          <img src="assest/subtask/4.png" alt="الفاتورة الرئيسية بعد اكتمال المهمة الفرعية مع ظهور مؤشر المهام الفرعية بحالة 1/1" tabindex="0" role="button" aria-label="اضغط لتكبير صورة اكتمال المهمة الفرعية" title="اضغط لتكبير الصورة" />
        </figure>
      </section>
    </div>`;
}

// خدمة التركيب → الباب الأول — أنواع خدمات التركيب → تركيب جزئي.
// The partial installation is a Sub Task inside the main Installation task, not a second workflow
// that starts from SAP: stage 04 links to the full Installation page instead of repeating its stages.
function renderInstallationPartialContent() {
  const [invoice, parentTask, createSubTask, blocked, execute, completed] = installationPartialTour.children;
  const section = (step, number, body) => `
      <section id="${step.targetId}" class="panel invoice-training-section" aria-labelledby="${step.targetId}-title">
        <div class="section-title">
          <span class="icon-tile" aria-hidden="true">${number}</span>
          <div><h2 id="${step.targetId}-title">${step.title}</h2></div>
        </div>
        ${body}
      </section>`;

  return `
    <div class="workflow-content installation-partial-workflow">
      <header class="case-header" aria-labelledby="installationPartialTitle">
        <div>
          <h1 id="installationPartialTitle">${installationPartialTour.title}</h1>
          ${renderWorkflowFlow(installationPartialTour, { numberStart: 0 })}
        </div>
      </header>

      <aside class="internal-transfer-example">
        <strong>الفكرة الأساسية:</strong>
        التركيب الجزئي يتم من خلال إنشاء مهمة فرعية (<bdi dir="ltr">Sub Task</bdi>) داخل طلب التركيب الرئيسي (<bdi dir="ltr">Parent Task</bdi>). وبعد إنشاء المهمة الفرعية يتم تنفيذها كأنها مهمة تركيب عادية. وطالما توجد مهمة فرعية غير مكتملة، تظهر على المهمة الرئيسية حالة <bdi dir="ltr">Blocked by Subtasks</bdi>، وبعد اكتمال المهمة الفرعية يظهر عدّاد المهام الفرعية مكتملًا مثل <bdi dir="ltr">1/1</bdi> وتختفي حالة <bdi dir="ltr">Blocked by Subtasks</bdi>.
      </aside>

      ${section(invoice, "00", `
        <p class="field-explanation-intro">التركيب الجزئي لا يصل من SAP كطلب مستقل. تبدأ الدورة كما تبدأ أي خدمة تركيب: تصل الفاتورة من SAP إلى نظام خدمات مابعد البيع، فيُنشأ طلب التركيب ويدخل دورة عمل خدمة التركيب العادية ويظهر في مرحلة طلب تركيب على لوحة خدمة التركيب.</p>
        <figure class="odoo-screenshot-frame">
          <img src="assest/تركيب جزئي/1.png" alt="لوحة خدمة التركيب في نظام خدمات مابعد البيع مع تحديد طلب التركيب الذي أنشأته الفاتورة القادمة من SAP في مرحلة طلب تركيب" tabindex="0" role="button" aria-label="اضغط لتكبير صورة طلب التركيب في مرحلة طلب تركيب" title="اضغط لتكبير الصورة" />
        </figure>`)}

      ${section(parentTask, "01", `
        <p class="field-explanation-intro">طلب التركيب الذي أنشأته الفاتورة هو المهمة الرئيسية (Parent Task)، ومن داخلها تُدار عملية التركيب الجزئي. لا توجد دورة تركيب جزئي مستقلة عن المهمة الرئيسية، ولا يُنشأ طلب تركيب جزئي منفصل من SAP: المهمة الفرعية تُنشأ من داخل طلب التركيب الرئيسي وتبقى مرتبطة به.</p>
        <p><a class="secondary-link" href="${routeHref("lesson", "installation-full")}">عرض تركيب كامل <span aria-hidden="true">←</span></a></p>`)}

      ${section(createSubTask, "02", `
        <p class="field-explanation-intro">من داخل طلب التركيب الرئيسي ننتقل إلى تبويب Sub-tasks في أسفل المهمة، ومنه تُضاف المهمة الفرعية المطلوبة. تظهر المهمة الفرعية بعد إضافتها كسطر داخل التبويب يحمل عمودي Title و Assignees، ويظهر بجانبه زر View لفتح المهمة الفرعية والانتقال إليها. وفي أعلى المهمة الرئيسية يظهر عدّاد المهام الفرعية Sub-tasks بالقيمة 0 / 1 (0%) ما دامت المهمة الفرعية غير مكتملة.</p>
        <figure class="odoo-screenshot-frame">
          <img src="assest/تركيب جزئي/2.png" alt="تبويب Sub-tasks داخل المهمة الرئيسية يعرض سطر المهمة الفرعية مع عمودي Title و Assignees وزر View، وفي أعلى المهمة عدّاد Sub-tasks بالقيمة 0 / 1 (0%)" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تبويب Sub-tasks وإنشاء المهمة الفرعية" title="اضغط لتكبير الصورة" />
        </figure>`)}

      ${section(blocked, "03", `
        <p class="field-explanation-intro">بعد إنشاء المهمة الفرعية يتغيّر شكل المهمة الرئيسية على اللوحة: تظهر بطاقتها باللون البرتقالي ويظهر عليها شريط Blocked by Subtasks مع عدّاد المهام الفرعية بالقيمة 0/1. وتبقى المهمة الرئيسية بهذه الحالة ما دامت هناك مهمة فرعية واحدة على الأقل غير مكتملة.</p>
        <div class="dependency-status-definitions" aria-label="الفرق بين Blocked by Subtasks و Blocked by Dependency">
          <article class="dependency-status-definition dependency-status-definition--subtasks">
            <h2>محظور بسبب المهام الفرعية</h2>
            <bdi class="dependency-status-technical-label" dir="ltr">(Blocked by Subtasks)</bdi>
            <p>تعني أن المهمة الرئيسية تحتوي على مهمة فرعية واحدة أو أكثر غير مكتملة، ويظهر معها عدّاد المهام الفرعية بالقيمة 0/1. ويختفي هذا الشريط بعد اكتمال المهام الفرعية.</p>
          </article>
          <article class="dependency-status-definition dependency-status-definition--blocked">
            <h2>محظور بسبب الاعتماد</h2>
            <bdi class="dependency-status-technical-label" dir="ltr">(Blocked by Dependency)</bdi>
            <p>حالة مختلفة تمامًا: تعني أن المهمة محظورة لأن خدمة أخرى مرتبطة بها لم تكتمل بعد، وليس بسبب وجود مهام فرعية.</p>
          </article>
        </div>
        <aside class="internal-transfer-dependency-note"><strong>تنبيه:</strong> Blocked by Subtasks ليست Blocked by Dependency. الأولى سببها وجود مهام فرعية غير مكتملة داخل المهمة نفسها، والثانية سببها اعتماد المهمة على خدمة أخرى لم تكتمل. لا يتم الخلط بينهما.</aside>
        <figure class="odoo-screenshot-frame">
          <img src="assest/تركيب جزئي/3.png" alt="بطاقة المهمة الرئيسية على لوحة خدمة التركيب تظهر باللون البرتقالي مع شريط Blocked by Subtasks وعدّاد المهام الفرعية 0/1" tabindex="0" role="button" aria-label="اضغط لتكبير صورة المهمة الرئيسية بحالة Blocked by Subtasks" title="اضغط لتكبير الصورة" />
        </figure>`)}

      ${section(execute, "04", `
        <p class="field-explanation-intro">تُفتح المهمة الفرعية من زر View داخل تبويب Sub-tasks، ثم تُنفَّذ كأنها مهمة تركيب عادية. المهمة الفرعية تمشي بنفس مراحل دورة خدمة التركيب المعتمدة من طلب تركيب وحتى تم التركيب، ولا توجد مراحل خاصة بالتركيب الجزئي تختلف عن دورة التركيب العادية.</p>
        <p><a class="secondary-link" href="${routeHref("lesson", "installation-full")}">عرض دورة خدمة التركيب — تركيب كامل <span aria-hidden="true">←</span></a></p>`)}

      ${section(completed, "05", `
        <p class="field-explanation-intro">بعد اكتمال المهمة الفرعية يتحدّث عدّاد المهام الفرعية على المهمة الرئيسية ليصبح 1/1، ويختفي شريط Blocked by Subtasks وتعود بطاقة المهمة الرئيسية إلى شكلها الطبيعي. ظهور العدّاد بالقيمة 1/1 بدون شريط Blocked by Subtasks هو المؤشر على أن المهمة الفرعية قد انتهت.</p>
        <div class="installation-partial-image-pair">
          <figure class="odoo-screenshot-frame">
            <img src="assest/تركيب جزئي/4.png" alt="لوحة خدمة التركيب بعد اكتمال المهمة الفرعية: بطاقة المهمة الرئيسية عادت إلى شكلها الطبيعي وعدّاد المهام الفرعية أصبح 1/1 وشريط Blocked by Subtasks اختفى" tabindex="0" role="button" aria-label="اضغط لتكبير صورة المهمة الرئيسية بعد اكتمال المهمة الفرعية" title="اضغط لتكبير الصورة" />
          </figure>
          <figure class="odoo-screenshot-frame">
            <img src="assest/تركيب جزئي/5.png" alt="تكبير لبطاقة المهمة الرئيسية يوضح عدّاد المهام الفرعية بالقيمة 1/1" tabindex="0" role="button" aria-label="اضغط لتكبير صورة عدّاد المهام الفرعية 1/1" title="اضغط لتكبير الصورة" />
          </figure>
        </div>
        <p class="installation-partial-pair-note">توضح الصورتان الحالة النهائية للمهمة الرئيسية: الصورة الأولى تعرض البطاقة على لوحة خدمة التركيب بعد اختفاء شريط Blocked by Subtasks، والصورة الثانية تكبير للعدّاد نفسه بالقيمة 1/1.</p>`)}

      <aside class="internal-transfer-example">
        <strong>الخلاصة:</strong>
        التركيب الجزئي هو مهمة فرعية (Sub Task) داخل طلب التركيب الرئيسي (Parent Task) وليس دورة عمل مستقلة تبدأ من SAP. التسلسل الكامل هو: فاتورة من SAP ← طلب تركيب رئيسي ← إنشاء Sub Task ← ظهور Blocked by Subtasks على المهمة الرئيسية ← تنفيذ التركيب داخل Sub Task بنفس دورة التركيب العادية ← اكتمال Sub Task وظهور 1/1 واختفاء Blocked by Subtasks.
      </aside>
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
      <nav class="operation-tabs" aria-label="أنواع خدمات التوصيل">
        ${chapter.items.filter((item) => item.visible).map((item, index) => `
          <a class="entry-card ${item.status === "مكتمل" ? "is-ready" : ""}" href="${routeHref("lesson", item.id)}">
            <span class="entry-card-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <span class="status-badge ${statusClass(item.status)}">${item.status}</span>
            <strong class="entry-card-title">${item.title}</strong>
            <span class="entry-card-description">${item.description}</span>
            <span class="entry-card-action">${item.status === "مكتمل" ? "فتح دورة العمل" : "فتح العملية"} <span aria-hidden="true">←</span></span>
          </a>`).join("")}
      </nav>
    </section>`;
}

function renderServiceCard(service, index) {
  const isAvailable = service.status === "متاح";
  return `
    <a class="entry-card ${isAvailable ? "is-ready" : ""}" href="${routeHref("service", service.id)}">
      <span class="entry-card-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      <span class="status-badge ${isAvailable ? "is-complete" : "is-soon"}">${service.status}</span>
      <strong class="entry-card-title">${service.title}</strong>
      <span class="entry-card-description">${service.description}</span>
      <span class="entry-card-action">${isAvailable ? "فتح الخدمة" : "عرض الخدمة"} <span aria-hidden="true">←</span></span>
    </a>`;
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
        <p>اختر نطاق الخدمة، ثم انتقل إلى أبوابها وفصولها التدريبية داخل نظام خدمات مابعد البيع.</p>
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
      portal.innerHTML = renderInstallationOverview(service);
    } else if (service.id === "measurement") {
      portal.innerHTML = `
        <div class="workflow-content">
          <header class="case-header" aria-labelledby="measurementWorkflowTitle">
            <div>
              <h1 id="measurementWorkflowTitle">${measurementTour.title}</h1>
              ${renderWorkflowFlow(measurementTour, { interactive: false, numberStart: 0 })}
            </div>
          </header>
          ${renderOverviewVideo("measurementOverviewVideoTitle", "فيديو شرح دورة رفع المقاسات كاملة", "شاهد دورة خدمة رفع المقاسات كاملة من وصول الفاتورة من SAP وحتى اكتمال الخدمة.", "videos/measurement-workflow.mp4")}

          <section id="measurement-step-request" class="panel invoice-training-section" aria-labelledby="measurementRequestTitle">
            <div class="section-title">
              <span class="icon-tile" aria-hidden="true">01</span>
              <div><h2 id="measurementRequestTitle">طلب رفع مقاسات</h2></div>
            </div>
            <p class="field-explanation-intro">تبدأ دورة العمل بوصول الفاتورة التي تحتوي على خدمة رفع المقاسات من SAP إلى نظام خدمات مابعد البيع، حيث تظهر في مرحلة "طلب رفع مقاسات" لبدء تنفيذ الخدمة.</p>
            <figure class="odoo-screenshot-frame">
              <img src="assest/رفع مقاسات/1.png" alt="طلب رفع المقاسات المنشأ من فاتورة SAP ويظهر في مرحلة طلب رفع مقاسات" tabindex="0" role="button" aria-label="اضغط لتكبير صورة طلب رفع المقاسات" title="اضغط لتكبير الصورة" />
            </figure>
          </section>

          <section id="measurement-step-readiness" class="panel invoice-training-section" aria-labelledby="measurementReadinessTitle">
            <div class="section-title">
              <span class="icon-tile" aria-hidden="true">02</span>
              <div><h2 id="measurementReadinessTitle">التحقق من الجاهزية وحجز الموعد</h2></div>
            </div>
            <div class="technician-assignment-flow" aria-label="خطوات حجز موعد خدمة رفع المقاسات">
              <p class="field-explanation-intro">تظهر الفاتورة في مرحلة طلب رفع مقاسات، ويتم نقلها إلى مرحلة التحقق من الجاهزية وحجز الموعد إما بشكل يدوي باستخدام السحب والإفلات (Drag & Drop)، أو يقوم النظام بنقلها تلقائيًا في حال لم يتم نقلها يدويًا. عند انتقال المهمة إلى هذه المرحلة، يقوم النظام تلقائيًا بإرسال رسالة واتساب إلى العميل تحتوي على رابط لحجز موعد خدمة رفع المقاسات.</p>
              <figure class="odoo-screenshot-frame">
                <img src="assest/رفع مقاسات/2.png" alt="مهمة رفع المقاسات في مرحلة التحقق من الجاهزية وحجز الموعد مع معلومات حجز الموعد عبر واتساب" tabindex="0" role="button" aria-label="اضغط لتكبير صورة التحقق من الجاهزية وحجز موعد رفع المقاسات" title="اضغط لتكبير الصورة" />
              </figure>

              <p class="field-explanation-intro">بعد وصول الرابط للعميل (خدمة العملاء)، يقوم العميل بالخطوات التالية:</p>

              <article class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="أ — تأكيد جاهزية الموقع"><span class="installation-substep-badge" aria-hidden="true">أ</span><span>— تأكيد جاهزية الموقع</span></h3>
                <p class="field-explanation-intro">يؤكد العميل جاهزية الموقع لخدمة رفع المقاسات، ويرفق صورة للموقع عند الحاجة، مع إمكانية إضافة ملاحظات قبل المتابعة.</p>
                <figure class="odoo-screenshot-frame measurement-booking-screenshot">
                  <img src="assest/رفع مقاسات/3.png" alt="تأكيد جاهزية الموقع وإرفاق صورة وإضافة ملاحظات لخدمة رفع المقاسات" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تأكيد جاهزية الموقع" title="اضغط لتكبير الصورة" />
                </figure>
              </article>

              <span class="technician-assignment-transition" aria-hidden="true">↓</span>

              <article class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="ب — اختيار موعد رفع المقاسات"><span class="installation-substep-badge" aria-hidden="true">ب</span><span>— اختيار موعد رفع المقاسات</span></h3>
                <p class="field-explanation-intro">يختار العميل التاريخ المناسب لتنفيذ خدمة رفع المقاسات من المواعيد المتاحة.</p>
                <figure class="odoo-screenshot-frame measurement-booking-screenshot">
                  <img src="assest/رفع مقاسات/4.png" alt="اختيار التاريخ المناسب لموعد رفع المقاسات" tabindex="0" role="button" aria-label="اضغط لتكبير صورة اختيار موعد رفع المقاسات" title="اضغط لتكبير الصورة" />
                </figure>
              </article>

              <span class="technician-assignment-transition" aria-hidden="true">↓</span>

              <article class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="ج — بيانات العميل وموقع تنفيذ الخدمة"><span class="installation-substep-badge" aria-hidden="true">ج</span><span>— بيانات العميل وموقع تنفيذ الخدمة</span></h3>
                <p class="field-explanation-intro">يراجع العميل بيانات التواصل، ويحدد موقع تنفيذ خدمة رفع المقاسات على الخريطة قبل تأكيد الموعد.</p>
                <figure class="odoo-screenshot-frame measurement-booking-screenshot">
                  <img src="assest/رفع مقاسات/5.png" alt="مراجعة بيانات العميل وتحديد موقع تنفيذ خدمة رفع المقاسات على الخريطة" tabindex="0" role="button" aria-label="اضغط لتكبير صورة بيانات العميل وموقع تنفيذ الخدمة" title="اضغط لتكبير الصورة" />
                </figure>
              </article>

              <span class="technician-assignment-transition" aria-hidden="true">↓</span>

              <article class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="د — تأكيد الموعد"><span class="installation-substep-badge" aria-hidden="true">د</span><span>— تأكيد الموعد</span></h3>
                <p class="field-explanation-intro">بعد تأكيد البيانات والموقع والموعد، يتم تثبيت الحجز وتظهر للعميل رسالة تؤكد جدولة موعد خدمة رفع المقاسات.</p>
                <figure class="odoo-screenshot-frame measurement-booking-screenshot">
                  <img src="assest/رفع مقاسات/6.png" alt="رسالة تأكيد جدولة موعد خدمة رفع المقاسات بعد تثبيت الحجز" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تأكيد موعد رفع المقاسات" title="اضغط لتكبير الصورة" />
                </figure>
              </article>
            </div>
          </section>

          <section id="measurement-step-technician-assigned" class="panel invoice-training-section" aria-labelledby="measurementTechnicianAssignedTitle">
            <div class="section-title">
              <span class="icon-tile" aria-hidden="true">03</span>
              <div><h2 id="measurementTechnicianAssignedTitle">تم تعيين الفني</h2></div>
            </div>
            <p class="field-explanation-intro">بعد تأكيد موعد خدمة رفع المقاسات، تنتقل المهمة إلى مرحلة تم تعيين الفني، حيث يقوم الموظف المختص بتحديد الفني المسؤول عن تنفيذ الخدمة من خلال حقل Assign.</p>
            <figure class="odoo-screenshot-frame">
              <img src="assest/رفع مقاسات/7.png" alt="مهمة رفع المقاسات في مرحلة تم تعيين الفني مع حقل Assign لتحديد الفني المسؤول" tabindex="0" role="button" aria-label="اضغط لتكبير صورة مرحلة تم تعيين الفني" title="اضغط لتكبير الصورة" />
            </figure>
          </section>

          <section id="measurement-step-form" class="panel invoice-training-section" aria-labelledby="measurementFormTitle">
            <div class="section-title">
              <span class="icon-tile" aria-hidden="true">04</span>
              <div><h2 id="measurementFormTitle">ملئ النموذج</h2></div>
            </div>

            <div class="technician-assignment-flow" aria-label="خطوات اختيار وفتح نموذج رفع المقاسات">
              <article class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="أ — اختيار نوع نموذج رفع المقاسات"><span class="installation-substep-badge" aria-hidden="true">أ</span><span>— اختيار نوع نموذج رفع المقاسات</span></h3>
                <p class="field-explanation-intro">عند انتقال المهمة إلى مرحلة ملئ النموذج، يقوم الموظف أو الفني باختيار نوع نموذج رفع المقاسات المناسب من تبويب Task Forms داخل المهمة.</p>
                <figure class="odoo-screenshot-frame">
                  <img src="assest/رفع مقاسات/8.png" alt="اختيار نوع نموذج رفع المقاسات من تبويب Task Forms داخل المهمة" tabindex="0" role="button" aria-label="اضغط لتكبير صورة اختيار نوع نموذج رفع المقاسات" title="اضغط لتكبير الصورة" />
                </figure>
              </article>

              <span class="technician-assignment-transition" aria-hidden="true">↓</span>

              <article class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="ب — فتح نموذج رفع المقاسات"><span class="installation-substep-badge" aria-hidden="true">ب</span><span>— فتح نموذج رفع المقاسات</span></h3>
                <p class="field-explanation-intro">بعد اختيار نوع نموذج رفع المقاسات، يظهر النموذج المرتبط بالمهمة في الجزء العلوي، ويتم الضغط عليه لفتح النموذج والبدء بتعبئة بيانات رفع المقاسات.</p>
                <figure class="odoo-screenshot-frame">
                  <img src="assest/رفع مقاسات/9.png" alt="نموذج رفع المقاسات المرتبط بالمهمة ظاهر في الجزء العلوي لفتحه وتعبئة بياناته" tabindex="0" role="button" aria-label="اضغط لتكبير صورة فتح نموذج رفع المقاسات" title="اضغط لتكبير الصورة" />
                </figure>
              </article>

              <span class="technician-assignment-transition" aria-hidden="true">↓</span>

              <article class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="ج — بدء رفع المقاسات"><span class="installation-substep-badge" aria-hidden="true">ج</span><span>— بدء رفع المقاسات</span></h3>
                <p class="field-explanation-intro">بعد فتح نموذج رفع المقاسات، يراجع الفني بيانات العميل ومعلومات الزيارة، ثم يضغط على زر بدء رفع المقاسات (Start Measurement) لبدء تنفيذ الخدمة في موقع العميل.</p>
                <figure class="odoo-screenshot-frame">
                  <img src="assest/رفع مقاسات/10.png" alt="بدء رفع المقاسات بعد مراجعة بيانات العميل ومعلومات الزيارة" tabindex="0" role="button" aria-label="اضغط لتكبير صورة بدء رفع المقاسات" title="اضغط لتكبير الصورة" />
                </figure>
              </article>

              <span class="technician-assignment-transition" aria-hidden="true">↓</span>

              <article id="measurement-step-upload" class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="د — تسجيل الغرف والمقاسات"><span class="installation-substep-badge" aria-hidden="true">د</span><span>— تسجيل الغرف والمقاسات</span></h3>
                <p class="field-explanation-intro">أثناء تنفيذ الخدمة، يقوم الفني بإضافة الغرف التي تم رفع مقاساتها وتسجيل المقاسات الخاصة بكل غرفة داخل النموذج، مع إمكانية إرفاق الصور والملاحظات اللازمة.</p>
                <figure class="odoo-screenshot-frame">
                  <img src="assest/رفع مقاسات/12.png" alt="تسجيل الغرف والمقاسات وإرفاق الصور والملاحظات داخل نموذج رفع المقاسات" tabindex="0" role="button" aria-label="اضغط لتكبير صورة تسجيل الغرف والمقاسات" title="اضغط لتكبير الصورة" />
                </figure>
              </article>

              <span class="technician-assignment-transition" aria-hidden="true">↓</span>

              <article class="technician-assignment-step">
                <h3 class="installation-substep-heading" aria-label="هـ — اعتماد العميل واستلام الخدمة"><span class="installation-substep-badge" aria-hidden="true">هـ</span><span>— اعتماد العميل واستلام الخدمة</span></h3>
                <p class="field-explanation-intro">بعد الانتهاء من رفع المقاسات وتسجيل البيانات المطلوبة، يتم توثيق استلام العميل للخدمة واعتمادها من خلال توقيع العميل أو إرسال رمز التحقق (OTP) حسب الإجراء المعتمد.</p>
                <figure class="odoo-screenshot-frame">
                  <img src="assest/رفع مقاسات/11.png" alt="اعتماد العميل واستلام خدمة رفع المقاسات بالتوقيع أو رمز التحقق OTP" tabindex="0" role="button" aria-label="اضغط لتكبير صورة اعتماد العميل واستلام الخدمة" title="اضغط لتكبير الصورة" />
                </figure>
              </article>
            </div>
          </section>

          <section id="measurement-step-completed" class="panel invoice-training-section" aria-labelledby="measurementCompletedTitle">
            <div class="section-title">
              <span class="icon-tile" aria-hidden="true">06</span>
              <div><h2 id="measurementCompletedTitle">تمت الخدمة</h2></div>
            </div>
            <p class="field-explanation-intro">بعد الانتهاء من رفع المقاسات وتوثيق استلام العميل للخدمة، تنتقل المهمة إلى مرحلة تمت الخدمة، وبذلك تكتمل دورة خدمة رفع المقاسات.</p>
            <figure class="odoo-screenshot-frame">
              <img src="assest/رفع مقاسات/13.png" alt="اكتمال دورة خدمة رفع المقاسات وانتقال المهمة إلى مرحلة تمت الخدمة" tabindex="0" role="button" aria-label="اضغط لتكبير صورة مرحلة تمت الخدمة" title="اضغط لتكبير الصورة" />
            </figure>
          </section>
        </div>`;
      bindLearningMap(portal);
    } else if (service.id === "design") {
      portal.innerHTML = renderDesignWorkflow();
    } else if (service.id === "manufacturing") {
      portal.innerHTML = renderManufacturingWorkflow();
    } else if (service.id === "customer-service") {
      portal.innerHTML = renderCustomerServiceOverview(service);
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

    const customerServiceChapterRenderers = {
      "customer-service-sources": renderCustomerServiceSources,
      "customer-service-complaints": renderComplaintsWorkflow,
      "customer-service-maintenance": renderMaintenanceWorkflow,
      "customer-service-access-services": renderAccessServicesGuide,
      "customer-service-access-invoices": renderAccessInvoicesGuide,
    };
    if (customerServiceChapterRenderers[chapter.id]) {
      portal.innerHTML = customerServiceChapterRenderers[chapter.id]();
      document.title = `${chapter.title} | دليل خدمات ما بعد البيع`;
      return;
    }

    if (chapter.placeholderOnly) {
      portal.innerHTML = renderMinimalPlaceholderPage(`${chapter.number} — ${chapter.title}`, chapter.description);
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

  const match = getItem(route.itemId);
  if (match?.item.id === "internal-transfer") {
    portal.innerHTML = renderInternalTransferWorkflow();
    document.title = `${internalTransferTour.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "warehouse-pickup") {
    portal.innerHTML = renderWarehousePickupWorkflow();
    document.title = `${warehousePickupTour.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "internal-transfer-delivery-link") {
    portal.innerHTML = renderInternalTransferDeliveryLinkContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "installation-with-manufacturing") {
    portal.innerHTML = renderInstallationManufacturingLinkContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "manufacturing-with-measurement") {
    portal.innerHTML = renderManufacturingMeasurementLinkContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "manufacturing-with-design") {
    portal.innerHTML = renderManufacturingDesignLinkContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "manufacturing-with-delivery") {
    portal.innerHTML = renderManufacturingDeliveryLinkContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "manufacturing-with-installation") {
    portal.innerHTML = renderManufacturingInstallationLinkContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "composite-manufacturing-end-to-end") {
    portal.innerHTML = renderCompositeManufacturingContent();
    document.title = `${compositeManufacturingTour.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "installation-with-internal-transfer") {
    portal.innerHTML = renderInstallationInternalTransferLinkContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "installation-with-delivery") {
    portal.innerHTML = renderInstallationDeliveryLinkContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "sub-task-cycle") {
    portal.innerHTML = renderSubTaskCycleContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.id === "installation-partial") {
    portal.innerHTML = renderInstallationPartialContent();
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.experienceId === introductoryTour.id) {
    portal.hidden = true;
    portal.innerHTML = "";
    return;
  }

  if (match?.item.partialReturnService) {
    portal.innerHTML = renderPartialReturnContent(match.item.partialReturnService);
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
    return;
  }

  if (match?.item.placeholderOnly) {
    portal.innerHTML = renderMinimalPlaceholderPage(match.item.title, match.item.description);
    document.title = `${match.item.title} | دليل خدمات ما بعد البيع`;
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

function buildSidebarTree() {
  const generalEntry = {
    key: "general-entry",
    meta: "عام",
    title: "الدخول إلى نظام خدمات مابعد البيع",
    href: routeHref("chapter", "odoo-entry"),
  };

  const serviceNodes = services.map((service, serviceIndex) => {
    const chapterNodes = (service.chapterIds || [])
      .map((chapterId) => getChapter(chapterId))
      .filter((chapter) => chapter?.visible !== false)
      .map((chapter) => ({
        key: `chapter:${chapter.id}`,
        meta: chapter.number,
        title: chapter.title,
        href: routeHref("chapter", chapter.id),
        children: chapter.items
          .filter((item) => item.visible !== false)
          .map((item) => ({
            key: `item:${item.id}`,
            title: item.title,
            href: routeHref("lesson", item.id),
          })),
      }));
    const operationNodes = (service.operations || [])
      .filter((operation) => operation.visible !== false)
      .map((operation, operationIndex) => ({
        key: `operation:${operation.id}`,
        meta: `العملية ${String(operationIndex + 1).padStart(2, "0")}`,
        title: operation.title,
        href: routeHref("operation", operation.id),
      }));
    const contentNodes = [...chapterNodes, ...operationNodes];

    return {
      key: `service:${service.id}`,
      meta: `الخدمة ${String(serviceIndex + 1).padStart(2, "0")}`,
      title: service.title,
      href: routeHref("service", service.id),
      children: contentNodes.length
        ? [
            {
              key: `overview:${service.id}`,
              title: "نظرة عامة",
              href: routeHref("service", service.id),
            },
            ...contentNodes,
          ]
        : [],
    };
  });

  // Composite scenarios belong to no single service, so they sit at the end as their own top-level
  // branch rather than under one of the services they happen to pass through.
  const compositeChapter = getChapter("composite-workflows");
  const compositeNode = compositeChapter && {
    key: `chapter:${compositeChapter.id}`,
    meta: compositeChapter.number,
    title: compositeChapter.title,
    href: routeHref("chapter", compositeChapter.id),
    children: compositeChapter.items
      .filter((item) => item.visible !== false)
      .map((item) => ({ key: `item:${item.id}`, title: item.title, href: routeHref("lesson", item.id) })),
  };

  return [generalEntry, ...serviceNodes, ...(compositeNode ? [compositeNode] : [])];
}

function getCurrentSidebarNodeKey() {
  const route = navigationState.route;

  if (route.type === "chapter" && route.chapterId === "odoo-entry") return "general-entry";
  if (route.type === "service") {
    const service = getService(route.serviceId);
    const hasChildren = Boolean(service?.chapterIds?.length || service?.operations?.length);
    return `${hasChildren ? "overview" : "service"}:${route.serviceId}`;
  }
  if (route.type === "chapter") return `chapter:${route.chapterId}`;
  if (route.type === "lesson") return `item:${route.itemId}`;
  if (route.type === "operation") return `operation:${route.operationId}`;

  return null;
}

function getActiveSidebarBranchKeys() {
  const activeKeys = new Set();
  const route = navigationState.route;
  const activeService = getService(navigationState.activeServiceId);

  if (activeService?.chapterIds?.length || activeService?.operations?.length) {
    activeKeys.add(`service:${activeService.id}`);
  }

  const currentMatch = route.type === "lesson" ? getItem(route.itemId) : null;
  const currentChapter = route.type === "chapter" ? getChapter(route.chapterId) : currentMatch?.chapter;
  if (currentChapter?.id !== "odoo-entry" && currentChapter?.items.some((item) => item.visible !== false)) {
    activeKeys.add(`chapter:${currentChapter.id}`);
  }

  return activeKeys;
}

function sidebarBranchId(key) {
  return `toc-tree-${key.replace(/[^a-z0-9-]/gi, "-")}`;
}

function renderSidebarNodeCopy(node) {
  return `${node.meta ? `<span>${node.meta}</span>` : ""}<strong>${node.title}</strong>`;
}

function renderSidebarTreeNode(node, currentKey, activeBranchKeys, depth = 0) {
  const hasChildren = Boolean(node.children?.length);
  const isCurrent = currentKey === node.key;
  const isActiveBranch = activeBranchKeys.has(node.key);
  const currentClass = isCurrent ? "is-current" : "";
  const currentAttribute = isCurrent ? 'aria-current="page"' : "";

  if (!hasChildren) {
    return `
      <a class="toc-tree-link toc-tree-link--depth-${depth} ${currentClass}" data-tree-key="${node.key}" href="${node.href}" ${currentAttribute}>
        ${renderSidebarNodeCopy(node)}
      </a>`;
  }

  const isExpanded = isActiveBranch || sidebarManuallyExpandedBranches.has(node.key);
  const childrenId = sidebarBranchId(node.key);

  return `
    <div class="toc-tree-branch toc-tree-branch--depth-${depth} ${isExpanded ? "is-open" : ""}" data-tree-key="${node.key}">
      <div class="toc-tree-row toc-tree-row--depth-${depth} ${isActiveBranch ? "is-active-branch" : ""}">
        <a class="toc-tree-label ${currentClass}" href="${node.href}" ${currentAttribute}>
          ${renderSidebarNodeCopy(node)}
        </a>
        <button class="toc-tree-toggle" type="button" data-sidebar-tree-toggle="${node.key}" aria-expanded="${isExpanded}" aria-controls="${childrenId}" aria-label="توسيع أو طي ${node.title}">
          <span aria-hidden="true"></span>
        </button>
      </div>
      <div id="${childrenId}" class="toc-tree-children toc-tree-children--depth-${depth + 1}" ${isExpanded ? "" : "hidden"}>
        ${node.children.map((child) => renderSidebarTreeNode(child, currentKey, activeBranchKeys, depth + 1)).join("")}
      </div>
    </div>`;
}

function renderSidebar() {
  const sidebar = document.querySelector("#bookSidebar");
  const currentKey = getCurrentSidebarNodeKey();
  const activeBranchKeys = getActiveSidebarBranchKeys();
  const sidebarTree = buildSidebarTree();

  sidebar.innerHTML = `
    <button class="toc-drawer-close" type="button" aria-label="إغلاق قائمة الخدمات">×</button>
    <div class="toc-header">
      <span>نطاقات خدمات ما بعد البيع</span>
      <a href="${routeHref("home")}">دليل خدمات ما بعد البيع</a>
    </div>
    <nav class="toc-nav service-toc" aria-label="الخدمات والأبواب التدريبية">
      ${sidebarTree.map((node) => renderSidebarTreeNode(node, currentKey, activeBranchKeys)).join("")}
    </nav>`;
}

function renderWorkflowFlow(caseNode, options = {}) {
  const flowNodes = caseNode.children.filter((flowNode) => flowNode.visible !== false);
  // One active card, chosen by position: the first stage unless a target is given. Diagrams
  // without stage sections (no targetId) start with no active card.
  const hasStageTargets = flowNodes.some((flowNode) => flowNode.targetId);
  const activeIndex = options.activeTargetId
    ? flowNodes.findIndex((flowNode) => flowNode.targetId === options.activeTargetId)
    : hasStageTargets ? 0 : -1;
  const interactive = options.interactive !== false;
  const numberStart = options.numberStart ?? 1;

  return `
    <div class="workflow-flow" aria-label="جولة تعريفية" data-flow-tour="${caseNode.id}">
      ${flowNodes
        .map((flowNode, index) => {
          const isActive = index === activeIndex;
          // A card without a stage section of its own is shown but not clickable.
          const isInteractive = (interactive || flowNode.interactive === true) && Boolean(flowNode.targetId);
          const opensWorkflowOverlay = isInteractive && Boolean(flowNode.overlayId);
          const interactionAttributes = !isInteractive
            ? 'aria-disabled="true"'
            : opensWorkflowOverlay
              ? `data-workflow-overlay="${flowNode.overlayId}" data-workflow-target="${flowNode.targetId}"`
              : `data-stage-target="${flowNode.targetId}"`;
          const openableClass = opensWorkflowOverlay ? "workflow-flow-node--openable" : "";

          return `
            <button class="workflow-flow-node ${openableClass} ${isActive ? "active" : ""}" type="button" data-flow-index="${index}" ${interactionAttributes} ${isActive ? 'aria-current="step"' : ""}>
              <span class="workflow-flow-index">${String(index + numberStart).padStart(2, "0")}</span>
              <span>${flowNode.title}</span>
              ${opensWorkflowOverlay ? '<span class="workflow-flow-node-hint" aria-hidden="true">عرض دورة العمل ↗</span>' : ""}
            </button>
            ${index < flowNodes.length - 1 ? '<span class="workflow-flow-arrow" aria-hidden="true">←</span>' : ""}
          `;
        })
        .join("")}
    </div>
  `;
}

function bindLearningMap(container = document) {
  container.querySelectorAll("[data-stage-target]").forEach((button) => {
    if (button.dataset.stageBound) return;
    button.dataset.stageBound = "true";
    button.addEventListener("click", () => {
      if (workflowScrollSpy?.owns(button)) {
        workflowScrollSpy.focusStage(Number(button.dataset.flowIndex));
        return;
      }
      setActiveFlowCard(button);
      document.getElementById(button.dataset.stageTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// Marks one card of its workflow row as active. Cards are matched by position, so two cards that
// point at the same section never light up together.
function setActiveFlowCard(card) {
  const flow = card?.closest(".workflow-flow");
  if (!flow) return;
  flow.querySelectorAll("[data-flow-index]").forEach((candidate) => {
    const isActive = candidate === card;
    candidate.classList.toggle("active", isActive);
    if (isActive) candidate.setAttribute("aria-current", "step");
    else candidate.removeAttribute("aria-current");
  });
}

// Workflow pages that have top workflow cards and detailed stage sections, by route.
const ROUTE_WORKFLOW_TOURS = {
  "lesson:internal-transfer": internalTransferTour,
  "lesson:warehouse-pickup": warehousePickupTour,
  "lesson:sub-task-cycle": subTaskCycleTour,
  "lesson:installation-partial": installationPartialTour,
  "lesson:installation-with-delivery": installationWithDeliveryTour,
  "lesson:installation-with-internal-transfer": installationWithInternalTransferTour,
  "lesson:installation-with-manufacturing": installationWithManufacturingTour,
  "lesson:manufacturing-with-measurement": manufacturingWithMeasurementTour,
  "lesson:manufacturing-with-design": manufacturingWithDesignTour,
  "lesson:manufacturing-with-delivery": manufacturingWithDeliveryTour,
  "lesson:manufacturing-with-installation": manufacturingWithInstallationTour,
  "lesson:composite-manufacturing-end-to-end": compositeManufacturingTour,
  "service:measurement": measurementTour,
  "service:design": designTour,
  "service:manufacturing": manufacturingTour,
  [`chapter:${complaintsTour.id}`]: complaintsTour,
  [`chapter:${maintenanceTour.id}`]: maintenanceTour,
};

// Workflows the shared overlay can open (data-workflow-overlay="<key>").
const OVERLAY_WORKFLOW_TOURS = {
  "internal-transfer": internalTransferTour,
  manufacturing: manufacturingTour,
  "customer-delivery": introductoryTour,
};

function getRouteWorkflowTour(route = navigationState.route) {
  if (navigationState.selectedExperienceId === introductoryTour.id) return introductoryTour;
  if (isInstallationWorkflowRoute(route)) return deliveryInstallationTour;
  return ROUTE_WORKFLOW_TOURS[`${route.type}:${route.itemId || route.serviceId || route.chapterId || ""}`] || null;
}

function initRouteWorkflowScrollSpy({ applyStageLink = true } = {}) {
  const tour = getRouteWorkflowTour();
  if (!tour) {
    stopWorkflowScrollSpy();
    return;
  }
  initWorkflowScrollSpy(tour, { initialStage: applyStageLink ? navigationState.route.stage : null });
}

// Scroll-spy shared by all workflow pages: the top workflow cards follow the stage section being read.
// - The active stage is the last section whose top has passed a reading line at
//   WORKFLOW_READING_LINE of the scroll viewport (the window, or the overlay's scroll area).
// - At the very top the first card (usually 00) is active; at the bottom of the page the last
//   section in view wins, because a short final section never reaches the reading line.
// - Cards without a section of their own (e.g. a 00 card whose stage is the page header) are
//   active only at the top; when several cards share a section, the later card owns it.
// - A clicked card is pinned while the page scrolls to its section and stays pinned until the user
//   scrolls again, so a short section is not immediately replaced by the next one.
const WORKFLOW_READING_LINE = 0.3;
const WORKFLOW_SCROLL_SETTLE_MS = 200;
const WORKFLOW_SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);
let workflowScrollSpy = null;

function stopWorkflowScrollSpy() {
  workflowScrollSpy?.stop();
  workflowScrollSpy = null;
}

function initWorkflowScrollSpy(tour, { root = document, initialStage = null } = {}) {
  stopWorkflowScrollSpy();

  const nodes = tour.children.filter((node) => node.visible !== false);
  const flows = [...root.querySelectorAll(`.workflow-flow[data-flow-tour="${tour.id}"]`)];
  if (!flows.length) return;

  const stages = [];
  nodes.forEach((node, index) => {
    const section = node.targetId ? root.querySelector(`[id="${node.targetId}"]`) : null;
    if (!section) return;
    const shared = stages.find((stage) => stage.section === section);
    if (shared) shared.index = index;
    else stages.push({ index, section });
  });

  // Page workflows scroll with the window; an overlay passes its own scroll area as `root`.
  const container = root === document ? null : root;
  const scrollTarget = container || window;
  let current = -1;
  let pinned = null;
  let programmatic = false;
  let settleTimer = 0;
  let frame = 0;

  const viewport = () => {
    if (!container) {
      const scrollElement = document.scrollingElement || document.documentElement;
      return { top: 0, height: window.innerHeight, scrollTop: window.scrollY, maxScroll: scrollElement.scrollHeight - window.innerHeight };
    }
    return {
      top: container.getBoundingClientRect().top,
      height: container.clientHeight,
      scrollTop: container.scrollTop,
      maxScroll: container.scrollHeight - container.clientHeight,
    };
  };

  const readStageIndex = () => {
    const view = viewport();
    if (view.scrollTop <= 1) return 0;
    const line = view.top + view.height * WORKFLOW_READING_LINE;
    const bottom = view.top + view.height;
    const atEnd = view.maxScroll - view.scrollTop <= 2;
    let active = 0;
    let activeTop = -Infinity;
    for (const stage of stages) {
      if (!stage.section.getClientRects().length) continue;
      const top = stage.section.getBoundingClientRect().top;
      if ((top <= line || (atEnd && top < bottom)) && top >= activeTop) {
        active = stage.index;
        activeTop = top;
      }
    }
    return active;
  };

  const show = (index) => {
    if (index === current) return;
    current = index;
    flows.forEach((flow) => setActiveFlowCard(flow.querySelector(`[data-flow-index="${index}"]`)));
  };

  const update = () => {
    frame = 0;
    if (pinned === null) show(readStageIndex());
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const settleSoon = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      programmatic = false;
    }, WORKFLOW_SCROLL_SETTLE_MS);
  };
  const onScroll = () => {
    if (programmatic) {
      settleSoon();
      return;
    }
    pinned = null;
    schedule();
  };
  // The user takes over (wheel, touch, scrolling keys) even in the middle of a card-triggered scroll.
  const onUserScrollIntent = (event) => {
    if (event.type === "keydown" && !WORKFLOW_SCROLL_KEYS.has(event.key)) return;
    if (!programmatic && pinned === null) return;
    programmatic = false;
    pinned = null;
    schedule();
  };

  const focusStage = (index, { smooth = true } = {}) => {
    const section = root.querySelector(`[id="${nodes[index]?.targetId}"]`);
    show(index);
    pinned = index;
    if (!section) return;
    programmatic = true;
    settleSoon();
    section.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  };

  scrollTarget.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("wheel", onUserScrollIntent, { passive: true });
  window.addEventListener("touchstart", onUserScrollIntent, { passive: true });
  window.addEventListener("keydown", onUserScrollIntent);

  workflowScrollSpy = {
    owns: (button) => flows.some((flow) => flow.contains(button)),
    focusStage,
    stop() {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", onUserScrollIntent);
      window.removeEventListener("touchstart", onUserScrollIntent);
      window.removeEventListener("keydown", onUserScrollIntent);
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
    },
  };

  const linkedIndex = initialStage ? nodes.findIndex((node) => node.id === initialStage || node.targetId === initialStage) : -1;
  if (linkedIndex >= 0) {
    // After the route change has reset the scroll position.
    requestAnimationFrame(() => {
      if (workflowScrollSpy?.focusStage === focusStage) focusStage(linkedIndex, { smooth: false });
    });
  } else {
    show(readStageIndex());
  }
}

function renderWorkflowVisibility() {
  const workflowContent = document.querySelector("#workflowContent");
  const workflowOnlyItems = document.querySelectorAll(".workflow-only");
  const pageAssistant = document.querySelector("#pageAssistant");
  const deliveryInstallationPlaceholder = document.querySelector("#deliveryInstallationPlaceholder");
  const deliveryInstallationWorkflow = document.querySelector("#deliveryInstallationWorkflow");
  const shouldShowWorkflow = navigationState.selectedExperienceId === introductoryTour.id;
  const shouldShowDeliveryInstallation = navigationState.selectedExperienceId === deliveryInstallationTour.id;

  workflowContent.hidden = !shouldShowWorkflow;
  deliveryInstallationPlaceholder.hidden = !shouldShowDeliveryInstallation;
  workflowOnlyItems.forEach((item) => {
    item.hidden = true;
  });

  if (pageAssistant) {
    pageAssistant.hidden = false;
    renderAssistantScope(pageAssistant);
  }

  if (shouldShowWorkflow) {
    workflowContent.querySelector(".workflow-flow")?.remove();
    workflowContent.insertAdjacentHTML("afterbegin", renderWorkflowFlow(introductoryTour, { numberStart: 0 }));
    bindLearningMap(workflowContent);
  }

  if (shouldShowDeliveryInstallation) {
    deliveryInstallationWorkflow.innerHTML = renderWorkflowFlow(deliveryInstallationTour, { numberStart: 0 });
    bindLearningMap(deliveryInstallationWorkflow);
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
  renderWorkflowVisibility();

  bindLearningMap(document.querySelector("#bookPortal"));
  initRouteWorkflowScrollSpy();

  if (navigationState.selectedExperienceId === introductoryTour.id) {
    document.title = "التوصيل إلى العميل | دليل خدمات ما بعد البيع";
  } else if (navigationState.selectedExperienceId === deliveryInstallationTour.id) {
    document.title = "تركيب كامل | دليل خدمات ما بعد البيع";
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
    const treeToggle = event.target.closest("[data-sidebar-tree-toggle]");
    if (treeToggle) {
      const branchKey = treeToggle.dataset.sidebarTreeToggle;
      const children = document.getElementById(treeToggle.getAttribute("aria-controls"));
      const branch = treeToggle.closest(".toc-tree-branch");
      const isExpanded = treeToggle.getAttribute("aria-expanded") === "true";
      const willExpand = !isExpanded;

      treeToggle.setAttribute("aria-expanded", String(willExpand));
      branch?.classList.toggle("is-open", willExpand);
      if (children) children.hidden = !willExpand;

      if (willExpand) {
        sidebarManuallyExpandedBranches.add(branchKey);
      } else {
        sidebarManuallyExpandedBranches.delete(branchKey);
      }
      return;
    }

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

function initWorkflowOverlay() {
  const overlay = document.querySelector("#workflowOverlay");
  const content = overlay?.querySelector("#workflowOverlayContent");
  const title = overlay?.querySelector("#workflowOverlayTitle");
  const closeButton = overlay?.querySelector(".workflow-overlay-close");
  const appShell = document.querySelector(".app-shell");
  const pageAssistant = document.querySelector("#pageAssistant");

  if (!overlay || !content || !title || !closeButton || !appShell) {
    return;
  }

  let lastFocusedElement = null;
  let deliveryWorkflowRestoreMarker = null;
  let activeDeliveryWorkflow = null;
  let pageScrollY = 0;

  function restoreDeliveryWorkflow() {
    if (!activeDeliveryWorkflow || !deliveryWorkflowRestoreMarker?.parentNode) {
      return;
    }

    activeDeliveryWorkflow.hidden = true;
    deliveryWorkflowRestoreMarker.replaceWith(activeDeliveryWorkflow);
    activeDeliveryWorkflow = null;
    deliveryWorkflowRestoreMarker = null;
  }

  function closeWorkflowOverlay() {
    if (overlay.hidden) {
      return;
    }

    restoreDeliveryWorkflow();
    content.replaceChildren();
    overlay.hidden = true;
    document.body.classList.remove("workflow-overlay-open");
    appShell.inert = false;

    if (pageAssistant) {
      pageAssistant.inert = false;
    }

    stopWorkflowScrollSpy();
    window.scrollTo({ top: pageScrollY, behavior: "auto" });
    initRouteWorkflowScrollSpy({ applyStageLink: false });
    lastFocusedElement?.focus?.({ preventScroll: true });
  }

  function openWorkflowOverlay(workflowId, { initialStage = null } = {}) {
    lastFocusedElement = document.activeElement;
    pageScrollY = window.scrollY;
    content.replaceChildren();

    if (workflowId === "internal-transfer") {
      title.textContent = internalTransferTour.title;
      content.innerHTML = renderInternalTransferWorkflow();
    } else if (workflowId === "manufacturing") {
      title.textContent = manufacturingTour.title;
      content.innerHTML = renderManufacturingWorkflow();
    } else if (workflowId === "customer-delivery") {
      const workflowContent = document.querySelector("#workflowContent");

      if (!workflowContent) {
        return;
      }

      title.textContent = introductoryTour.title;
      deliveryWorkflowRestoreMarker = document.createComment("delivery-workflow-restore");
      workflowContent.parentNode.insertBefore(deliveryWorkflowRestoreMarker, workflowContent);
      workflowContent.querySelector(".workflow-flow")?.remove();
      workflowContent.insertAdjacentHTML("afterbegin", renderWorkflowFlow(introductoryTour, { numberStart: 0 }));
      workflowContent.hidden = false;
      activeDeliveryWorkflow = workflowContent;
      content.append(workflowContent);
    } else {
      return;
    }

    overlay.hidden = false;
    // Each workflow opens at its first stage, not at the previous overlay's scroll position (set only
    // once the overlay is visible: a hidden element ignores scrollTop).
    content.scrollTop = 0;
    document.body.classList.add("workflow-overlay-open");
    appShell.inert = true;

    if (pageAssistant) {
      pageAssistant.inert = true;
    }

    bindLearningMap(content);
    initWorkflowScrollSpy(OVERLAY_WORKFLOW_TOURS[workflowId], { root: content, initialStage });
    closeButton.focus({ preventScroll: true });
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("[data-workflow-overlay]");

    if (!trigger) {
      return;
    }

    event.preventDefault();
    if (trigger.dataset.workflowTarget) {
      setActiveFlowCard(trigger);
    }
    openWorkflowOverlay(trigger.dataset.workflowOverlay, { initialStage: trigger.dataset.workflowOverlayStage || null });
  });

  closeButton.addEventListener("click", closeWorkflowOverlay);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeWorkflowOverlay();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden && !event.target.closest?.("#imageLightbox")) {
      closeWorkflowOverlay();
    }
  });
}

// ---------------------------------------------------------------- Assistant answer entities
// Services, workflows and stages an answer mentions become links into this site. Every destination
// is an existing hash route (see parseRoute) or an existing overlay key (OVERLAY_WORKFLOW_TOURS) —
// no route is invented here. Adding a service or a workflow means one entry in the two lists below;
// stages are read from the workflow tours themselves, so a new stage needs no change here.
const ASSISTANT_SERVICE_ENTITIES = [
  {
    id: "service:delivery",
    type: "service",
    title: "خدمة التوصيل",
    actionLabel: "فتح خدمة التوصيل",
    href: routeHref("service", "delivery"),
    workflowId: "workflow:customer-delivery",
    aliases: ["خدمة التوصيل", "خدمة التوصيل إلى العميل", "التوصيل إلى العميل"],
  },
  {
    id: "service:installation",
    type: "service",
    title: "خدمة التركيب",
    actionLabel: "فتح خدمة التركيب",
    href: routeHref("service", "installation"),
    workflowId: "workflow:installation-full",
    aliases: ["خدمة التركيب"],
  },
  {
    id: "service:measurement",
    type: "service",
    title: "خدمة رفع المقاسات",
    actionLabel: "فتح خدمة رفع المقاسات",
    href: routeHref("service", "measurement"),
    workflowId: "workflow:measurement",
    aliases: ["خدمة رفع المقاسات", "خدمة رفع القياسات", "رفع المقاسات"],
  },
  {
    id: "service:design",
    type: "service",
    title: "خدمة التصميم",
    actionLabel: "فتح خدمة التصميم",
    href: routeHref("service", "design"),
    workflowId: "workflow:design",
    aliases: ["خدمة التصميم"],
  },
  {
    id: "service:manufacturing",
    type: "service",
    title: "خدمة التصنيع",
    actionLabel: "فتح خدمة التصنيع",
    href: routeHref("service", "manufacturing"),
    workflowId: "workflow:manufacturing",
    aliases: ["خدمة التصنيع"],
  },
  {
    id: "service:customer-service",
    type: "service",
    title: "خدمة العملاء",
    actionLabel: "فتح خدمة العملاء",
    href: routeHref("service", "customer-service"),
    aliases: ["خدمة العملاء"],
  },
  {
    id: "service:maintenance",
    type: "service",
    title: "خدمة الصيانة",
    actionLabel: "فتح خدمة الصيانة",
    href: routeHref("chapter", "customer-service-maintenance"),
    workflowId: "workflow:maintenance",
    aliases: ["خدمة الصيانة", "الصيانة الميدانية"],
  },
  {
    id: "service:complaints",
    type: "service",
    title: "الشكاوى والاستفسارات",
    actionLabel: "فتح الشكاوى والاستفسارات",
    href: routeHref("chapter", "customer-service-complaints"),
    workflowId: "workflow:complaints",
    aliases: ["الشكاوى / الاستفسارات", "الشكاوى والاستفسارات", "خدمة الشكاوى"],
  },
  {
    id: "service:internal-transfer",
    type: "service",
    title: "التحويلات الداخلية",
    actionLabel: "فتح التحويلات الداخلية",
    href: routeHref("lesson", "internal-transfer"),
    workflowId: "workflow:internal-transfer",
    aliases: ["خدمة التحويلات الداخلية", "التحويلات الداخلية", "التحويل الداخلي"],
  },
  {
    id: "service:warehouse-pickup",
    type: "service",
    title: "استلام العميل البضاعة من المستودع",
    actionLabel: "فتح خدمة الاستلام من المستودع",
    href: routeHref("lesson", "warehouse-pickup"),
    workflowId: "workflow:warehouse-pickup",
    aliases: [
      "خدمة استلام العميل البضاعة من المستودع",
      "استلام العميل البضاعة من المستودع",
      "خدمة الاستلام من المستودع",
      "الاستلام من المستودع",
    ],
  },
];

// `overlayId` is set only where the shared workflow overlay already knows the workflow.
const ASSISTANT_WORKFLOW_ENTITIES = [
  {
    id: "workflow:customer-delivery",
    type: "workflow",
    title: "دورة التوصيل",
    actionLabel: "عرض دورة التوصيل",
    href: routeHref("lesson", "customer-delivery"),
    overlayId: "customer-delivery",
    tour: introductoryTour,
    serviceId: "service:delivery",
    aliases: ["دورة عمل خدمة التوصيل", "دورة خدمة التوصيل", "دورة عمل التوصيل", "دورة التوصيل"],
  },
  {
    id: "workflow:installation-full",
    type: "workflow",
    title: "تركيب كامل",
    actionLabel: "فتح تركيب كامل",
    href: routeHref("lesson", "installation-full"),
    tour: deliveryInstallationTour,
    serviceId: "service:installation",
    aliases: ["تركيب كامل", "دورة عمل خدمة توصيل مع تركيب", "توصيل مع تركيب"],
  },
  {
    id: "workflow:installation-partial",
    type: "workflow",
    title: "تركيب جزئي",
    actionLabel: "فتح تركيب جزئي",
    href: routeHref("lesson", "installation-partial"),
    tour: installationPartialTour,
    serviceId: "service:installation",
    aliases: ["تركيب جزئي", "التركيب الجزئي", "مهمة فرعية للتركيب", "Sub Task تركيب"],
  },
  {
    id: "workflow:installation-with-delivery",
    type: "workflow",
    title: "تركيب مع توصيل",
    actionLabel: "فتح تركيب مع توصيل",
    href: routeHref("lesson", "installation-with-delivery"),
    tour: installationWithDeliveryTour,
    serviceId: "service:installation",
    aliases: ["تركيب مع توصيل"],
  },
  {
    id: "workflow:installation-with-internal-transfer",
    type: "workflow",
    title: "تركيب مع التحويلات الداخلية",
    actionLabel: "فتح تركيب مع التحويلات الداخلية",
    href: routeHref("lesson", "installation-with-internal-transfer"),
    tour: installationWithInternalTransferTour,
    serviceId: "service:installation",
    aliases: ["تركيب مع التحويلات الداخلية"],
  },
  {
    id: "workflow:installation-with-manufacturing",
    type: "workflow",
    title: "تركيب مع تصنيع",
    actionLabel: "فتح تركيب مع تصنيع",
    href: routeHref("lesson", "installation-with-manufacturing"),
    tour: installationWithManufacturingTour,
    serviceId: "service:installation",
    aliases: ["تركيب مع تصنيع"],
  },
  {
    id: "workflow:internal-transfer",
    type: "workflow",
    title: "دورة التحويلات الداخلية",
    actionLabel: "عرض دورة التحويلات الداخلية",
    href: routeHref("lesson", "internal-transfer"),
    overlayId: "internal-transfer",
    tour: internalTransferTour,
    serviceId: "service:internal-transfer",
    aliases: ["دورة عمل التحويلات الداخلية", "دورة التحويلات الداخلية"],
  },
  {
    id: "workflow:warehouse-pickup",
    type: "workflow",
    title: "دورة الاستلام من المستودع",
    actionLabel: "عرض دورة الاستلام من المستودع",
    href: routeHref("lesson", "warehouse-pickup"),
    tour: warehousePickupTour,
    serviceId: "service:warehouse-pickup",
    aliases: ["دورة الاستلام من المستودع", "دورة استلام العميل البضاعة من المستودع"],
  },
  {
    id: "workflow:sub-task-cycle",
    type: "workflow",
    title: "دورة التوصيل الجزئي للعميل",
    actionLabel: "فتح دورة التوصيل الجزئي للعميل",
    href: routeHref("lesson", "sub-task-cycle"),
    tour: subTaskCycleTour,
    serviceId: "service:delivery",
    aliases: ["دورة التوصيل الجزئي للعميل", "التوصيل الجزئي للعميل"],
  },
  {
    id: "workflow:measurement",
    type: "workflow",
    title: "دورة رفع المقاسات",
    actionLabel: "عرض دورة رفع المقاسات",
    href: routeHref("service", "measurement"),
    tour: measurementTour,
    serviceId: "service:measurement",
    aliases: ["دورة عمل خدمة رفع المقاسات", "دورة رفع المقاسات", "دورة رفع القياسات"],
  },
  {
    id: "workflow:design",
    type: "workflow",
    title: "دورة التصميم",
    actionLabel: "عرض دورة التصميم",
    href: routeHref("service", "design"),
    tour: designTour,
    serviceId: "service:design",
    aliases: ["دورة عمل خدمة التصميم", "دورة التصميم"],
  },
  {
    id: "workflow:manufacturing",
    type: "workflow",
    title: "دورة التصنيع",
    actionLabel: "عرض دورة التصنيع",
    href: routeHref("service", "manufacturing"),
    overlayId: "manufacturing",
    tour: manufacturingTour,
    serviceId: "service:manufacturing",
    aliases: ["دورة عمل خدمة التصنيع", "دورة التصنيع"],
  },
  {
    id: "workflow:complaints",
    type: "workflow",
    title: "دورة الشكاوى",
    actionLabel: "عرض دورة الشكاوى",
    href: routeHref("chapter", "customer-service-complaints"),
    tour: complaintsTour,
    serviceId: "service:complaints",
    aliases: ["دورة الشكاوى", "دورة الشكاوى والاستفسارات"],
  },
  {
    id: "workflow:maintenance",
    type: "workflow",
    title: "دورة الصيانة",
    actionLabel: "عرض دورة الصيانة",
    href: routeHref("chapter", "customer-service-maintenance"),
    tour: maintenanceTour,
    serviceId: "service:maintenance",
    aliases: ["دورة عمل خدمة الصيانة", "دورة الصيانة"],
  },
];

// One entity per stage of every registered workflow. The stage id is the third route segment that
// parseRoute already understands (#/lesson/customer-delivery/driver-linking) and that the workflow
// scroll-spy uses to open the page on that stage.
function buildAssistantStageEntities() {
  return ASSISTANT_WORKFLOW_ENTITIES.flatMap((workflow) =>
    workflow.tour.children
      .filter((node) => node.visible !== false && node.targetId)
      .map((node) => ({
        id: `stage:${workflow.tour.id}:${node.id}`,
        type: "stage",
        title: node.title,
        actionLabel: `الانتقال إلى مرحلة ${node.title}`,
        href: `${workflow.href}/${encodeURIComponent(node.id)}`,
        workflow,
        stageId: node.id,
        aliases: [node.title],
      })),
  );
}

// Aliases longest first, so "خدمة التوصيل إلى العميل" wins over "خدمة التوصيل" at the same position.
// One alias can belong to several stages (every cycle starts with "فاتورة من SAP"); the open page
// and the question decide which one is meant — see resolveAssistantEntity.
function buildAssistantEntityIndex() {
  const entities = [...ASSISTANT_SERVICE_ENTITIES, ...ASSISTANT_WORKFLOW_ENTITIES, ...buildAssistantStageEntities()];
  const byAlias = new Map();

  for (const entity of entities) {
    for (const alias of entity.aliases) {
      const key = normalizeAssistantText(alias);
      if (!key) continue;
      if (!byAlias.has(key)) byAlias.set(key, []);
      byAlias.get(key).push(entity);
    }
  }

  return {
    byId: new Map(entities.map((entity) => [entity.id, entity])),
    aliases: [...byAlias.entries()]
      .map(([alias, matches]) => ({ alias, matches }))
      .sort((a, b) => b.alias.length - a.alias.length),
  };
}

const ARABIC_LETTER = /[ء-يٮ-ۓ]/u;
// Letters Arabic glues to the front of a word (ال، بـ، لـ، وـ، فـ، كـ), so "بخدمة التوصيل" matches too.
const ARABIC_CLITIC_RUN = /^[البوفك]+$/u;
const ARABIC_MARK = /[ً-ٰٟـ]/u;

function foldAssistantCharacter(character) {
  if ("أإآٱ".includes(character)) return "ا";
  if (character === "ى") return "ي";
  if (character === "ة") return "ه";
  return character.toLowerCase();
}

function normalizeAssistantText(value) {
  return normalizeAssistantWithIndex(value).text;
}

// Folds the text for matching and keeps, for every folded character, the index it came from — so a
// match found on the folded text can be cut out of the original string exactly.
function normalizeAssistantWithIndex(value) {
  const source = String(value || "");
  const map = [];
  let text = "";
  let previousWasSpace = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (ARABIC_MARK.test(character)) continue;

    if (/\s/u.test(character)) {
      if (previousWasSpace || !text) continue;
      previousWasSpace = true;
      text += " ";
      map.push(index);
      continue;
    }

    previousWasSpace = false;
    text += foldAssistantCharacter(character);
    map.push(index);
  }

  map.push(source.length);
  return { text, map };
}

const ASSISTANT_ENTITY_INDEX = buildAssistantEntityIndex();

function hasAssistantWordBoundary(text, start, end) {
  const after = text[end] || "";
  if (after && (ARABIC_LETTER.test(after) || /[a-z0-9]/u.test(after))) return false;

  const before = text[start - 1] || "";
  if (!before) return true;
  if (/[a-z0-9]/u.test(before)) return false;
  if (!ARABIC_LETTER.test(before)) return true;

  let cursor = start - 1;
  let run = "";
  while (cursor >= 0 && ARABIC_LETTER.test(text[cursor])) {
    run = text[cursor] + run;
    cursor -= 1;
  }
  return run.length <= 2 && ARABIC_CLITIC_RUN.test(run);
}

// Non-overlapping entity mentions, in the order they appear in `value`.
function findAssistantEntities(value, context = {}) {
  const { text, map } = normalizeAssistantWithIndex(value);
  if (!text) return [];

  const candidates = [];
  for (const { alias, matches } of ASSISTANT_ENTITY_INDEX.aliases) {
    let from = text.indexOf(alias);
    while (from !== -1) {
      const to = from + alias.length;
      if (hasAssistantWordBoundary(text, from, to)) candidates.push({ from, to, matches });
      from = text.indexOf(alias, from + 1);
    }
  }

  candidates.sort((a, b) => a.from - b.from || b.to - a.to);

  const found = [];
  let cursor = -1;
  for (const candidate of candidates) {
    if (candidate.from < cursor) continue;

    const matches = allowedAssistantMatches(candidate.matches, context);
    if (!matches.length) continue;

    cursor = candidate.to;
    found.push({
      entity: resolveAssistantEntity(matches, context),
      start: map[candidate.from],
      end: map[candidate.to],
    });
  }

  return found;
}

// A stage is linked only when its workflow is in scope. Short stage titles such as "جدولة موعد"
// otherwise match inside a sentence about another service and would link to the wrong page.
function allowedAssistantMatches(matches, context) {
  if (!context.scopedWorkflowIds) return matches;
  return matches.filter((entity) => entity.type !== "stage" || context.scopedWorkflowIds.has(entity.workflow.id));
}

// A stage title shared by several workflows belongs to the workflow the reader is in: the open
// page's workflow first, then a workflow or service the question/answer named, then list order.
function resolveAssistantEntity(matches, context) {
  if (matches.length === 1) return matches[0];

  const preferences = [
    (entity) => entity.type === "stage" && context.tourId && entity.workflow.tour.id === context.tourId,
    (entity) => entity.type === "stage" && context.workflowIds?.has(entity.workflow.id),
    (entity) => entity.type === "stage" && context.serviceIds?.has(entity.workflow.serviceId),
  ];

  for (const preference of preferences) {
    const match = matches.find(preference);
    if (match) return match;
  }

  return matches[0];
}

// Which workflow/service the question and the answer are about, used to disambiguate stage titles.
function buildAssistantEntityContext(question, answerText) {
  const context = { tourId: getRouteWorkflowTour()?.id || null, workflowIds: new Set(), serviceIds: new Set() };

  for (const { entity } of findAssistantEntities(`${question}\n${answerText}`, context)) {
    if (entity.type === "workflow") {
      context.workflowIds.add(entity.id);
      if (entity.serviceId) context.serviceIds.add(entity.serviceId);
    }
    if (entity.type === "service") {
      context.serviceIds.add(entity.id);
      if (entity.workflowId) context.workflowIds.add(entity.workflowId);
    }
  }

  // In scope: the workflow of the open page, the workflows of the services and workflows the answer
  // named, and the workflow of any stage the reader asked about.
  const scoped = new Set(context.workflowIds);
  for (const workflow of ASSISTANT_WORKFLOW_ENTITIES) {
    if (context.tourId === workflow.tour.id) scoped.add(workflow.id);
    if (context.serviceIds.has(workflow.serviceId)) scoped.add(workflow.id);
  }
  for (const { entity } of findAssistantEntities(question, context)) {
    if (entity.type === "stage") scoped.add(entity.workflow.id);
  }

  context.scopedWorkflowIds = scoped;
  return context;
}

// ---------------------------------------------------------------- Assistant answer model
// A plain answer becomes { title, blocks, relatedLinks, referencedEntities } so the panel can lay it
// out instead of printing one block of text.
const ASSISTANT_FALLBACK_ANSWERS = [
  "المعلومة غير متوفرة ضمن هذه الصفحة",
  "المعلومة غير موثقة ضمن مسارات خدمات ما بعد البيع الحالية",
];
const ASSISTANT_GROUNDING_INTRO =
  /^\s*(وفقًا للمعلومات المتاحة في الصفحة|وفقًا للمعلومات المتاحة|حسب المعلومات المتاحة|حسب المعلومات المتوفرة|بناءً على المعلومات المتاحة)\s*[:：،.-]?\s*/i;
// A workflow sequence is recognised by its numbered stages, not by whatever an answer puts between
// them: "00 — فاتورة من SAP → 01 — طلب توصيل → …", the same stages one per line, and the same stages
// joined by "ثم" or by commas are one sequence written three ways, and all three become stage cards.
// Three steps or more, so an ordinary sentence that happens to contain a number is never mistaken
// for a workflow sequence.
const ASSISTANT_STEP_MARKER = /(^|[\s([،,;؛:.—–>»→←])(\d{1,2})\s*[—–-]\s+/gu;
const ASSISTANT_SEQUENCE_STEP = /^\s*(\d{1,2})\s*[—–-]\s*([\s\S]*)$/u;
// Whatever is left between the end of one stage title and the next stage number.
const ASSISTANT_STEP_SEPARATOR = /[\s.,،؛;]*(?:→|←|⟵|⟶|»|«|>|ثم|بعدها|بعد\s+ذلك)?[\s.,،؛;]*$/u;
const ASSISTANT_SEQUENCE_MIN_STEPS = 3;
// How much of a sequence a tour has to cover before its stages are linked to that workflow.
const ASSISTANT_SEQUENCE_MATCH_RATIO = 0.7;
const ASSISTANT_MAX_RELATED_LINKS = 6;
// An answer that enumerates every service and stage would otherwise turn into a wall of links; the
// entities past this point still appear under "روابط ذات صلة".
const ASSISTANT_MAX_INLINE_LINKS = 10;
const ASSISTANT_STAGE_LIST_MAX_LENGTH = 54;

function isAssistantFallbackAnswer(text) {
  const normalized = normalizeAssistantText(text).replace(/[.\s]+$/u, "");
  return ASSISTANT_FALLBACK_ANSWERS.some((fallback) => normalized === normalizeAssistantText(fallback));
}

function stripAssistantGroundingIntro(text) {
  return String(text || "").replace(ASSISTANT_GROUNDING_INTRO, "").trim();
}

function buildAssistantAnswerModel(rawAnswer, question) {
  const answer = stripAssistantGroundingIntro(rawAnswer);

  if (!answer || isAssistantFallbackAnswer(answer)) {
    return { title: "", blocks: [{ kind: "paragraph", text: answer }], relatedLinks: [], referencedEntities: [], context: null, isPlain: true };
  }

  const context = buildAssistantEntityContext(question, answer);
  const blocks = dedupeAssistantStageBlocks(buildAssistantBlocks(answer, context));
  const heading = blocks[0]?.kind === "heading" ? blocks.shift().text : "";
  const questionEntities = findAssistantEntities(question, context);
  const referencedEntities = [...collectAssistantSequenceEntities(blocks, context), ...collectAssistantEntities(blocks, context)];

  return {
    title: heading || questionEntities[0]?.entity.title || "",
    blocks,
    relatedLinks: buildAssistantRelatedLinks(questionEntities, referencedEntities),
    referencedEntities,
    context,
    isPlain: false,
  };
}

function buildAssistantBlocks(answer, context) {
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(...splitAssistantSequence(paragraph.join(" ")));
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push(toAssistantListBlock(list, context));
    list = null;
  };

  for (const rawLine of String(answer).split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.+)$/u);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", text: heading[1].trim() });
      continue;
    }

    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/u);
    if (bullet) {
      flushParagraph();
      list = list || [];
      list.push(bullet[1].trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

// Every "NN — " that opens a stage, in the order they appear. The number is what marks a step, so
// the scan is blind to the punctuation the answer used to join the stages together — which is what
// lets one parser handle an arrow sequence, a comma sequence and one stage per line alike.
function scanAssistantStageSteps(text) {
  const pattern = new RegExp(ASSISTANT_STEP_MARKER.source, "gu");
  const markers = [];
  let match = pattern.exec(text);

  while (match) {
    markers.push({ number: match[2], start: match.index + match[1].length, titleStart: match.index + match[0].length });
    pattern.lastIndex = match.index + match[0].length;
    match = pattern.exec(text);
  }

  return markers;
}

// A stage sequence written inline becomes its own block, keeping the sentence before it and the
// sentence after it as ordinary text. A stage title runs up to the next stage number.
function splitAssistantSequence(text) {
  const markers = scanAssistantStageSteps(text);
  if (markers.length < ASSISTANT_SEQUENCE_MIN_STEPS) return text ? [{ kind: "paragraph", text }] : [];

  // Whatever the answer goes on to say after the last stage belongs to the text, not to its title.
  const lastMarker = markers[markers.length - 1];
  const sentenceEnd = text.slice(lastMarker.titleStart).search(/[.؟!]/u);
  const runEnd = sentenceEnd > -1 ? lastMarker.titleStart + sentenceEnd : text.length;

  const stages = markers.map((marker, index) => {
    const next = markers[index + 1];
    const title = text.slice(marker.titleStart, next ? next.start : runEnd).replace(ASSISTANT_STEP_SEPARATOR, "").trim();
    return { number: marker.number.padStart(2, "0"), title };
  });

  // A "stage title" the length of a sentence means these numbers were never a stage sequence.
  if (stages.some((stage) => !stage.title || stage.title.length > ASSISTANT_STAGE_LIST_MAX_LENGTH)) {
    return [{ kind: "paragraph", text }];
  }

  const lead = text.slice(0, markers[0].start).trim();
  const tail = text.slice(runEnd).replace(/^[\s.؟!]+/u, "").trim();

  return [
    lead ? { kind: "paragraph", text: lead } : null,
    { kind: "stages", stages },
    tail ? { kind: "paragraph", text: tail } : null,
  ].filter(Boolean);
}

// A short list of stage names is shown as stage cards; anything longer stays a list, because
// turning a full sentence into a card would hide the explanation. An item numbered like a stage
// ("00 — فاتورة من SAP") is enough on its own; otherwise the item has to be a stage title in full.
function toAssistantListBlock(items, context) {
  const stages = items.map((item) => {
    const plain = item.replace(/\*\*/gu, "").trim();

    // A numbered item is a stage by construction, so the length limit applies to its title alone.
    const step = plain.match(ASSISTANT_SEQUENCE_STEP);
    if (step) {
      const title = step[2].trim();
      return title && title.length <= ASSISTANT_STAGE_LIST_MAX_LENGTH ? { number: step[1].padStart(2, "0"), title } : null;
    }

    if (plain.length > ASSISTANT_STAGE_LIST_MAX_LENGTH) return null;

    const found = findAssistantEntities(plain, context)[0];
    const coversWholeItem = found?.entity.type === "stage" && found.end - found.start >= plain.length - 2;
    return coversWholeItem ? { number: "", title: plain } : null;
  });

  return stages.length >= 2 && stages.every(Boolean) ? { kind: "stages", stages } : { kind: "list", items };
}

// An answer that states its sequence twice — once as a sentence and once as a list — is still one
// sequence. The first set of cards stays and any later block that repeats those same stages, or a
// subset of them, is dropped rather than drawn a second time.
function dedupeAssistantStageBlocks(blocks) {
  const rendered = [];

  return blocks.filter((block) => {
    if (block.kind !== "stages") return true;

    const titles = block.stages.map((stage) => normalizeAssistantText(stage.title));
    if (rendered.some((shown) => titles.every((title) => shown.has(title)))) return false;

    rendered.push(new Set(titles));
    return true;
  });
}

function collectAssistantEntities(blocks, context) {
  const text = blocks
    .map((block) => {
      if (block.kind === "list") return block.items.join("\n");
      // Stages shown as cards are already on screen; repeating them as chips adds nothing.
      if (block.kind === "stages") return "";
      return block.text;
    })
    .filter(Boolean)
    .join("\n");

  return findAssistantEntities(text, context).map((match) => match.entity);
}

// A workflow rendered as stage cards is offered as a link, together with its service.
function collectAssistantSequenceEntities(blocks, context) {
  const entities = [];

  for (const block of blocks) {
    if (block.kind !== "stages") continue;
    const workflow = resolveAssistantSequenceWorkflow(block.stages, context);
    if (!workflow) continue;
    const service = workflow.serviceId ? ASSISTANT_ENTITY_INDEX.byId.get(workflow.serviceId) : null;
    if (service) entities.push(service);
    entities.push(workflow);
  }

  return entities;
}

// Question entities first, then the ones the answer names. A stage also offers its workflow and a
// service also offers its workflow, so the reader can open the cycle and jump to the stage.
// Where a workflow and its service are the same page (خدمة الصيانة، خدمة التصميم…), the service
// label reads better than "عرض دورة …".
function preferServiceOverWorkflow(entity) {
  if (entity?.type !== "workflow" || !entity.serviceId) return entity;
  const service = ASSISTANT_ENTITY_INDEX.byId.get(entity.serviceId);
  return service?.href === entity.href ? service : entity;
}

const ASSISTANT_LINK_ORDER = { service: 0, workflow: 1, stage: 2 };

function buildAssistantRelatedLinks(questionEntities, referencedEntities) {
  const candidates = [];
  const seenIds = new Set();
  const seenHrefs = new Set();

  // One chip per destination: a service and its workflow that share a route (خدمة الصيانة) collapse
  // into a single link instead of two chips that go to the same page.
  const add = (entity) => {
    if (!entity || seenIds.has(entity.id) || seenHrefs.has(entity.href)) return;
    seenIds.add(entity.id);
    seenHrefs.add(entity.href);
    candidates.push(entity);
  };

  for (const entity of [...questionEntities.map((match) => match.entity), ...referencedEntities]) {
    add(preferServiceOverWorkflow(entity));

    if (entity.type === "service" && entity.workflowId) add(ASSISTANT_ENTITY_INDEX.byId.get(entity.workflowId));
    if (entity.type === "stage") add(preferServiceOverWorkflow(entity.workflow));
  }

  return candidates
    .map((entity, index) => ({ entity, index }))
    .sort((a, b) => ASSISTANT_LINK_ORDER[a.entity.type] - ASSISTANT_LINK_ORDER[b.entity.type] || a.index - b.index)
    .slice(0, ASSISTANT_MAX_RELATED_LINKS)
    .map((item) => item.entity);
}

// ---------------------------------------------------------------- Assistant answer rendering
const ASSISTANT_ODOO_TERMS = [
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

function escapeAssistantHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAssistantRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightAssistantOdooTerms(escapedText) {
  return ASSISTANT_ODOO_TERMS.reduce((currentText, term) => {
    const pattern = escapeAssistantRegExp(term).replace(/\s+/g, "\\s+");
    const regex = new RegExp(`(^|[^A-Za-z0-9])(${pattern})(?=$|[^A-Za-z0-9])`, "gi");
    return currentText.replace(regex, `$1<span class="odoo-term">$2</span>`);
  }, escapedText);
}

// Every assistant link is a plain hash route, never a `data-workflow-overlay` trigger: the shared
// overlay covers and inerts the assistant panel, which would interrupt the conversation. The site's
// own in-page links still open that overlay as before.
function assistantLinkAttributes(entity) {
  const tour = entity.type === "stage" ? entity.workflow.tour : entity.tour;

  return [
    `href="${escapeAssistantHtml(entity.href)}"`,
    `data-assistant-link="${escapeAssistantHtml(entity.type)}"`,
    entity.type === "stage" ? `data-assistant-stage="${escapeAssistantHtml(entity.stageId)}"` : "",
    tour ? `data-assistant-tour="${escapeAssistantHtml(tour.id)}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// Inline text: markdown bold, Odoo terms, and the first mention of each entity as a link.
function renderAssistantInlineText(text, context, linkState) {
  const entities = context ? findAssistantEntities(text, context) : [];
  const segments = [];
  let cursor = 0;

  for (const match of entities) {
    if (linkState.linked.size >= ASSISTANT_MAX_INLINE_LINKS) break;
    if (linkState.linked.has(match.entity.id)) continue;
    linkState.linked.add(match.entity.id);
    segments.push({ text: text.slice(cursor, match.start) });
    segments.push({ text: text.slice(match.start, match.end), entity: match.entity });
    cursor = match.end;
  }

  segments.push({ text: text.slice(cursor) });

  return segments
    .filter((segment) => segment.text)
    .map((segment) => {
      const html = renderAssistantMarkdown(segment.text);
      return segment.entity ? `<a class="assistant-entity-link" ${assistantLinkAttributes(segment.entity)}>${html}</a>` : html;
    })
    .join("");
}

function renderAssistantMarkdown(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/gu)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong>${highlightAssistantOdooTerms(escapeAssistantHtml(part.slice(2, -2)))}</strong>`;
      }
      return highlightAssistantOdooTerms(escapeAssistantHtml(part.replace(/\*/gu, "")));
    })
    .join("");
}

// A sequence belongs to one workflow, so all of its cards are resolved together against the tour
// registry instead of matching each title on its own. Matching titles one by one is what used to
// scatter a single answer across several workflows (or drop the links entirely when the service
// name happened to be written in a form the text matcher missed).
function resolveAssistantSequenceWorkflow(stages, context) {
  const titles = stages.map((stage) => normalizeAssistantText(stage.title)).filter(Boolean);
  if (titles.length === 0) return null;

  const covers = (workflow) => {
    const nodes = assistantWorkflowStageNodes(workflow);
    const matched = titles.filter((title) => nodes.some((node) => normalizeAssistantText(node.title) === title)).length;
    return { workflow, nodes, matched };
  };

  // The workflow of the page being read wins whenever it covers the sequence.
  const openWorkflow = ASSISTANT_WORKFLOW_ENTITIES.find((workflow) => workflow.tour.id === context?.tourId);
  if (openWorkflow) {
    const open = covers(openWorkflow);
    if (open.matched === titles.length) return openWorkflow;
  }

  // Otherwise a full match wins first: the tour holds every stage listed and is about the same
  // length, so a longer workflow that merely contains these stages is not assumed.
  const candidates = ASSISTANT_WORKFLOW_ENTITIES.map(covers);
  const byFit = (a, b) => Math.abs(a.nodes.length - titles.length) - Math.abs(b.nodes.length - titles.length);
  const exact = candidates
    .filter((candidate) => candidate.matched === titles.length && Math.abs(candidate.nodes.length - titles.length) <= 1)
    .sort(byFit)[0];

  if (exact) return exact.workflow;

  // Failing that, the workflow that covers most of the sequence, as long as it covers a clear
  // majority of it and no other workflow covers as much. One stage the answer paraphrased, or one
  // the page hides, then costs that single card its link instead of unlinking the whole sequence.
  const ranked = candidates
    .filter((candidate) => candidate.matched >= Math.ceil(titles.length * ASSISTANT_SEQUENCE_MATCH_RATIO))
    .sort((a, b) => b.matched - a.matched || byFit(a, b));

  if (!ranked.length || ranked[1]?.matched === ranked[0].matched) return null;
  return ranked[0].workflow;
}

function assistantWorkflowStageNodes(workflow) {
  return workflow.tour.children.filter((node) => node.visible !== false && node.targetId);
}

function renderAssistantStageCards(stages, context) {
  const workflow = resolveAssistantSequenceWorkflow(stages, context);
  const nodes = workflow ? assistantWorkflowStageNodes(workflow) : [];

  const cards = stages
    .map((stage) => {
      const node = nodes.find((candidate) => normalizeAssistantText(candidate.title) === normalizeAssistantText(stage.title));
      const entity = node ? ASSISTANT_ENTITY_INDEX.byId.get(`stage:${workflow.tour.id}:${node.id}`) : null;
      const index = stage.number ? `<span class="assistant-stage-index">${escapeAssistantHtml(stage.number)}</span>` : "";
      const label = `${index}<span class="assistant-stage-title">${renderAssistantMarkdown(stage.title)}</span>`;

      return entity
        ? `<a class="assistant-stage-card" ${assistantLinkAttributes(entity)}>${label}</a>`
        : `<span class="assistant-stage-card is-static">${label}</span>`;
    })
    .join("");

  return `<div class="assistant-stage-cards">${cards}</div>`;
}

function renderAssistantRelatedLinks(links) {
  if (!links.length) return "";

  const chips = links
    .map(
      (entity) =>
        `<a class="assistant-chip is-${escapeAssistantHtml(entity.type)}" ${assistantLinkAttributes(entity)}>${escapeAssistantHtml(entity.actionLabel)}</a>`,
    )
    .join("");

  return `<div class="assistant-links"><span class="assistant-links-label">روابط ذات صلة</span><div class="assistant-links-row">${chips}</div></div>`;
}

function renderAssistantAnswerModel(model) {
  if (model.isPlain) {
    return `<div class="assistant-response"><p class="assistant-response-summary">${renderAssistantMarkdown(model.blocks[0]?.text || "")}</p></div>`;
  }

  const linkState = { linked: new Set() };
  const parts = [];

  if (model.title) parts.push(`<p class="assistant-response-title">${renderAssistantMarkdown(model.title)}</p>`);

  const body = model.blocks
    .map((block, index) => {
      if (block.kind === "stages") return renderAssistantStageCards(block.stages, model.context);
      if (block.kind === "heading") {
        return `<p class="assistant-response-heading">${renderAssistantInlineText(block.text, model.context, linkState)}</p>`;
      }
      if (block.kind === "list") {
        const items = block.items
          .map((item) => `<li>${renderAssistantInlineText(item, model.context, linkState)}</li>`)
          .join("");
        return `<ul class="assistant-response-list">${items}</ul>`;
      }
      const className = index === 0 ? "assistant-response-summary" : "assistant-response-text";
      return `<p class="${className}">${renderAssistantInlineText(block.text, model.context, linkState)}</p>`;
    })
    .join("");

  parts.push(`<div class="assistant-response-body">${body}</div>`);
  parts.push(renderAssistantRelatedLinks(model.relatedLinks));

  return `<div class="assistant-response">${parts.filter(Boolean).join("")}</div>`;
}

function buildAssistantAnswerHtml(rawAnswer, question) {
  return renderAssistantAnswerModel(buildAssistantAnswerModel(rawAnswer, question));
}

// A link pointing at the route the reader is already on does not fire `hashchange`, so the stage is
// focused directly. Everything else is an ordinary hash link handled by the existing router.
function focusAssistantStage(tourId, stageId) {
  const tour = getRouteWorkflowTour();
  if (!tour || tour.id !== tourId || !stageId || !workflowScrollSpy) return false;

  const nodes = tour.children.filter((node) => node.visible !== false);
  const index = nodes.findIndex((node) => node.id === stageId || node.targetId === stageId);
  if (index < 0) return false;

  workflowScrollSpy.focusStage(index);
  return true;
}

// ---------------------------------------------------------------- Assistant onboarding guide
// The first thing a reader sees in an empty thread, and what the "؟" button in the panel header
// brings back at any time: what the assistant answers and one-tap example questions per service.
// The service chips and their examples are derived from ASSISTANT_SERVICE_ENTITIES, so adding a
// service there adds it here too.
const ASSISTANT_GUIDE_INTRO =
  "أستطيع الإجابة عن خطوات كل خدمة، المسؤول عن كل مرحلة، حالات أودو، والمستندات والحقول المطلوبة.";

// Shown before the reader picks a service: the questions that need no service name to be clear.
const ASSISTANT_GUIDE_EXAMPLES = [
  "ما الخدمات المتوفرة في ما بعد البيع؟",
  "ما خطوات خدمة التوصيل من البداية إلى النهاية؟",
  "ما الفرق بين تركيب كامل وتركيب مع توصيل؟",
];

// The four questions every service answers, filled with the service title the reader picked.
const ASSISTANT_GUIDE_QUESTION_TEMPLATES = [
  (title) => `ما خطوات ${title} من البداية إلى النهاية؟`,
  (title) => `من المسؤول عن كل مرحلة في ${title}؟`,
  (title) => `ما حالات أودو التي تمر بها ${title}؟`,
  (title) => `ما المستندات والحقول المطلوبة في ${title}؟`,
];

function renderAssistantGuideChip(question) {
  const value = escapeAssistantHtml(question);
  return `<button class="assistant-chip is-ask" type="button" data-assistant-ask="${value}">${value}</button>`;
}

// Rebuilt in place when a service chip is picked; `serviceId` null means the generic examples.
function renderAssistantGuideQuestions(serviceId) {
  const service = serviceId ? ASSISTANT_ENTITY_INDEX.byId.get(serviceId) : null;
  const questions = service
    ? ASSISTANT_GUIDE_QUESTION_TEMPLATES.map((template) => template(service.title))
    : ASSISTANT_GUIDE_EXAMPLES;
  const label = service ? `أسئلة جاهزة عن ${service.title}` : "جرّب أحد هذه الأسئلة";

  return [
    `<span class="assistant-guide-label">${escapeAssistantHtml(label)}</span>`,
    `<div class="assistant-guide-row">${questions.map(renderAssistantGuideChip).join("")}</div>`,
  ].join("");
}

function buildAssistantGuideHtml() {
  const services = ASSISTANT_SERVICE_ENTITIES.map(
    (service) =>
      `<button class="assistant-chip is-service" type="button" aria-pressed="false" data-assistant-service="${escapeAssistantHtml(service.id)}">${escapeAssistantHtml(service.title)}</button>`,
  ).join("");

  return [
    `<p class="assistant-guide-intro">${escapeAssistantHtml(ASSISTANT_GUIDE_INTRO)}</p>`,
    `<div class="assistant-guide-block"><span class="assistant-guide-label">اختر الخدمة التي تبحث عنها</span><div class="assistant-guide-row">${services}</div></div>`,
    `<div class="assistant-guide-block" data-assistant-suggestions>${renderAssistantGuideQuestions(null)}</div>`,
  ].join("");
}

// ---------------------------------------------------------------- Assistant conversation
// One assistant for the whole site. Its markup lives in index.html next to #bookPortal — the only
// container route rendering replaces — so navigating never unmounts it, and this array is its only
// history. Route changes update `assistantContext` underneath the thread and never touch it.
const assistantConversation = { messages: [] };

function getAssistantThread() {
  return document.querySelector("#assistantAnswer");
}

// Appends one turn and returns its element. Appending (rather than re-rendering the thread) is what
// keeps the reader's scroll position, the mounted thinking orb and any open link untouched.
function appendAssistantMessage(message) {
  const thread = getAssistantThread();
  if (!thread) return null;

  thread.querySelector("#assistantEmptyState")?.remove();

  const node = document.createElement("div");
  renderAssistantMessage(node, message);
  thread.append(node);
  scrollAssistantThreadToEnd();
  return node;
}

function renderAssistantMessage(node, message) {
  node.className = `assistant-message is-${message.role}`;

  if (message.role === "user") {
    const text = document.createElement("p");
    text.className = "assistant-message-question";
    text.textContent = message.text;
    node.replaceChildren(text);
    return;
  }

  if (message.role === "pending") {
    const orb = document.createElement("div");
    orb.className = "thinking-orb-root";
    orb.setAttribute("role", "status");
    orb.setAttribute("aria-label", "جاري إنشاء الإجابة");
    node.replaceChildren(orb);
    return;
  }

  if (message.role === "notice") {
    const text = document.createElement("p");
    text.className = "assistant-response-summary";
    text.textContent = message.text;
    node.replaceChildren(text);
    return;
  }

  // The same guide as the empty thread, re-shown from the header button without clearing the history.
  if (message.role === "guide") {
    node.innerHTML = `<div class="assistant-guide">${buildAssistantGuideHtml()}</div>`;
    return;
  }

  node.innerHTML = buildAssistantAnswerHtml(message.text, message.question);
}

function scrollAssistantThreadToEnd() {
  const thread = getAssistantThread();
  if (thread) thread.scrollTop = thread.scrollHeight;
}

// The question is sent with the page the reader has open as context. A stage link they followed is
// sent too, so a follow-up such as "شو بيجي بعد هالمرحلة؟" resolves against the stage on screen.
function buildAssistantRequestPayload(question) {
  return {
    pageId: assistantContext.pageId,
    question,
    ...(assistantContext.stageId ? { stageId: assistantContext.stageId, stageTitle: assistantContext.stageTitle } : {}),
  };
}

function initPageAssistant() {
  const assistant = document.querySelector("#pageAssistant");
  const toggle = document.querySelector("#assistantToggle");
  const panel = document.querySelector("#assistantPanel");
  const close = document.querySelector("#assistantClose");
  const form = document.querySelector("#assistantForm");
  const input = document.querySelector("#assistantQuestion");
  const answer = document.querySelector("#assistantAnswer");
  const guideButton = document.querySelector("#assistantGuideButton");

  if (!assistant || !toggle || !panel || !close || !form || !input || !answer) {
    return;
  }

  // The empty thread is the guide. It is removed by the first turn like any other empty state, and
  // the header button appends it again as a turn of its own.
  const emptyState = answer.querySelector("#assistantEmptyState");
  if (emptyState) emptyState.innerHTML = buildAssistantGuideHtml();

  guideButton?.addEventListener("click", () => {
    appendAssistantMessage({ role: "guide" });
  });

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

  // The pending turn is a placeholder message in the thread; the answer replaces it in place, so the
  // turns above it are never re-rendered.
  function showThinkingState() {
    answer.setAttribute("aria-busy", "true");
    const node = appendAssistantMessage({ role: "pending" });
    window.ThinkingOrbMount?.mount(node?.querySelector(".thinking-orb-root"));
    return node;
  }

  // The answer is laid out as title / summary / body / related links, with every service, workflow
  // and stage it names turned into a link into this site.
  function resolveThinkingState(node, message) {
    window.ThinkingOrbMount?.unmount();
    answer.removeAttribute("aria-busy");
    assistantConversation.messages.push(message);

    if (node) renderAssistantMessage(node, message);
    else appendAssistantMessage(message);

    scrollAssistantThreadToEnd();
  }

  function renderAssistantNotice(text) {
    window.ThinkingOrbMount?.unmount();
    answer.removeAttribute("aria-busy");
    appendAssistantMessage({ role: "notice", text });
  }

  // Following a link never closes or resets the assistant: it is an ordinary hash navigation under a
  // panel that is mounted at shell level. A link to the route already open does not fire
  // `hashchange`, so that one stage is focused directly instead.
  answer.addEventListener("click", (event) => {
    const link = event.target.closest?.("[data-assistant-link]");
    if (!link || link.getAttribute("href") !== window.location.hash) return;

    if (focusAssistantStage(link.dataset.assistantTour, link.dataset.assistantStage)) {
      event.preventDefault();
    }
  });

  // The guide's chips are shortcuts for typing: a service chip swaps the example questions inside its
  // own guide, and a question chip is sent through the normal form, so the answer is identical to a
  // question the reader typed.
  answer.addEventListener("click", (event) => {
    const serviceChip = event.target.closest?.("[data-assistant-service]");

    if (serviceChip) {
      const guide = serviceChip.closest(".assistant-guide");
      const suggestions = guide?.querySelector("[data-assistant-suggestions]");

      if (suggestions) {
        suggestions.innerHTML = renderAssistantGuideQuestions(serviceChip.dataset.assistantService);
      }

      for (const chip of guide?.querySelectorAll("[data-assistant-service]") || []) {
        chip.setAttribute("aria-pressed", String(chip === serviceChip));
      }

      return;
    }

    const askChip = event.target.closest?.("[data-assistant-ask]");
    if (!askChip || input.disabled) return;

    input.value = askChip.dataset.assistantAsk;
    updatePromptState();
    form.requestSubmit();
  });

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
    scrollAssistantThreadToEnd();
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
      renderAssistantNotice("يرجى كتابة سؤال واضح.");
      return;
    }

    if (question.length > 500) {
      renderAssistantNotice("يرجى كتابة سؤال لا يتجاوز 500 حرف.");
      return;
    }

    const submitButton = form.querySelector("button");
    const payload = buildAssistantRequestPayload(question);

    assistantConversation.messages.push({ role: "user", text: question, pageId: payload.pageId });
    appendAssistantMessage({ role: "user", text: question });
    input.value = "";

    const pendingNode = showThinkingState();
    submitButton.dataset.loading = "true";
    submitButton.disabled = true;
    input.disabled = true;

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      resolveThinkingState(
        pendingNode,
        data.answer
          ? { role: "assistant", text: data.answer, question }
          : { role: "notice", text: "تعذر الحصول على إجابة حاليًا. حاول مرة أخرى." },
      );
    } catch {
      resolveThinkingState(pendingNode, { role: "notice", text: "تعذر الحصول على إجابة حاليًا. حاول مرة أخرى." });
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
  initWorkflowOverlay();
  initPageAssistant();
}

document.addEventListener("DOMContentLoaded", init);
