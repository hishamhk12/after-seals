const pageKnowledge = {
  "intro-tour": {
    id: "intro-tour",
    title: "جولة تعريفية",
    scope:
      "هذه الصفحة جولة تعريفية تعرض أهم شاشات وحقول دورة خدمات ما بعد البيع في Odoo، ولا تحتوي على تدريب تنفيذي تفصيلي.",
    entities: {
      invoice: {
        name: "الفاتورة",
        description: "فاتورة Odoo التي تتضمن خدمة محددة وينشئ النظام منها العناصر المرتبطة بالخدمة تلقائيًا.",
        examples: ["INV/2026/00129", "أجور توصيل الرياض - جنوب الرياض"],
        relatedTerms: ["فاتورة", "Invoice", "رقم الفاتورة"],
      },
      task: {
        name: "المهمة",
        description: "مهمة الخدمة المرتبطة بالفاتورة لتنفيذ خدمة التوصيل.",
        examples: ["INV/2026/00129 - 1"],
        relatedTerms: ["Task", "مهمة", "مهمة التوصيل"],
      },
      project: {
        name: "Project",
        description: "المشروع الذي تنتمي إليه المهمة، ويظهر هنا كخدمة التوصيل.",
        examples: ["خدمة التوصيل"],
        relatedTerms: ["Project", "المشروع", "نوع الخدمة"],
      },
      driver: {
        name: "السائق",
        description: "الشخص المنفذ فعليًا لخدمة التوصيل عند تعيينه في حقل Assign.",
        relatedTerms: ["السائق", "منفذ الخدمة", "المنفذ", "Assign"],
      },
      customer: {
        name: "العميل",
        description: "الشخص الذي تظهر بياناته الأساسية أثناء حجز موعد التوصيل ويمكنه تحديد موقع تنفيذ الخدمة.",
        relatedTerms: ["العميل", "بيانات العميل", "موقع التنفيذ"],
      },
      driverPortal: {
        name: "بوابة السائق",
        description: "البوابة التي ينفذ السائق منها خدمة التوصيل بعد تعيينه.",
        relatedTerms: ["بوابة السائق", "رابط بوابة المهمة", "Driver Portal"],
      },
    },
    fields: {
      Project: {
        meaning: "نوع الخدمة المرتبطة بالمهمة أو المشروع الذي تنتمي إليه المهمة.",
        valueShown: "خدمة التوصيل",
        relatedTerms: ["Project", "المشروع", "نوع الخدمة", "خدمة التوصيل"],
      },
      Tasks: {
        meaning: "Tasks هو الزر المستخدم للوصول إلى مهمة التوصيل المرتبطة بالفاتورة، ومن خلاله يمكن عرض تفاصيل الخدمة المرتبطة بها.",
        relatedTerms: ["Tasks", "زر Tasks", "التاسك", "المهمة", "مهمة التوصيل", "تفاصيل المهمة", "تفاصيل الخدمة", "الفاتورة"],
      },
      Assignees: {
        meaning: "المشرف المسؤول عن متابعة المهمة والإشراف عليها.",
        relatedTerms: ["Assignees", "المشرف", "المسؤول عن المتابعة", "مشرف الخدمة"],
      },
      Assign: {
        meaning: "الشخص المنفذ فعليًا للخدمة.",
        deliveryMeaning: "في خدمة التوصيل يكون Assign هو السائق.",
        relatedTerms: ["Assign", "السائق", "المنفذ", "منفذ الخدمة"],
      },
      Stage: {
        meaning: "المرحلة الحالية التي وصلت إليها المهمة ضمن دورة تنفيذ الخدمة.",
        examples: ["طلب توصيل", "جدولة التوصيل", "تعيين سائق", "جاري التوصيل", "تم التوصيل"],
        relatedTerms: ["Stage", "المرحلة", "حالة المرحلة"],
      },
      "Trip Date": {
        meaning: "تاريخ الرحلة أو التنفيذ المخطط للخدمة.",
        relatedTerms: ["Trip Date", "تاريخ الرحلة", "تاريخ التنفيذ"],
      },
      "Appointment From": {
        meaning: "تاريخ بداية الفترة المسموح خلالها بحجز موعد التوصيل.",
        relatedTerms: ["Appointment From", "بداية الحجز", "بداية فترة الحجز", "تاريخ بداية الحجز"],
      },
      "Appointment To": {
        meaning: "تاريخ نهاية الفترة المسموح خلالها بحجز موعد التوصيل.",
        relatedTerms: ["Appointment To", "نهاية الحجز", "نهاية فترة الحجز", "تاريخ نهاية الحجز"],
      },
      Invoice: {
        meaning: "رقم الفاتورة المرتبطة بالمهمة.",
        valueShown: "INV/2026/00129",
        relatedTerms: ["Invoice", "الفاتورة", "رقم الفاتورة"],
      },
      "Source Invoice": {
        meaning: "الفاتورة المصدر المتعلقة بالخدمة.",
        valueShown: "INV/2026/00129",
        relatedTerms: ["Source Invoice", "الفاتورة المصدر"],
      },
      "Task Forms": {
        meaning: "نماذج مرتبطة بالمهمة يتم تفعيلها في مرحلة تعيين سائق.",
        deliveryExample: "نموذج سند التحميل",
        relatedTerms: ["Task Forms", "نماذج المهمة", "نموذج سند تحميل", "نموذج سند التحميل"],
      },
      Start: {
        meaning: "خيار يظهر في بوابة السائق لبدء تنفيذ خدمة التوصيل.",
        relatedTerms: ["Start", "بدء المهمة", "تشغيل المهمة"],
      },
      "End Task": {
        meaning: "خيار يظهر بعد رفع الصورة المطلوبة عندما تصبح المهمة جاهزة للإنهاء.",
        relatedTerms: ["End Task", "إنهاء المهمة"],
      },
      OTP: {
        meaning: "رمز تأكيد يرسل إلى العميل ويستخدم لتأكيد استلام الخدمة.",
        relatedTerms: ["OTP", "رمز التأكيد", "رمز الاستلام", "تأكيد الاستلام"],
      },
      Completed: {
        meaning: "حالة تظهر بعد تأكيد الرمز بنجاح وتسجيل اكتمال خدمة التوصيل وتأكيد العميل.",
        relatedTerms: ["Completed", "اكتمال التوصيل", "تم التوصيل"],
      },
    },
    stages: [
      {
        id: "invoice",
        order: 1,
        title: "الفاتورة",
        screen: "شاشة فاتورة Odoo",
        summary: "تعرض الفاتورة الخدمة الموجودة وتظهر مؤشرات Operations و Tasks و Services.",
        facts: [
          "ينشئ النظام العناصر المرتبطة بالخدمة تلقائيًا عند اعتماد فاتورة تحتوي على خدمة التوصيل.",
          "رقم الفاتورة المعروض هو INV/2026/00129.",
          "الخدمة الموجودة في الفاتورة هي أجور توصيل الرياض - جنوب الرياض.",
          "تظهر مؤشرات Operations و Tasks و Services بقيمة 1 لكل منها.",
          "يظهر زر Tasks للوصول إلى مهمة التوصيل وعرض تفاصيل الخدمة المرتبطة بالفاتورة.",
        ],
        relatedTerms: ["الفاتورة", "Invoice", "Operations", "Tasks", "Services"],
      },
      {
        id: "linked-tasks",
        order: 2,
        title: "المهام المرتبطة بالخدمة",
        screen: "شاشة مهام Odoo",
        summary: "تعرض المهمة المرتبطة بالفاتورة لتنفيذ خدمة التوصيل.",
        facts: [
          "اسم المهمة هو INV/2026/00129 - 1.",
          "Project يوضح أن المهمة ضمن خدمة التوصيل.",
          "Assignees هو المشرف المسؤول عن متابعة المهمة والإشراف على تنفيذها.",
          "Assign هو الشخص الذي ينفذ الخدمة فعليًا؛ في خدمة التوصيل يكون السائق، وفي خدمة التركيب يكون الفني.",
          "Stage هي المرحلة الحالية التي وصلت إليها المهمة ضمن دورة تنفيذ الخدمة.",
          "Trip Date هو تاريخ الرحلة.",
        ],
        relatedTerms: ["المهام", "Task", "Project", "Assignees", "Assign", "Stage", "Trip Date"],
      },
      {
        id: "task-details",
        order: 3,
        title: "تفاصيل مهمة التوصيل",
        screen: "شاشة تفاصيل مهمة التوصيل",
        summary: "تعرض تفاصيل مهمة التوصيل المرتبطة بالفاتورة.",
        facts: [
          "Stage = طلب توصيل تعني أن طلب التوصيل تم إنشاؤه وما زال في بداية دورة التنفيذ.",
          "Project يوضح نوع الخدمة المرتبطة بالمهمة، وهي خدمة التوصيل.",
          "Assignees هو المشرف المسؤول عن متابعة المهمة والإشراف عليها.",
          "Invoice هو رقم الفاتورة المرتبطة بالمهمة.",
        ],
        relatedTerms: ["تفاصيل المهمة", "طلب توصيل", "Project", "Assignees", "Invoice"],
      },
      {
        id: "execution-appointment-data",
        order: 4,
        title: "بيانات التنفيذ والموعد",
        screen: "حقول التنفيذ والموعد في المهمة",
        summary: "تعرض بيانات منفذ الخدمة والفترة المتاحة لحجز موعد التوصيل.",
        facts: [
          "Assign هو الشخص الذي ينفذ الخدمة فعليًا، وفي خدمة التوصيل يكون السائق.",
          "Trip Date هو تاريخ الرحلة أو التنفيذ المخطط للخدمة.",
          "Appointment From هو بداية الفترة المسموح خلالها بحجز موعد التوصيل.",
          "Appointment To هو نهاية الفترة المسموح خلالها بحجز موعد التوصيل.",
          "تعرض هذه المنطقة الفترة التي يكون موعد التوصيل ضمنها بين Appointment From و Appointment To.",
        ],
        relatedTerms: ["Assign", "السائق", "Trip Date", "Appointment From", "Appointment To"],
      },
      {
        id: "appointment-window",
        order: 5,
        title: "تحديد فترة حجز الموعد",
        screen: "شاشة تحديد Appointment From و Appointment To",
        summary: "تعرض الفترة المسموح خلالها بحجز موعد التوصيل.",
        facts: [
          "Appointment From هو تاريخ بداية الفترة المسموح خلالها بحجز موعد التوصيل.",
          "Appointment To هو تاريخ نهاية الفترة المسموح خلالها بحجز موعد التوصيل.",
          "Save هو زر الحفظ الذي تظهر من خلاله إمكانية حفظ التعديلات على المهمة.",
          "بعد حفظ البيانات، تظهر فترة الحجز محفوظة على المهمة ضمن سياق جدولة التوصيل.",
        ],
        relatedTerms: ["Appointment From", "Appointment To", "Save", "فترة الحجز", "نافذة الحجز"],
      },
      {
        id: "delivery-scheduling",
        order: 6,
        title: "جدولة التوصيل",
        screen: "مرحلة جدولة التوصيل",
        summary: "تعرض مرحلة جدولة التوصيل ورابط حجز الموعد.",
        facts: [
          "مرحلة جدولة التوصيل تشير إلى أن المهمة أصبحت جاهزة لتحديد موعد التوصيل.",
          "في مرحلة جدولة التوصيل يظهر رابط حجز الموعد.",
          "يمكن إرسال رابط حجز الموعد إلى العميل ليقوم بحجز موعد التوصيل بنفسه.",
          "يمكن لخدمة العملاء حجز موعد التوصيل نيابة عن العميل.",
        ],
        relatedTerms: ["جدولة التوصيل", "رابط حجز الموعد", "حجز موعد", "العميل", "خدمة العملاء"],
      },
      {
        id: "appointment-booking",
        order: 7,
        title: "حجز موعد التوصيل",
        screen: "شاشات حجز موعد التوصيل",
        summary: "تعرض مراحل حجز موعد التوصيل بدءًا من اختيار الموعد وحتى تأكيد الحجز.",
        subSteps: [
          {
            id: "date-time-selection",
            title: "اختيار التاريخ والوقت",
            summary:
              "تظهر المواعيد المتاحة للحجز ضمن الفترة المحددة مسبقًا بين تاريخ بداية الحجز وتاريخ نهايته، ويختار المستخدم التاريخ والوقت المناسبين لموعد التوصيل.",
            relatedTerms: ["اختيار الموعد", "التاريخ والوقت", "المواعيد المتاحة"],
          },
          {
            id: "customer-location",
            title: "بيانات العميل وموقع التنفيذ",
            summary:
              "يقوم العميل بإدخال اسمه والبريد الإلكتروني ورقم الجوال، ثم يحدد موقع تنفيذ الخدمة على الخريطة قبل تأكيد الموعد.",
            relatedTerms: ["بيانات العميل", "الاسم", "البريد الإلكتروني", "رقم الجوال", "الخريطة", "موقع التنفيذ"],
          },
          {
            id: "appointment-confirmation",
            title: "تأكيد الموعد",
            summary: "تعرض تفاصيل الموعد بعد إتمام الحجز للتأكد من تسجيل موعد التوصيل بنجاح.",
            relatedTerms: ["تأكيد الموعد", "تفاصيل الموعد", "تسجيل الموعد"],
          },
        ],
        relatedTerms: ["حجز موعد التوصيل", "اختيار الموعد", "بيانات العميل", "تأكيد الموعد"],
      },
      {
        id: "driver-assignment-task-form",
        order: 8,
        title: "تعيين السائق ونموذج المهمة",
        screen: "مرحلة تعيين سائق وتبويب Task Forms",
        summary: "تعرض ما يظهر عندما تصل المهمة إلى مرحلة تعيين سائق وتظهر نماذج المهمة.",
        facts: [
          "عند وصول المهمة إلى مرحلة تعيين سائق، يتم تعيين السائق المسؤول عن تنفيذ خدمة التوصيل.",
          "Stage = تعيين سائق توضح أن المهمة وصلت إلى مرحلة تعيين السائق.",
          "في هذه المرحلة يتم تفعيل Task Forms المرتبطة بالمهمة.",
          "في خدمة التوصيل يظهر نموذج سند التحميل ليتم تعبئته من قبل السائق أثناء تنفيذ الخدمة.",
          "بعد تعيين السائق، يتم تنفيذ خدمة التوصيل من خلال بوابة السائق حتى اكتمال التوصيل.",
        ],
        relatedTerms: ["تعيين سائق", "Stage", "Task Forms", "نموذج سند تحميل", "نموذج سند التحميل"],
      },
      {
        id: "driver-portal-execution",
        order: 9,
        title: "تنفيذ التوصيل من بوابة السائق",
        screen: "بوابة السائق",
        summary: "تعرض رحلة تنفيذ خدمة التوصيل من خلال بوابة السائق.",
        subSteps: [
          {
            id: "start-task",
            title: "بدء المهمة",
            summary: "بعد تعيين السائق، يصل إليه رابط بوابة المهمة. يفتح السائق الرابط ويضغط على Start لبدء تنفيذ خدمة التوصيل.",
            relatedTerms: ["Start", "بدء المهمة", "رابط بوابة المهمة"],
          },
          {
            id: "upload-photo",
            title: "رفع صورة التنفيذ",
            summary: "بعد بدء المهمة، يظهر للسائق قسم رفع الصور لتوثيق تنفيذ الخدمة.",
            relatedTerms: ["رفع الصورة", "رفع الصور", "توثيق تنفيذ الخدمة"],
          },
          {
            id: "end-task",
            title: "إنهاء المهمة",
            summary: "بعد رفع الصورة المطلوبة، تصبح المهمة جاهزة للإنهاء ويظهر خيار End Task.",
            relatedTerms: ["End Task", "إنهاء المهمة"],
          },
          {
            id: "otp-confirmation",
            title: "تأكيد الاستلام عبر OTP",
            summary: "عند إنهاء المهمة، يتم إرسال رمز تأكيد إلى العميل، ويُستخدم الرمز لتأكيد استلام الخدمة.",
            relatedTerms: ["OTP", "رمز التأكيد", "رمز الاستلام", "تأكيد العميل", "تأكيد الاستلام"],
          },
          {
            id: "completed-delivery",
            title: "اكتمال التوصيل",
            summary: "بعد تأكيد الرمز بنجاح، تتحول المهمة إلى Completed ويُسجل اكتمال خدمة التوصيل وتأكيد العميل.",
            relatedTerms: ["Completed", "اكتمال التوصيل", "تم التوصيل", "تأكيد العميل"],
          },
        ],
        relatedTerms: ["بوابة السائق", "Start", "رفع الصورة", "End Task", "OTP", "Completed"],
      },
    ],
    workflow: [
      { order: 1, stageId: "invoice", action: "عرض الفاتورة", outcome: "ظهور خدمة التوصيل ومؤشرات Operations و Tasks و Services" },
      { order: 2, stageId: "linked-tasks", action: "عرض المهام المرتبطة", outcome: "ظهور مهمة التوصيل المرتبطة بالفاتورة" },
      { order: 3, stageId: "task-details", action: "عرض تفاصيل المهمة", outcome: "ظهور Stage و Project و Assignees و Invoice" },
      { order: 4, stageId: "execution-appointment-data", action: "عرض بيانات التنفيذ والموعد", outcome: "ظهور Assign و Trip Date و Appointment From و Appointment To" },
      { order: 5, stageId: "appointment-window", action: "تحديد فترة الحجز", outcome: "حفظ فترة الحجز على المهمة" },
      { order: 6, stageId: "delivery-scheduling", action: "جدولة التوصيل", outcome: "ظهور رابط حجز الموعد" },
      {
        order: 7,
        stageId: "appointment-booking",
        action: "حجز موعد التوصيل",
        sequence: ["اختيار التاريخ والوقت", "بيانات العميل وموقع التنفيذ", "تأكيد الموعد"],
        outcome: "تسجيل موعد التوصيل بنجاح",
      },
      {
        order: 8,
        stageId: "driver-assignment-task-form",
        action: "تعيين السائق",
        outcome: "تفعيل Task Forms وظهور نموذج سند التحميل ثم تنفيذ التوصيل من بوابة السائق",
      },
      {
        order: 9,
        stageId: "driver-portal-execution",
        action: "تنفيذ التوصيل من بوابة السائق",
        sequence: ["Start", "رفع صورة التنفيذ", "End Task", "OTP Confirmation", "Completed"],
        outcome: "اكتمال خدمة التوصيل وتأكيد العميل",
      },
    ],
    sequences: [
      {
        id: "full-delivery-workflow",
        title: "تسلسل خدمة التوصيل الكامل",
        start: "الفاتورة",
        end: "Completed",
        steps: [
          "تبدأ الدورة من الفاتورة التي تحتوي على خدمة التوصيل.",
          "من الفاتورة يتم الوصول إلى Tasks.",
          "تظهر مهمة التوصيل المرتبطة بالفاتورة.",
          "تُراجع بيانات المهمة وحقول Appointment From / Appointment To.",
          "يتم الانتقال إلى جدولة التوصيل وظهور رابط حجز الموعد.",
          "يحجز العميل موعد التوصيل ضمن الفترة المحددة.",
          "تصل المهمة إلى تعيين السائق.",
          "يتم تفعيل Task Forms وظهور نموذج سند التحميل.",
          "ينفذ السائق الخدمة من بوابة السائق.",
          "يضغط السائق على Start لبدء التنفيذ.",
          "يرفع السائق صورة التنفيذ.",
          "بعد رفع الصورة يظهر خيار End Task.",
          "يتم إرسال رمز OTP إلى العميل لتأكيد الاستلام.",
          "بعد تأكيد OTP بنجاح تتحول المهمة إلى Completed.",
        ],
        relatedTerms: [
          "تسلسل",
          "تسلسل الخدمات",
          "تسلسل الخدمة",
          "تسلسل خدمة التوصيل",
          "ترتيب الخدمات",
          "ترتيب الخدمة",
          "ترتيب الخطوات",
          "مراحل",
          "مراحل الخدمة",
          "مراحل التوصيل",
          "دورة الخدمة",
          "دورة التوصيل",
          "السايكل",
          "الفلو",
          "الفلو كامل",
          "workflow",
          "cycle",
          "sequence",
          "من البداية للنهاية",
          "الفاتورة",
          "Tasks",
          "مهمة التوصيل",
          "Appointment From",
          "Appointment To",
          "جدولة التوصيل",
          "حجز الموعد",
          "تعيين السائق",
          "Task Forms",
          "بوابة السائق",
          "Start",
          "رفع صورة التنفيذ",
          "End Task",
          "OTP",
          "Completed",
        ],
      },
      {
        id: "driver-assignment-to-completion",
        title: "من تعيين السائق حتى اكتمال التوصيل",
        start: "تعيين السائق",
        end: "اكتمال التوصيل",
        steps: [
          "تصل المهمة إلى Stage = تعيين سائق ويتم تعيين السائق المسؤول عن تنفيذ خدمة التوصيل.",
          "يتم تفعيل Task Forms المرتبطة بالمهمة ويظهر نموذج سند التحميل في خدمة التوصيل.",
          "ينفذ السائق خدمة التوصيل من بوابة السائق.",
          "يفتح السائق رابط بوابة المهمة ويضغط على Start لبدء تنفيذ خدمة التوصيل.",
          "يرفع السائق صورة التنفيذ لتوثيق تنفيذ الخدمة.",
          "بعد رفع الصورة المطلوبة يظهر خيار End Task.",
          "عند إنهاء المهمة، يتم إرسال رمز OTP إلى العميل لتأكيد استلام الخدمة.",
          "بعد تأكيد رمز OTP بنجاح، تتحول المهمة إلى Completed ويُسجل اكتمال خدمة التوصيل وتأكيد العميل.",
        ],
        relatedTerms: [
          "تعيين السائق",
          "تعيين سائق",
          "من وقت تعيين السائق لحد انتهاء التوصيل",
          "ماذا يحدث من وقت تعيين السائق حتى انتهاء التوصيل",
          "شو بصير من وقت تعيين السائق لحد انتهاء التوصيل",
          "انتهاء التوصيل",
          "اكتمال التوصيل",
          "بوابة السائق",
          "Start",
          "رفع الصورة",
          "End Task",
          "OTP",
          "Completed",
        ],
      },
    ],
    supportedQuestions: [
      {
        id: "full-delivery-workflow-question",
        questions: [
          "شو تسلسل الخدمات؟",
          "شو تسلسل الخدمة؟",
          "شو تسلسل خدمة التوصيل؟",
          "شو ترتيب الخدمات؟",
          "شو ترتيب الخدمة؟",
          "شو ترتيب الخطوات؟",
          "شو مراحل الخدمة؟",
          "شو مراحل التوصيل؟",
          "شو دورة الخدمة؟",
          "شو دورة التوصيل؟",
          "اشرح السايكل",
          "اشرح الفلو",
          "شو الفلو كامل؟",
          "شو بصير من البداية للنهاية؟",
        ],
        answer:
          "تسلسل خدمة التوصيل الكامل: الفاتورة → Tasks → مهمة التوصيل → Appointment From / Appointment To → جدولة التوصيل → حجز الموعد → تعيين السائق → Task Forms → بوابة السائق → Start → رفع صورة التنفيذ → End Task → OTP → Completed.",
        relatedTerms: [
          "تسلسل",
          "تسلسل الخدمات",
          "تسلسل الخدمة",
          "تسلسل خدمة التوصيل",
          "ترتيب الخدمات",
          "ترتيب الخدمة",
          "ترتيب الخطوات",
          "مراحل",
          "مراحل الخدمة",
          "مراحل التوصيل",
          "دورة الخدمة",
          "دورة التوصيل",
          "السايكل",
          "الفلو",
          "workflow",
          "cycle",
          "sequence",
          "من البداية للنهاية",
          "الفاتورة",
          "Tasks",
          "مهمة التوصيل",
          "Appointment From",
          "Appointment To",
          "جدولة التوصيل",
          "حجز الموعد",
          "تعيين السائق",
          "Task Forms",
          "بوابة السائق",
          "Start",
          "رفع صورة التنفيذ",
          "End Task",
          "OTP",
          "Completed",
        ],
      },
      {
        id: "assign-vs-assignees",
        questions: ["شو الفرق بين Assign و Assignees؟", "ما الفرق بين Assign و Assignees؟"],
        answer:
          "Assignees هو المشرف المسؤول عن متابعة المهمة والإشراف على تنفيذها. Assign هو الشخص المنفذ فعليًا للخدمة، وفي خدمة التوصيل يكون السائق.",
        relatedTerms: ["Assign", "Assignees", "المشرف", "السائق", "منفذ الخدمة"],
      },
      {
        id: "driver-assignment-to-completion-question",
        questions: [
          "شو بصير من وقت تعيين السائق لحد انتهاء التوصيل؟",
          "ماذا يحدث من وقت تعيين السائق حتى انتهاء التوصيل؟",
        ],
        answer:
          "من وقت تعيين السائق حتى اكتمال التوصيل: تصل المهمة إلى Stage = تعيين سائق، ويتم تفعيل Task Forms وظهور نموذج سند التحميل، ثم ينفذ السائق الخدمة من بوابة السائق عبر Start، ثم رفع صورة التنفيذ، ثم End Task، ثم OTP Confirmation، وبعد تأكيد الرمز تتحول المهمة إلى Completed.",
        relatedTerms: ["تعيين السائق", "انتهاء التوصيل", "بوابة السائق", "Task Forms", "Start", "رفع الصورة", "End Task", "OTP", "Completed"],
      },
    ],
    relationships: [
      { from: "Invoice", relation: "creates/links to", to: "Task", description: "الفاتورة التي تحتوي على خدمة التوصيل ترتبط بمهمة التوصيل." },
      { from: "Task", relation: "belongs to", to: "Project", description: "مهمة التوصيل تنتمي إلى Project = خدمة التوصيل." },
      { from: "Assignees", relation: "supervises", to: "Task", description: "Assignees هو المشرف المسؤول عن متابعة المهمة والإشراف عليها." },
      { from: "Assign", relation: "executes", to: "Task", description: "Assign هو منفذ الخدمة فعليًا، وفي التوصيل يكون السائق." },
      {
        from: "Appointment From + Appointment To",
        relation: "define",
        to: "Allowed Booking Window",
        description: "Appointment From و Appointment To يحددان الفترة المسموح خلالها بحجز موعد التوصيل.",
      },
      {
        from: "Allowed Booking Window",
        relation: "constrains",
        to: "Available Appointment Selection",
        description: "المواعيد المتاحة للحجز تظهر ضمن الفترة المحددة مسبقًا.",
      },
      {
        from: "Driver Assignment",
        relation: "enables",
        to: "Driver Task Form",
        description: "عند مرحلة تعيين سائق يتم تفعيل Task Forms المرتبطة بالمهمة.",
      },
      {
        from: "Driver Assignment",
        relation: "followed by",
        to: "Driver Portal Execution",
        description:
          "بعد تعيين السائق، يستكمل تنفيذ التوصيل من بوابة السائق عبر Start ثم رفع صورة التنفيذ ثم End Task ثم OTP Confirmation ثم Completed.",
      },
      {
        from: "Delivery Task Form",
        relation: "contains",
        to: "Loading Document Form",
        description: "في خدمة التوصيل يظهر نموذج سند التحميل ضمن Task Forms.",
      },
      {
        from: "Driver Portal",
        relation: "execution sequence",
        to: "Start → Upload Photo → End Task → OTP Confirmation → Completed",
        description: "تنفيذ التوصيل من بوابة السائق يبدأ بـ Start ثم رفع الصورة ثم End Task ثم OTP ثم Completed.",
      },
    ],
    businessRules: [
      {
        id: "BR-INTRO-001",
        title: "نافذة حجز الموعد",
        rule: "يجب أن يكون حجز موعد التوصيل ضمن الفترة المحددة بين Appointment From و Appointment To.",
        relatedTerms: ["Appointment From", "Appointment To", "فترة الحجز", "موعد التوصيل"],
      },
    ],
    glossary: [
      { term: "Operations", definition: "مؤشر يظهر في الفاتورة بقيمة 1 ضمن العناصر المرتبطة بالخدمة.", relatedTerms: ["Operation", "Operations"] },
      { term: "Tasks", definition: "Tasks هو الزر المستخدم للوصول إلى مهمة التوصيل المرتبطة بالفاتورة، ومن خلاله يمكن عرض تفاصيل الخدمة المرتبطة بها.", relatedTerms: ["Tasks", "زر Tasks", "التاسك", "المهمة", "مهمة التوصيل", "تفاصيل المهمة", "تفاصيل الخدمة", "الفاتورة"] },
      { term: "Services", definition: "مؤشر يظهر في الفاتورة بقيمة 1 ضمن العناصر المرتبطة بالخدمة.", relatedTerms: ["Service", "Services", "خدمة"] },
      { term: "Allowed Booking Window", definition: "الفترة التي يحددها Appointment From و Appointment To لحجز موعد التوصيل.", relatedTerms: ["فترة الحجز", "نافذة الحجز"] },
      { term: "Loading Document Form", definition: "نموذج سند التحميل الذي يظهر في خدمة التوصيل ضمن Task Forms.", relatedTerms: ["نموذج سند تحميل", "نموذج سند التحميل"] },
      { term: "Driver Portal", definition: "بوابة السائق التي يتم من خلالها تنفيذ خدمة التوصيل بعد تعيين السائق.", relatedTerms: ["بوابة السائق", "رابط بوابة المهمة"] },
      { term: "شو بصير", definition: "صيغة سؤال عامية تعني: ماذا يحدث.", relatedTerms: ["ماذا يحدث", "ما الذي يحدث"] },
      { term: "لحد", definition: "صيغة عامية تعني: حتى.", relatedTerms: ["حتى", "إلى أن"] },
    ],
  },
};

