const pageKnowledge = {
  "intro-tour": {
    "id": "intro-tour",
    "title": "دورة عمل خدمة التوصيل",
    "scope": "هذه الصفحة تعرض دورة عمل خدمة التوصيل كمسار تنفيذي يبدأ بوصول الفاتورة من SAP إلى Odoo، ثم الانتقال من الفاتورة إلى مهمة التوصيل، وتحديد المشرف وفترة الحجز، وإرسال رابط العميل، وحجز الموعد، وتعيين السائق، وتنفيذ التوصيل من بوابة السائق حتى OTP و Completed.",
    "entities": {
      "invoice": {
        "name": "الفاتورة",
        "description": "الفاتورة التي تصل من SAP إلى Odoo وتحتوي على خدمة التوصيل. منها يفتح المستخدم زر Tasks للوصول إلى مهمة التوصيل المرتبطة.",
        "examples": [
          "INV/2026/00129",
          "أجور توصيل الرياض - جنوب الرياض"
        ],
        "relatedTerms": [
          "فاتورة",
          "Invoice",
          "رقم الفاتورة"
        ]
      },
      "task": {
        "name": "المهمة",
        "description": "مهمة التوصيل المرتبطة بالفاتورة، وتظهر في Odoo لمتابعة الخدمة من مرحلة طلب توصيل حتى Completed.",
        "examples": [
          "INV/2026/00129 - 1"
        ],
        "relatedTerms": [
          "Task",
          "مهمة",
          "مهمة التوصيل"
        ]
      },
      "project": {
        "name": "Project",
        "description": "Project يوضح أن المهمة ضمن خدمة التوصيل، ويساعد المستخدم على التأكد من أنه يعمل على المهمة الصحيحة.",
        "examples": [
          "خدمة التوصيل"
        ],
        "relatedTerms": [
          "Project",
          "المشروع",
          "نوع الخدمة"
        ]
      },
      "driver": {
        "name": "السائق",
        "description": "الشخص المنفذ فعليًا لخدمة التوصيل عند تعيينه في حقل Assign.",
        "relatedTerms": [
          "السائق",
          "منفذ الخدمة",
          "المنفذ",
          "Assign"
        ]
      },
      "customer": {
        "name": "العميل",
        "description": "الشخص الذي تظهر بياناته الأساسية أثناء حجز موعد التوصيل ويمكنه تحديد موقع تنفيذ الخدمة.",
        "relatedTerms": [
          "العميل",
          "بيانات العميل",
          "موقع التنفيذ"
        ]
      },
      "driverPortal": {
        "name": "بوابة السائق",
        "description": "البوابة التي يفتحها السائق بعد تعيينه لتنفيذ خدمة التوصيل عبر Start، ثم رفع صورة التنفيذ، ثم End Task، ثم تأكيد OTP حتى تصبح المهمة Completed.",
        "relatedTerms": [
          "بوابة السائق",
          "رابط بوابة المهمة",
          "Driver Portal"
        ]
      },
      "sap": {
        "name": "SAP",
        "description": "مصدر الفاتورة قبل وصولها إلى Odoo. تبدأ دورة خدمة التوصيل عندما تصل الفاتورة من SAP إلى Odoo وبداخلها خدمة التوصيل.",
        "relatedTerms": [
          "SAP",
          "مصدر الفاتورة",
          "الفاتورة من SAP"
        ]
      }
    },
    "fields": {
      "Project": {
        "meaning": "يستخدم Project داخل المهمة للتأكد من أن المسار الحالي خاص بخدمة التوصيل.",
        "valueShown": "خدمة التوصيل",
        "relatedTerms": [
          "Project",
          "المشروع",
          "نوع الخدمة",
          "خدمة التوصيل"
        ]
      },
      "Tasks": {
        "meaning": "Tasks هو زر الانتقال من الفاتورة إلى مهمة التوصيل المرتبطة بها داخل Odoo.",
        "relatedTerms": [
          "Tasks",
          "زر Tasks",
          "التاسك",
          "المهمة",
          "مهمة التوصيل",
          "تفاصيل المهمة",
          "تفاصيل الخدمة",
          "الفاتورة"
        ]
      },
      "Assignees": {
        "meaning": "يتم تحديد Assignees كمشرف مسؤول عن متابعة عملية التوصيل والإشراف عليها حتى اكتمالها.",
        "relatedTerms": [
          "Assignees",
          "المشرف",
          "المسؤول عن المتابعة",
          "مشرف الخدمة"
        ]
      },
      "Assign": {
        "meaning": "يتم استخدام Assign لتحديد منفذ الخدمة الفعلي.",
        "deliveryMeaning": "في خدمة التوصيل يكون Assign هو السائق الذي ينفذ التوصيل من بوابة السائق.",
        "relatedTerms": [
          "Assign",
          "السائق",
          "المنفذ",
          "منفذ الخدمة"
        ]
      },
      "Stage": {
        "meaning": "Stage يوضح أين وصلت مهمة التوصيل داخل المسار، مثل طلب توصيل أو تعيين سائق أو Completed.",
        "examples": [
          "طلب توصيل",
          "جدولة التوصيل",
          "تعيين سائق",
          "جاري التوصيل",
          "تم التوصيل"
        ],
        "relatedTerms": [
          "Stage",
          "المرحلة",
          "حالة المرحلة"
        ]
      },
      "Trip Date": {
        "meaning": "Trip Date يساعد في متابعة تاريخ الرحلة أو التنفيذ المخطط ضمن مهمة التوصيل.",
        "relatedTerms": [
          "Trip Date",
          "تاريخ الرحلة",
          "تاريخ التنفيذ"
        ]
      },
      "Appointment From": {
        "meaning": "Appointment From يحدد بداية الفترة التي يسمح للعميل خلالها بحجز موعد التوصيل.",
        "relatedTerms": [
          "Appointment From",
          "بداية الحجز",
          "بداية فترة الحجز",
          "تاريخ بداية الحجز"
        ]
      },
      "Appointment To": {
        "meaning": "Appointment To يحدد نهاية الفترة التي يسمح للعميل خلالها بحجز موعد التوصيل.",
        "relatedTerms": [
          "Appointment To",
          "نهاية الحجز",
          "نهاية فترة الحجز",
          "تاريخ نهاية الحجز"
        ]
      },
      "Invoice": {
        "meaning": "Invoice هو رقم الفاتورة المرتبطة بمهمة التوصيل، ويستخدم للرجوع إلى أصل المهمة القادم من SAP إلى Odoo.",
        "valueShown": "INV/2026/00129",
        "relatedTerms": [
          "Invoice",
          "الفاتورة",
          "رقم الفاتورة"
        ]
      },
      "Source Invoice": {
        "meaning": "Source Invoice يربط مهمة التوصيل بالفاتورة المصدر التي بدأت منها دورة الخدمة.",
        "valueShown": "INV/2026/00129",
        "relatedTerms": [
          "Source Invoice",
          "الفاتورة المصدر"
        ]
      },
      "Task Forms": {
        "meaning": "Task Forms تصبح متاحة عند تجهيز مهمة التوصيل للسائق، ومنها يظهر نموذج سند التحميل المطلوب أثناء التنفيذ.",
        "deliveryExample": "نموذج سند التحميل",
        "relatedTerms": [
          "Task Forms",
          "نماذج المهمة",
          "نموذج سند تحميل",
          "نموذج سند التحميل"
        ]
      },
      "Start": {
        "meaning": "Start هو الخيار الذي يستخدمه السائق في بوابة السائق لبدء تنفيذ خدمة التوصيل.",
        "relatedTerms": [
          "Start",
          "بدء المهمة",
          "تشغيل المهمة"
        ]
      },
      "End Task": {
        "meaning": "End Task يستخدمه السائق بعد تنفيذ التوصيل ورفع صورة التنفيذ للانتقال إلى تأكيد الاستلام.",
        "relatedTerms": [
          "End Task",
          "إنهاء المهمة"
        ]
      },
      "OTP": {
        "meaning": "OTP هو رمز يرسل إلى العميل بعد End Task لتأكيد استلام خدمة التوصيل.",
        "relatedTerms": [
          "OTP",
          "رمز التأكيد",
          "رمز الاستلام",
          "تأكيد الاستلام"
        ]
      },
      "Completed": {
        "meaning": "Completed هي الحالة النهائية بعد تأكيد OTP بنجاح وتسجيل اكتمال خدمة التوصيل.",
        "relatedTerms": [
          "Completed",
          "اكتمال التوصيل",
          "تم التوصيل"
        ]
      }
    },
    "stages": [
      {
        "id": "invoice",
        "order": 1,
        "title": "وصول الفاتورة من SAP",
        "screen": "شاشة فاتورة Odoo",
        "summary": "تبدأ الدورة بوصول الفاتورة من SAP إلى Odoo، ثم يفتح المستخدم الفاتورة التي تحتوي على خدمة التوصيل.",
        "facts": [
          "تصل الفاتورة من SAP إلى Odoo وبداخلها خدمة التوصيل.",
          "رقم الفاتورة المعروض هو INV/2026/00129.",
          "الخدمة الموجودة في الفاتورة هي أجور توصيل الرياض - جنوب الرياض.",
          "يستخدم المستخدم زر Tasks للانتقال من الفاتورة إلى مهمة التوصيل المرتبطة بها."
        ],
        "relatedTerms": [
          "SAP",
          "Odoo",
          "الفاتورة",
          "Invoice",
          "Tasks",
          "خدمة التوصيل"
        ]
      },
      {
        "id": "linked-tasks",
        "order": 2,
        "title": "الوصول إلى مهمة التوصيل",
        "screen": "شاشة مهام Odoo",
        "summary": "من زر Tasks تظهر مهمة التوصيل المرتبطة بالفاتورة ليبدأ المستخدم متابعة تنفيذ الخدمة.",
        "facts": [
          "اسم المهمة هو INV/2026/00129 - 1.",
          "Project يوضح أن المهمة ضمن خدمة التوصيل.",
          "Stage في بداية المسار تكون طلب توصيل.",
          "Tasks هو نقطة الانتقال العملية من الفاتورة إلى مهمة التوصيل."
        ],
        "relatedTerms": [
          "Tasks",
          "Task",
          "مهمة التوصيل",
          "Project",
          "Stage",
          "طلب توصيل"
        ]
      },
      {
        "id": "task-details",
        "order": 3,
        "title": "ظهور المهمة في طلب توصيل",
        "screen": "شاشة تفاصيل مهمة التوصيل",
        "summary": "تظهر مهمة التوصيل في مرحلة طلب توصيل، وهي بداية دورة التنفيذ داخل Odoo.",
        "facts": [
          "تظهر المهمة في Stage طلب توصيل بعد إنشائها من الفاتورة.",
          "Project يؤكد أن المهمة خاصة بخدمة التوصيل.",
          "Invoice و Source Invoice يربطان المهمة بالفاتورة الأصلية."
        ],
        "relatedTerms": [
          "طلب توصيل",
          "Stage",
          "Project",
          "Invoice",
          "Source Invoice"
        ]
      },
      {
        "id": "supervisor",
        "order": 4,
        "title": "تحديد المشرف المسؤول",
        "screen": "حقول المتابعة داخل مهمة التوصيل",
        "summary": "يتم تحديد المشرف المسؤول عن متابعة عملية التوصيل والإشراف عليها، مع تمييزه عن السائق المنفذ.",
        "facts": [
          "Assignees هو المشرف المسؤول عن متابعة المهمة.",
          "Assign هو منفذ الخدمة الفعلي، وفي خدمة التوصيل يكون السائق.",
          "Trip Date يساعد في متابعة تاريخ الرحلة أو التنفيذ المخطط."
        ],
        "relatedTerms": [
          "Assignees",
          "Assign",
          "المشرف",
          "السائق",
          "Trip Date"
        ]
      },
      {
        "id": "appointment-window",
        "order": 5,
        "title": "تحديد فترة حجز الموعد",
        "screen": "حقول Appointment From و Appointment To",
        "summary": "يتم تحديد الفترة التي يسمح للعميل خلالها باختيار موعد تنفيذ خدمة التوصيل.",
        "facts": [
          "Appointment From يحدد بداية فترة الحجز المتاحة للعميل.",
          "Appointment To يحدد نهاية فترة الحجز المتاحة للعميل.",
          "يجب أن يكون موعد العميل ضمن الفترة المحددة مسبقًا."
        ],
        "relatedTerms": [
          "Appointment From",
          "Appointment To",
          "فترة الحجز",
          "موعد التوصيل"
        ]
      },
      {
        "id": "delivery-scheduling",
        "order": 6,
        "title": "إرسال رابط الحجز للعميل",
        "screen": "مرحلة جدولة التوصيل ورابط حجز الموعد",
        "summary": "بعد حفظ فترة الحجز يظهر رابط حجز الموعد، ويمكن إرساله إلى العميل لاستكمال بيانات الموعد.",
        "facts": [
          "يظهر رابط حجز الموعد بعد تجهيز بيانات الخدمة وفترة الحجز.",
          "يفتح العميل الرابط لاختيار الموقع والتاريخ والوقت.",
          "يمكن لخدمة العملاء حجز الموعد نيابة عن العميل عند الحاجة."
        ],
        "relatedTerms": [
          "رابط حجز الموعد",
          "جدولة التوصيل",
          "العميل",
          "خدمة العملاء"
        ]
      },
      {
        "id": "appointment-booking",
        "order": 7,
        "title": "حجز موعد التوصيل",
        "screen": "شاشات حجز موعد التوصيل",
        "summary": "تعرض مراحل حجز موعد التوصيل بدءًا من اختيار الموعد وحتى تأكيد الحجز.",
        "subSteps": [
          {
            "id": "date-time-selection",
            "title": "اختيار التاريخ والوقت",
            "summary": "تظهر المواعيد المتاحة للحجز ضمن الفترة المحددة مسبقًا بين تاريخ بداية الحجز وتاريخ نهايته، ويختار المستخدم التاريخ والوقت المناسبين لموعد التوصيل.",
            "relatedTerms": [
              "اختيار الموعد",
              "التاريخ والوقت",
              "المواعيد المتاحة"
            ]
          },
          {
            "id": "customer-location",
            "title": "بيانات العميل وموقع التنفيذ",
            "summary": "يقوم العميل بإدخال اسمه والبريد الإلكتروني ورقم الجوال، ثم يحدد موقع تنفيذ الخدمة على الخريطة قبل تأكيد الموعد.",
            "relatedTerms": [
              "بيانات العميل",
              "الاسم",
              "البريد الإلكتروني",
              "رقم الجوال",
              "الخريطة",
              "موقع التنفيذ"
            ]
          },
          {
            "id": "appointment-confirmation",
            "title": "تأكيد الموعد",
            "summary": "تعرض تفاصيل الموعد بعد إتمام الحجز للتأكد من تسجيل موعد التوصيل بنجاح.",
            "relatedTerms": [
              "تأكيد الموعد",
              "تفاصيل الموعد",
              "تسجيل الموعد"
            ]
          }
        ],
        "relatedTerms": [
          "حجز موعد التوصيل",
          "اختيار الموعد",
          "بيانات العميل",
          "تأكيد الموعد"
        ]
      },
      {
        "id": "driver-assignment-task-form",
        "order": 8,
        "title": "تعيين السائق وتجهيز المهمة",
        "screen": "مرحلة تعيين سائق وتبويب Task Forms",
        "summary": "بعد تأكيد الموعد يتم تعيين السائق وتجهيز المهمة، وتصبح Task Forms مثل سند التحميل متاحة للتنفيذ.",
        "facts": [
          "تصل المهمة إلى مرحلة تعيين سائق بعد تأكيد العميل للموعد.",
          "يتم تحديد السائق المسؤول عن تنفيذ خدمة التوصيل في Assign.",
          "تظهر Task Forms ويصبح نموذج سند التحميل متاحًا ضمن المهمة."
        ],
        "relatedTerms": [
          "تعيين سائق",
          "Assign",
          "Task Forms",
          "نموذج سند التحميل",
          "السائق"
        ]
      },
      {
        "id": "driver-portal-execution",
        "order": 9,
        "title": "تنفيذ التوصيل من بوابة السائق",
        "screen": "بوابة السائق",
        "summary": "تعرض رحلة تنفيذ خدمة التوصيل من خلال بوابة السائق.",
        "subSteps": [
          {
            "id": "start-task",
            "title": "بدء المهمة",
            "summary": "بعد تعيين السائق، يصل إليه رابط بوابة المهمة. يفتح السائق الرابط ويضغط على Start لبدء تنفيذ خدمة التوصيل.",
            "relatedTerms": [
              "Start",
              "بدء المهمة",
              "رابط بوابة المهمة"
            ]
          },
          {
            "id": "upload-photo",
            "title": "رفع صورة التنفيذ",
            "summary": "بعد بدء المهمة، يظهر للسائق قسم رفع الصور لتوثيق تنفيذ الخدمة.",
            "relatedTerms": [
              "رفع الصورة",
              "رفع الصور",
              "توثيق تنفيذ الخدمة"
            ]
          },
          {
            "id": "end-task",
            "title": "إنهاء المهمة",
            "summary": "بعد رفع الصورة المطلوبة، تصبح المهمة جاهزة للإنهاء ويظهر خيار End Task.",
            "relatedTerms": [
              "End Task",
              "إنهاء المهمة"
            ]
          },
          {
            "id": "otp-confirmation",
            "title": "تأكيد الاستلام عبر OTP",
            "summary": "عند إنهاء المهمة، يتم إرسال رمز تأكيد إلى العميل، ويُستخدم الرمز لتأكيد استلام الخدمة.",
            "relatedTerms": [
              "OTP",
              "رمز التأكيد",
              "رمز الاستلام",
              "تأكيد العميل",
              "تأكيد الاستلام"
            ]
          },
          {
            "id": "completed-delivery",
            "title": "اكتمال التوصيل",
            "summary": "بعد تأكيد الرمز بنجاح، تتحول المهمة إلى Completed ويُسجل اكتمال خدمة التوصيل وتأكيد العميل.",
            "relatedTerms": [
              "Completed",
              "اكتمال التوصيل",
              "تم التوصيل",
              "تأكيد العميل"
            ]
          }
        ],
        "relatedTerms": [
          "بوابة السائق",
          "Start",
          "رفع الصورة",
          "End Task",
          "OTP",
          "Completed"
        ]
      }
    ],
    "workflow": [
      {
        "order": 1,
        "stageId": "invoice",
        "action": "وصول الفاتورة من SAP إلى Odoo",
        "outcome": "فتح الفاتورة التي تحتوي على خدمة التوصيل"
      },
      {
        "order": 2,
        "stageId": "linked-tasks",
        "action": "استخدام Tasks للوصول إلى مهمة التوصيل",
        "outcome": "ظهور مهمة التوصيل المرتبطة بالفاتورة"
      },
      {
        "order": 3,
        "stageId": "task-details",
        "action": "ظهور المهمة في طلب توصيل",
        "outcome": "بدء متابعة تنفيذ خدمة التوصيل داخل Odoo"
      },
      {
        "order": 4,
        "stageId": "supervisor",
        "action": "تحديد المشرف المسؤول",
        "outcome": "تعيين مسؤول متابعة العملية عبر Assignees"
      },
      {
        "order": 5,
        "stageId": "appointment-window",
        "action": "تحديد فترة حجز الموعد",
        "outcome": "حفظ الفترة المسموحة للعميل بين Appointment From و Appointment To"
      },
      {
        "order": 6,
        "stageId": "delivery-scheduling",
        "action": "إرسال رابط الحجز للعميل",
        "outcome": "تمكين العميل من اختيار الموقع والموعد"
      },
      {
        "order": 7,
        "stageId": "appointment-booking",
        "action": "حجز العميل للموعد",
        "sequence": [
          "تحديد الموقع",
          "اختيار التاريخ والوقت",
          "تأكيد الموعد"
        ],
        "outcome": "تسجيل موعد التوصيل بنجاح"
      },
      {
        "order": 8,
        "stageId": "driver-assignment-task-form",
        "action": "تعيين السائق وتجهيز المهمة",
        "outcome": "تفعيل Task Forms وظهور نموذج سند التحميل"
      },
      {
        "order": 9,
        "stageId": "driver-portal-execution",
        "action": "تنفيذ التوصيل من بوابة السائق",
        "sequence": [
          "Start",
          "رفع صورة التنفيذ",
          "End Task",
          "إرسال OTP",
          "تأكيد OTP",
          "Completed"
        ],
        "outcome": "اكتمال خدمة التوصيل وتأكيد العميل"
      }
    ],
    "sequences": [
      {
        "id": "full-delivery-workflow",
        "title": "تسلسل خدمة التوصيل الكامل",
        "start": "SAP إلى Odoo",
        "end": "Completed",
        "steps": [
          "تصل الفاتورة من SAP إلى Odoo.",
          "يفتح المستخدم الفاتورة التي تحتوي على خدمة التوصيل.",
          "يستخدم المستخدم زر Tasks للوصول إلى مهمة التوصيل المرتبطة بالفاتورة.",
          "تظهر المهمة في مرحلة طلب توصيل.",
          "يتم تحديد المشرف المسؤول عن متابعة العملية في Assignees.",
          "يتم تحديد الفترة المسموحة لحجز الموعد بين Appointment From و Appointment To.",
          "يتم إنشاء رابط حجز الموعد وإرساله إلى العميل.",
          "يختار العميل الموقع والتاريخ والوقت ثم يؤكد الموعد.",
          "يتم تعيين السائق المسؤول عن التنفيذ في Assign.",
          "تظهر Task Forms ويصبح نموذج سند التحميل متاحًا.",
          "يفتح السائق بوابة السائق.",
          "يضغط السائق Start لبدء التنفيذ.",
          "يرفع السائق صورة التنفيذ.",
          "يضغط السائق End Task بعد التنفيذ.",
          "يرسل النظام OTP إلى العميل.",
          "يتم تأكيد OTP.",
          "تصبح المهمة Completed."
        ],
        "relatedTerms": [
          "SAP",
          "Odoo",
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
          "Completed"
        ]
      },
      {
        "id": "driver-assignment-to-completion",
        "title": "من تعيين السائق حتى اكتمال التوصيل",
        "start": "تعيين السائق",
        "end": "اكتمال التوصيل",
        "steps": [
          "تصل المهمة إلى مرحلة تعيين سائق ويتم تعيين السائق المسؤول عن تنفيذ خدمة التوصيل.",
          "يتم تفعيل Task Forms المرتبطة بالمهمة ويظهر نموذج سند التحميل في خدمة التوصيل.",
          "ينفذ السائق خدمة التوصيل من بوابة السائق.",
          "يفتح السائق رابط بوابة المهمة ويضغط على Start لبدء تنفيذ خدمة التوصيل.",
          "يرفع السائق صورة التنفيذ لتوثيق تنفيذ الخدمة.",
          "بعد رفع الصورة المطلوبة يظهر خيار End Task.",
          "عند إنهاء المهمة، يتم إرسال رمز OTP إلى العميل لتأكيد استلام الخدمة.",
          "بعد تأكيد رمز OTP بنجاح، تتحول المهمة إلى Completed ويُسجل اكتمال خدمة التوصيل وتأكيد العميل."
        ],
        "relatedTerms": [
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
          "Completed"
        ]
      }
    ],
    "supportedQuestions": [
      {
        "id": "full-delivery-workflow-question",
        "questions": [
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
          "شو بصير من البداية للنهاية؟"
        ],
        "answer": "تسلسل خدمة التوصيل الكامل: الفاتورة → Tasks → مهمة التوصيل → Appointment From → Appointment To → جدولة التوصيل → حجز الموعد → تعيين السائق → Task Forms → بوابة السائق → Start → رفع صورة التنفيذ → End Task → OTP → Completed. تبدأ الدورة بوصول الفاتورة من SAP إلى Odoo، ثم يفتح المستخدم الفاتورة، يرسل رابط الحجز للعميل، يؤكد العميل الموقع والموعد، وبعدها ينفذ السائق التوصيل من بوابة السائق حتى تأكيد OTP واكتمال المهمة.",
        "relatedTerms": [
          "SAP",
          "Odoo",
          "طلب توصيل",
          "تحديد المشرف",
          "رابط الحجز",
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
          "Completed"
        ]
      },
      {
        "id": "assign-vs-assignees",
        "questions": [
          "شو الفرق بين Assign و Assignees؟",
          "ما الفرق بين Assign و Assignees؟"
        ],
        "answer": "Assignees هو المشرف المسؤول عن متابعة المهمة والإشراف على تنفيذها. Assign هو الشخص المنفذ فعليًا للخدمة، وفي خدمة التوصيل يكون السائق.",
        "relatedTerms": [
          "Assign",
          "Assignees",
          "المشرف",
          "السائق",
          "منفذ الخدمة"
        ]
      },
      {
        "id": "driver-assignment-to-completion-question",
        "questions": [
          "شو بصير من وقت تعيين السائق لحد انتهاء التوصيل؟",
          "ماذا يحدث من وقت تعيين السائق حتى انتهاء التوصيل؟"
        ],
        "answer": "من وقت تعيين السائق حتى اكتمال التوصيل: يتم تحديد السائق في Assign، وتصبح Task Forms مثل سند التحميل متاحة، ثم يفتح السائق بوابة السائق ويضغط Start، ويرفع صورة التنفيذ، ثم يضغط End Task. بعد ذلك يرسل النظام OTP إلى العميل، وبعد تأكيد الرمز تتحول المهمة إلى Completed.",
        "relatedTerms": [
          "تعيين السائق",
          "انتهاء التوصيل",
          "بوابة السائق",
          "Task Forms",
          "Start",
          "رفع الصورة",
          "End Task",
          "OTP",
          "Completed"
        ]
      }
    ],
    "relationships": [
      {
        "from": "SAP",
        "relation": "sends invoice to",
        "to": "Odoo",
        "description": "تبدأ دورة خدمة التوصيل عندما تصل الفاتورة من SAP إلى Odoo."
      },
      {
        "from": "Invoice",
        "relation": "creates/links to",
        "to": "Task",
        "description": "الفاتورة التي تحتوي على خدمة التوصيل ترتبط بمهمة التوصيل."
      },
      {
        "from": "Task",
        "relation": "belongs to",
        "to": "Project",
        "description": "مهمة التوصيل تنتمي إلى Project = خدمة التوصيل."
      },
      {
        "from": "Assignees",
        "relation": "supervises",
        "to": "Task",
        "description": "Assignees هو المشرف المسؤول عن متابعة المهمة والإشراف عليها."
      },
      {
        "from": "Assign",
        "relation": "executes",
        "to": "Task",
        "description": "Assign هو منفذ الخدمة فعليًا، وفي التوصيل يكون السائق."
      },
      {
        "from": "Appointment From + Appointment To",
        "relation": "define",
        "to": "Allowed Booking Window",
        "description": "Appointment From و Appointment To يحددان الفترة المسموح خلالها بحجز موعد التوصيل."
      },
      {
        "from": "Allowed Booking Window",
        "relation": "constrains",
        "to": "Available Appointment Selection",
        "description": "المواعيد المتاحة للحجز تظهر ضمن الفترة المحددة مسبقًا."
      },
      {
        "from": "Driver Assignment",
        "relation": "enables",
        "to": "Driver Task Form",
        "description": "عند مرحلة تعيين سائق يتم تفعيل Task Forms المرتبطة بالمهمة."
      },
      {
        "from": "Driver Assignment",
        "relation": "followed by",
        "to": "Driver Portal Execution",
        "description": "بعد تعيين السائق، يستكمل تنفيذ التوصيل من بوابة السائق عبر Start ثم رفع صورة التنفيذ ثم End Task ثم OTP Confirmation ثم Completed."
      },
      {
        "from": "Delivery Task Form",
        "relation": "contains",
        "to": "Loading Document Form",
        "description": "في خدمة التوصيل يظهر نموذج سند التحميل ضمن Task Forms."
      },
      {
        "from": "Driver Portal",
        "relation": "execution sequence",
        "to": "Start → Upload Photo → End Task → OTP Confirmation → Completed",
        "description": "تنفيذ التوصيل من بوابة السائق يبدأ بـ Start ثم رفع الصورة ثم End Task ثم OTP ثم Completed."
      }
    ],
    "businessRules": [
      {
        "id": "BR-INTRO-001",
        "title": "نافذة حجز الموعد",
        "rule": "يجب أن يكون حجز موعد التوصيل ضمن الفترة المحددة بين Appointment From و Appointment To.",
        "relatedTerms": [
          "Appointment From",
          "Appointment To",
          "فترة الحجز",
          "موعد التوصيل"
        ]
      }
    ],
    "glossary": [
      {
        "term": "Tasks",
        "definition": "Tasks هو الزر المستخدم للوصول إلى مهمة التوصيل المرتبطة بالفاتورة، ومن خلاله يمكن عرض تفاصيل الخدمة المرتبطة بها.",
        "relatedTerms": [
          "Tasks",
          "زر Tasks",
          "التاسك",
          "المهمة",
          "مهمة التوصيل",
          "تفاصيل المهمة",
          "تفاصيل الخدمة",
          "الفاتورة"
        ]
      },
      {
        "term": "Allowed Booking Window",
        "definition": "الفترة التي يحددها Appointment From و Appointment To لحجز موعد التوصيل.",
        "relatedTerms": [
          "فترة الحجز",
          "نافذة الحجز"
        ]
      },
      {
        "term": "Loading Document Form",
        "definition": "نموذج سند التحميل الذي يظهر في خدمة التوصيل ضمن Task Forms.",
        "relatedTerms": [
          "نموذج سند تحميل",
          "نموذج سند التحميل"
        ]
      },
      {
        "term": "Driver Portal",
        "definition": "بوابة السائق التي يتم من خلالها تنفيذ خدمة التوصيل بعد تعيين السائق.",
        "relatedTerms": [
          "بوابة السائق",
          "رابط بوابة المهمة"
        ]
      },
      {
        "term": "شو بصير",
        "definition": "صيغة سؤال عامية تعني: ماذا يحدث.",
        "relatedTerms": [
          "ماذا يحدث",
          "ما الذي يحدث"
        ]
      },
      {
        "term": "لحد",
        "definition": "صيغة عامية تعني: حتى.",
        "relatedTerms": [
          "حتى",
          "إلى أن"
        ]
      }
    ]
  }
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

  if (BOOKING_WINDOW_LOCATION_QUESTIONS.has(normalizedQuestion)) {
    return "وقت الحجز يتحدد على المهمة من خلال حقلي Appointment From و Appointment To؛ هذه الحقول تحدد بداية ونهاية فترة الحجز التي يختار العميل موعده ضمنها.";
  }

  if (AFTER_START_QUESTIONS.has(normalizedQuestion)) {
    return "بعد Start يرفع السائق صورة التنفيذ، وبعد رفع الصورة يظهر خيار End Task لإنهاء المهمة، ثم يتم إرسال OTP للعميل، وبعد تأكيده تصبح المهمة Completed.";
  }

  if (LOADING_DOCUMENT_QUESTIONS.has(normalizedQuestion)) {
    return "نموذج سند التحميل هو نموذج يظهر ضمن Task Forms المرتبطة بالمهمة، ويصبح متاحًا عند تجهيز مهمة التوصيل للسائق لاستخدامه أثناء تنفيذ الخدمة.";
  }

  if (BOOKING_START_QUESTIONS.has(normalizedQuestion)) {
    return "يقدر العميل يحجز موعد بعد الوصول إلى جدولة التوصيل وظهور رابط حجز الموعد، ويختار الموعد ضمن الفترة المحددة بين Appointment From و Appointment To.";
  }

  if (FIELD_STAGE_QUESTIONS.has(normalizedQuestion)) {
    return "Stage هو حقل المرحلة الحالية للمهمة؛ يوضح أين وصلت المهمة داخل مسار خدمة التوصيل، مثل طلب توصيل أو تعيين سائق أو Completed.";
  }

  if (FIELD_TASK_FORMS_QUESTIONS.has(normalizedQuestion)) {
    return "Task Forms هي نماذج مرتبطة بالمهمة تصبح متاحة عند تجهيز مهمة التوصيل للسائق، مثل نموذج سند التحميل المطلوب أثناء التنفيذ.";
  }

  if (PAGE_OVERVIEW_QUESTIONS.has(normalizedQuestion)) {
    return "هذه الصفحة جولة تعريفية تعرض شاشات Odoo الخاصة بدورة عمل خدمة التوصيل، من وصول الفاتورة من SAP إلى Odoo وحتى تنفيذ التوصيل و Completed.";
  }

  if (FULL_WORKFLOW_BOUNDARY_QUESTIONS.has(normalizedQuestion)) {
    return "نعم، الصفحة جولة تعريفية وليست مجرد عرض عام؛ تشرح دورة العمل التنفيذية لخدمة التوصيل كاملة داخل Odoo، من الفاتورة القادمة من SAP إلى Tasks ثم الحجز وتعيين السائق وتنفيذ التوصيل حتى OTP و Completed.";
  }

  if (GLOBAL_SERVICES_QUESTIONS.has(normalizedQuestion)) {
    return "الخدمات الموجودة هي: خدمة التصميم، خدمة رفع القياسات، خدمة التوصيل، خدمة التركيب، خدمة التصنيع، خدمة الصيانة الميدانية، والتحويلات الداخلية / النقل الداخلي.";
  }

  if (ZCF2_QUESTIONS.has(normalizedQuestion)) {
    return "وضع ZCF2 غير محسوم حتى الآن؛ معنى نوع الفوترة ZCF2 في SAP لم يتم حسمه بعد ويظل ضمن الأسئلة المفتوحة.";
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

const BOOKING_WINDOW_LOCATION_QUESTIONS = new Set(
  ["وين بيتحدد وقت الحجز؟", "أين يتم تحديد وقت الحجز؟"].map(normalizeText),
);

const AFTER_START_QUESTIONS = new Set(
  ["شو بصير بعد Start؟", "ماذا يحدث بعد Start؟", "ايش يصير بعد Start؟"].map(normalizeText),
);

const LOADING_DOCUMENT_QUESTIONS = new Set(
  ["شو نموذج سند التحميل؟", "ما هو نموذج سند التحميل؟", "ايش نموذج سند التحميل؟"].map(normalizeText),
);

const BOOKING_START_QUESTIONS = new Set(
  ["متى العميل بيقدر يحجز موعد؟", "متى يستطيع العميل حجز موعد؟"].map(normalizeText),
);

const FIELD_STAGE_QUESTIONS = new Set(
  ["شو يعني Stage؟", "ما معنى Stage؟", "ايش يعني Stage؟"].map(normalizeText),
);

const FIELD_TASK_FORMS_QUESTIONS = new Set(
  ["شو هو Task Forms؟", "ما هو Task Forms؟", "ايش هو Task Forms؟"].map(normalizeText),
);

const PAGE_OVERVIEW_QUESTIONS = new Set(
  ["شو بتعرض هاي الصفحة بشكل عام؟", "ماذا تعرض هذه الصفحة بشكل عام؟"].map(normalizeText),
);

const FULL_WORKFLOW_BOUNDARY_QUESTIONS = new Set(
  ["هل هاي الصفحة بتشرح دورة العمل كاملة؟", "هل هذه الصفحة تشرح دورة العمل كاملة؟"].map(normalizeText),
);

const GLOBAL_SERVICES_QUESTIONS = new Set(
  ["شو الخدمات الموجودة عنا؟", "ما الخدمات الموجودة عنا؟", "ايش الخدمات الموجودة عنا؟"].map(normalizeText),
);

const ZCF2_QUESTIONS = new Set(
  ["شو وضع ZCF2؟", "ما وضع ZCF2؟", "ايش وضع ZCF2؟"].map(normalizeText),
);

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
