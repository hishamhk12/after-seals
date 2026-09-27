// Source of truth: rendered pages #/service/customer-service, #/chapter/customer-service-sources,
// #/chapter/customer-service-complaints and #/chapter/customer-service-maintenance
// (app.js renderCustomerServiceOverview / renderCustomerServiceSources / renderComplaintsWorkflow /
// renderMaintenanceWorkflow).
const customerService = {
  id: "customer-service",
  services: ["customer_service"],
  relatedServices: ["maintenance"],
  relatedPages: ["complaints", "maintenance"],
  title: "خدمة العملاء",
  route: "#/service/customer-service + #/chapter/customer-service-sources",
  workflowLabel: "كيف تصل الحالات إلى خدمة العملاء",
  overview:
    "قسم خدمة العملاء يتضمن: كيف تصل الحالات إلى خدمة العملاء؟ (القسم الأول)، والشكاوى / الاستفسارات (القسم الثاني، 5 مراحل)، والصيانة كمسار مستقل (7 مراحل). تصل الحالات إلى خدمة العملاء من ثلاثة مصادر تغذّي جهة واحدة مسؤولة عن كل حالة، وجميع القنوات الثلاثة تصب في جهة واحدة لإدارة الحالة ومتابعتها حتى الإغلاق.",
  terms: ["خدمة العملاء", "Customer Service", "كيف تصل الحالات إلى خدمة العملاء", "مصادر الحالات"],
  stages: [],
  sections: [
    {
      id: "source-internal-departments",
      number: "01",
      title: "من الإدارات الداخلية",
      description:
        "تصل الحالة إلى خدمة العملاء من إحدى الإدارات الداخلية عندما يظهر موقف مع العميل يحتاج إلى متابعة من خدمة العملاء.",
      examples: ["عميل رفض التوقيع", "عميل غير راضٍ عن التركيب", "صعوبة تواصل"],
      relatedTerms: ["الإدارات الداخلية", "عميل رفض التوقيع", "عميل غير راضٍ عن التركيب", "صعوبة تواصل"],
    },
    {
      id: "source-customer-direct",
      number: "02",
      title: "من العميل مباشرة",
      description: "يتواصل العميل مباشرة مع خدمة العملاء لتقديم استفسار أو شكوى.",
      examples: ["استفسار", "شكوى"],
      relatedTerms: ["العميل مباشرة", "استفسار", "شكوى"],
    },
    {
      id: "source-system",
      number: "03",
      title: "من النظام",
      description: "تظهر الحالة من خلال النظام عند وجود طلب يحتاج إلى متابعة من خدمة العملاء.",
      examples: ["حالة عالقة", "عميل لم يحجز موعد", "تأخر في إجراء مطلوب"],
      relatedTerms: ["من النظام", "حالة عالقة", "عميل لم يحجز موعد", "تأخر في إجراء مطلوب"],
    },
  ],
};

const complaints = {
  id: "complaints",
  services: ["customer_service"],
  relatedServices: [],
  title: "الشكاوى / الاستفسارات",
  route: "#/chapter/customer-service-complaints",
  workflowLabel: "مسار الشكاوى / الاستفسارات",
  overview:
    "تعرض الصفحة دورة معالجة شكوى أو استفسار العميل ضمن خدمة العملاء، من الاستقبال وتحديد النوع وحتى الحل أو التصعيد، في خمس مراحل يدوية من 00 إلى 04.",
  terms: ["الشكاوى", "الاستفسارات", "شكوى", "استفسار", "خدمة العملاء"],
  stages: [
    {
      id: "received",
      number: "00",
      title: "شكوى/استفسار العميل",
      description:
        "تبدأ الدورة باستقبال شكوى أو استفسار العميل من قبل خدمة العملاء، ويتم توثيق تفاصيل الحالة لتكون مرجعًا في بقية مراحل المعالجة.",
      execution: "يدوي / خدمة العملاء",
      relatedTerms: ["استقبال الشكوى", "توثيق التفاصيل"],
    },
    {
      id: "type",
      number: "01",
      title: "تحديد النوع",
      description:
        "بعد توثيق الحالة، تقوم خدمة العملاء بتحديد نوع الحالة وتصنيفها، تمهيدًا لتحويلها إلى الجهة المختصة بمعالجتها.",
      execution: "يدوي / خدمة العملاء",
      relatedTerms: ["تحديد النوع", "تصنيف الحالة"],
    },
    {
      id: "forward",
      number: "02",
      title: "ارسال إلى الجهة المختصة",
      description:
        "بعد تحديد نوع الحالة، يتم تحويل الشكوى إلى الجهة المختصة بالمعالجة، وتشترك خدمة العملاء والجهة المختصة في تنفيذ هذه المرحلة.",
      execution: "يدوي / خدمة العملاء / الجهة المختصة",
      relatedTerms: ["إرسال إلى الجهة المختصة", "تحويل الشكوى", "الجهة المختصة"],
    },
    {
      id: "follow-up",
      number: "03",
      title: "متابعة",
      description: "بعد تحويل الشكوى، تتابع خدمة العملاء الحالة مع الجهة المختصة حتى اكتمال الإجراء المطلوب.",
      execution: "يدوي / خدمة العملاء",
      relatedTerms: ["متابعة", "اكتمال الإجراء"],
    },
    {
      id: "resolution",
      number: "04",
      title: "حل أو تصعيد",
      description:
        "بعد اكتمال الإجراء، يتم الوصول إلى حل الشكوى، أو تصعيدها عند الحاجة، وبذلك تنتهي دورة معالجة الشكوى أو الاستفسار.",
      execution: "يدوي / خدمة العملاء",
      relatedTerms: ["حل", "تصعيد"],
    },
  ],
};