function buildPageContext(pageId) {
  const knowledge = pageKnowledge[pageId];

  if (!knowledge) {
    return "";
  }

  return [
    `PAGE ID: ${knowledge.id}`,
    `TITLE: ${knowledge.title}`,
    `SCOPE: ${knowledge.scope}`,
    "",
    "DIRECTLY SUPPORTED QUESTIONS:",
    ...knowledge.supportedQuestions.map((item) =>
      [`- ${item.questions.join(" / ")}`, `  Answer: ${item.answer}`, `  Related terms: ${item.relatedTerms.join(", ")}`].join("\n"),
    ),
    "",
    "ENTITIES:",
    ...Object.entries(knowledge.entities).map(([id, entity]) =>
      [`- ${entity.name} (${id}): ${entity.description}`, entity.examples ? `  Examples: ${entity.examples.join(", ")}` : ""]
        .filter(Boolean)
        .join("\n"),
    ),
    "",
    "FIELDS:",
    ...Object.entries(knowledge.fields).map(([name, field]) =>
      [
        `- ${name}: ${field.meaning}`,
        field.deliveryMeaning ? `  Delivery meaning: ${field.deliveryMeaning}` : "",
        field.deliveryExample ? `  Delivery example: ${field.deliveryExample}` : "",
        field.valueShown ? `  Value shown: ${field.valueShown}` : "",
        field.examples ? `  Examples: ${field.examples.join(", ")}` : "",
        field.relatedTerms ? `  Related terms: ${field.relatedTerms.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    "",
    "STAGES AND SCREENS:",
    ...knowledge.stages.map((stage) =>
      [
        `${String(stage.order).padStart(2, "0")} - ${stage.title}`,
        `Screen: ${stage.screen}`,
        `Summary: ${stage.summary}`,
        ...(stage.facts || []).map((fact) => `Fact: ${fact}`),
        ...(stage.subSteps || []).map((subStep) => `Sub-step: ${subStep.title} - ${subStep.summary}`),
      ].join("\n"),
    ),
    "",
    "WORKFLOW:",
    ...knowledge.workflow.map((step) =>
      [
        `${String(step.order).padStart(2, "0")} - ${step.action}`,
        step.sequence ? `Sequence: ${step.sequence.join(" → ")}` : "",
        `Outcome: ${step.outcome}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    "",
    "RELATIONSHIPS:",
    ...knowledge.relationships.map((relationship) => `- ${relationship.from} ${relationship.relation} ${relationship.to}: ${relationship.description}`),
    "",
    "SEQUENCES:",
    ...knowledge.sequences.map((sequence) =>
      [
        `- ${sequence.title}`,
        `  Start: ${sequence.start}`,
        `  End: ${sequence.end}`,
        ...sequence.steps.map((step) => `  Step: ${step}`),
        `  Related terms: ${sequence.relatedTerms.join(", ")}`,
      ].join("\n"),
    ),
    "",
    "BUSINESS RULES:",
    ...knowledge.businessRules.map((rule) => `- ${rule.id} ${rule.title}: ${rule.rule}`),
    "",
    "GLOSSARY:",
    ...knowledge.glossary.map((item) => `- ${item.term}: ${item.definition}`),
  ].join("\n");
}

function buildKnowledgeChunks(pageId) {
  const knowledge = pageKnowledge[pageId];

  if (!knowledge) {
    return [];
  }

  const chunks = [];
  const addChunk = ({ id, type, title, text, relatedTerms = [], stageId = null }) => {
    chunks.push({ id, pageId, type, title, text, relatedTerms, stageId });
  };

  addChunk({
    id: `${pageId}:page:overview`,
    type: "page",
    title: knowledge.title,
    text: [knowledge.title, knowledge.scope].filter(Boolean).join("\n"),
    relatedTerms: ["جولة تعريفية", "الشاشات", "Odoo", "دورة العمل", "تدريب تنفيذي تفصيلي"],
  });

  for (const [fieldName, field] of Object.entries(knowledge.fields)) {
    addChunk({
      id: `${pageId}:field:${slugify(fieldName)}`,
      type: "field",
      title: fieldName,
      text: [
        `${fieldName}: ${field.meaning}`,
        field.deliveryMeaning,
        field.deliveryExample ? `مثال في خدمة التوصيل: ${field.deliveryExample}` : "",
        field.valueShown ? `القيمة المعروضة: ${field.valueShown}` : "",
        field.examples ? `أمثلة: ${field.examples.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      relatedTerms: field.relatedTerms || [],
    });
  }

  for (const stage of knowledge.stages) {
    addChunk({
      id: `${pageId}:stage:${stage.id}`,
      type: "stage",
      title: stage.title,
      text: [
        `${String(stage.order).padStart(2, "0")} - ${stage.title}`,
        stage.screen,
        stage.summary,
        ...(stage.facts || []),
        ...(stage.subSteps || []).map((subStep) => `${subStep.title}: ${subStep.summary}`),
      ].join("\n"),
      relatedTerms: stage.relatedTerms || [],
      stageId: stage.id,
    });

    for (const subStep of stage.subSteps || []) {
      addChunk({
        id: `${pageId}:stage:${stage.id}:substep:${subStep.id}`,
        type: "stage",
        title: subStep.title,
        text: `${stage.title} / ${subStep.title}: ${subStep.summary}`,
        relatedTerms: subStep.relatedTerms || [],
        stageId: stage.id,
      });
    }
  }

  for (const step of knowledge.workflow) {
    addChunk({
      id: `${pageId}:workflow:${step.stageId}`,
      type: "workflow",
      title: step.action,
      text: [step.action, step.sequence ? `التسلسل: ${step.sequence.join(" → ")}` : "", `النتيجة: ${step.outcome}`]
        .filter(Boolean)
        .join("\n"),
      relatedTerms: [step.action, step.outcome, ...(step.sequence || [])],
      stageId: step.stageId,
    });
  }

  for (const sequence of knowledge.sequences) {
    addChunk({
      id: `${pageId}:workflow-sequence:${sequence.id}`,
      type: "workflow",
      title: sequence.title,
      text: [
        `${sequence.title}.`,
        `البداية: ${sequence.start}.`,
        `النهاية: ${sequence.end}.`,
        ...sequence.steps.map((step) => `- ${step}`),
      ].join("\n"),
      relatedTerms: sequence.relatedTerms || [],
    });
  }

  for (const item of knowledge.supportedQuestions) {
    addChunk({
      id: `${pageId}:workflow-question:${item.id}`,
      type: "workflow",
      title: item.questions[0],
      text: [`أسئلة مدعومة: ${item.questions.join(" / ")}`, `الإجابة: ${item.answer}`].join("\n"),
      relatedTerms: item.relatedTerms || [],
    });
  }

  for (const [index, relationship] of knowledge.relationships.entries()) {
    addChunk({
      id: `${pageId}:relationship:${index + 1}`,
      type: "relationship",
      title: `${relationship.from} ${relationship.relation} ${relationship.to}`,
      text: relationship.description,
      relatedTerms: [relationship.from, relationship.relation, relationship.to],
    });
  }

  for (const rule of knowledge.businessRules) {
    addChunk({
      id: `${pageId}:business-rule:${rule.id}`,
      type: "business-rule",
      title: rule.title,
      text: rule.rule,
      relatedTerms: rule.relatedTerms || [],
    });
  }

  for (const item of knowledge.glossary) {
    addChunk({
      id: `${pageId}:glossary:${slugify(item.term)}`,
      type: "glossary",
      title: item.term,
      text: item.definition,
      relatedTerms: item.relatedTerms || [],
    });
  }

  return chunks;
}

function findSupportedAnswer(pageId, question) {
  const knowledge = pageKnowledge[pageId];

  if (!knowledge || typeof question !== "string") {
    return "";
  }

  const normalizedQuestion = normalizeText(question);
  const naturalAnswer = findNaturalSupportedAnswer(pageId, normalizedQuestion);

  if (naturalAnswer) {
    return naturalAnswer;
  }

  return (
    knowledge.supportedQuestions.find((item) =>
      item.questions.some((supportedQuestion) => normalizeText(supportedQuestion) === normalizedQuestion),
    )?.answer || ""
  );
}

function findNaturalSupportedAnswer(pageId, normalizedQuestion) {
  if (pageId !== "intro-tour") {
    return "";
  }

  if (SERVICE_DELIVERY_QUESTIONS.has(normalizedQuestion)) {
    return "خدمة التوصيل هي الخدمة المرتبطة بمهمة التوصيل، ويتم تنفيذها من خلال بوابة السائق بعد تعيين السائق، ثم يبدأ التنفيذ عبر Start، وترفع صورة التنفيذ، ثم End Task، ثم تأكيد العميل عبر OTP، وبعدها تكتمل المهمة Completed.";
  }

  return "";
}

function normalizeText(value) {
  return String(value)
    .trim()
    .replace(/[؟?]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const SERVICE_DELIVERY_QUESTIONS = new Set(
  ["شو هي خدمة التوصيل؟", "ما هي خدمة التوصيل؟", "ايش هي خدمة التوصيل؟"].map(normalizeText),
);

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = { pageKnowledge, buildPageContext, buildKnowledgeChunks, findSupportedAnswer };