const maintenance = {
  id: "maintenance",
  services: ["maintenance"],
  relatedServices: ["customer_service"],
  title: "خدمة الصيانة",
  route: "#/chapter/customer-service-maintenance",
  workflowLabel: "مسار خدمة الصيانة",
  overview:
    "خدمة الصيانة مسار مستقل ضمن قسم خدمة العملاء. تعرض الصفحة دورة عمل خدمة الصيانة من إنشاء طلب صيانة جديد وحتى تنفيذ أعمال الصيانة وتسليم الخدمة، في سبع مراحل يدوية من 00 إلى 06، ولا توجد مراحل آلية في هذا المسار.",
  terms: ["خدمة الصيانة", "الصيانة", "Maintenance", "طلب صيانة"],
  stages: [
    {
      id: "new-request",
      number: "00",
      title: "طلب صيانة جديد",
      description:
        "تبدأ دورة خدمة الصيانة بإنشاء طلب صيانة جديد داخل نظام خدمات ما بعد البيع من قبل خدمة العملاء، ليبدأ تتبع الطلب ضمن مراحل الصيانة.",
      execution: "يدوي / خدمة العملاء",
      relatedTerms: ["طلب صيانة جديد"],
    },
    {
      id: "scheduling",
      number: "01",
      title: "جدولة موعد",
      description: "بعد إنشاء الطلب، يتم الانتقال إلى مرحلة جدولة الموعد، حيث تقوم خدمة العملاء بتحديد موعد زيارة الصيانة.",
      execution: "يدوي / خدمة العملاء",
      relatedTerms: ["جدولة موعد", "زيارة الصيانة"],
    },
    {
      id: "technician",
      number: "02",
      title: "تعيين فني",
      description:
        "بعد جدولة الموعد، يكون طلب الصيانة بانتظار تعيين الفني المسؤول عن تنفيذ الزيارة، ويتم التعيين من قبل الجهة المختصة.",
      execution: "يدوي / الجهة المختصة",
      relatedTerms: ["تعيين فني", "الفني", "الجهة المختصة"],
    },
    {
      id: "initial-report",
      number: "03",
      title: "التقرير المبدئي",
      description: "بعد زيارة الفني، يتم تسجيل التقرير المبدئي للحالة وتحديد الإجراء المطلوب لمعالجتها.",
      execution: "يدوي / الجهة المختصة",
      relatedTerms: ["التقرير المبدئي", "زيارة الفني"],
    },
    {
      id: "final-decision",
      number: "04",
      title: "القرار النهائي / الموافقات",
      description: "بعد تسجيل التقرير المبدئي، تتخذ الإدارة القرار النهائي للحالة ويتم استكمال الموافقات المطلوبة.",
      execution: "يدوي / الإدارة",
      relatedTerms: ["القرار النهائي", "الموافقات", "الإدارة"],
    },
    {
      id: "appointment",
      number: "05",
      title: "تحديد موعد الصيانة",
      description: "بعد جاهزية الحالة، تقوم خدمة العملاء بتحديد موعد تنفيذ أعمال الصيانة.",
      execution: "يدوي / خدمة العملاء",
      relatedTerms: ["تحديد موعد الصيانة"],
    },
    {
      id: "in-progress",
      number: "06",
      title: "جاري الصيانة / تسليم الخدمة",
      description:
        "في الموعد المحدد يقوم الفني بتنفيذ أعمال الصيانة، ثم يتم تسليم الخدمة بعد الانتهاء من الأعمال المطلوبة، وبذلك تكتمل دورة خدمة الصيانة.",
      execution: "يدوي / الفني",
      relatedTerms: ["جاري الصيانة", "تسليم الخدمة", "الفني"],
    },
  ],
};

module.exports = { customerService, complaints, maintenance };
