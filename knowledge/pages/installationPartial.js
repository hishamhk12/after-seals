// Source of truth: rendered page #/lesson/installation-partial
// (خدمة التركيب → الباب الأول — أنواع خدمات التركيب → تركيب جزئي;
// app.js renderInstallationPartialContent).
// Confirmed rule: Partial Installation is NOT a separate workflow that starts from SAP. It is a
// Sub Task created inside the main Installation task (the Parent Task). While at least one Sub Task
// is incomplete the Parent Task shows Blocked by Subtasks with the counter 0/1; after the Sub Task
// is completed the counter becomes 1/1 and Blocked by Subtasks disappears. The Sub Task itself is
// executed with the normal Installation stages (page `installation`), which this page does not repeat.
// Blocked by Subtasks and Blocked by Dependency are two different states and are never merged.
// The page shows no "التنفيذ" label per stage, so `execution` stays null. Nothing is documented about
// who creates the Sub Task, who assigns the technician, automatic Sub Task creation, how many Sub
// Tasks are allowed, partial quantities, automatic completion of the Parent Task, timing/SLA,
// WhatsApp, warehouse or any delivery/manufacturing dependency for the partial installation.
module.exports = {
  id: "installation-partial",
  services: ["installation"],
  relatedServices: [],
  title: "تركيب جزئي",
  route: "#/lesson/installation-partial",
  workflowLabel: "مسار التركيب الجزئي (مهمة فرعية Sub Task داخل طلب التركيب الرئيسي)",
  overview:
    "التركيب الجزئي يتم من خلال إنشاء مهمة فرعية (Sub Task) داخل طلب التركيب الرئيسي (Parent Task)، وليس كدورة عمل مستقلة تبدأ من SAP. بعد إنشاء المهمة الفرعية يتم تنفيذها كأنها مهمة تركيب عادية بنفس مراحل دورة خدمة التركيب المعتمدة. وطالما توجد مهمة فرعية غير مكتملة تظهر على المهمة الرئيسية حالة Blocked by Subtasks مع العدّاد 0/1، وبعد اكتمال المهمة الفرعية يصبح العدّاد 1/1 وتختفي حالة Blocked by Subtasks.",
  terms: [
    "تركيب جزئي",
    "التركيب الجزئي",
    "Sub Task",
    "Sub-tasks",
    "مهمة فرعية",
    "Parent Task",
    "المهمة الرئيسية",
    "طلب تركيب رئيسي",
    "Blocked by Subtasks",
    "0/1",
    "1/1",
    "عدّاد المهام الفرعية",
  ],
  stages: [
    {
      id: "invoice",
      number: "00",
      title: "فاتورة من SAP",
      description:
        "التركيب الجزئي لا يصل من SAP كطلب مستقل. تبدأ الدورة كما تبدأ أي خدمة تركيب: تصل الفاتورة من SAP إلى نظام خدمات مابعد البيع، فيُنشأ طلب التركيب ويدخل دورة عمل خدمة التركيب العادية ويظهر في مرحلة طلب تركيب على لوحة خدمة التركيب.",
      execution: null,
      image:
        "لوحة خدمة التركيب في نظام خدمات مابعد البيع مع تحديد طلب التركيب الذي أنشأته الفاتورة القادمة من SAP في مرحلة طلب تركيب",
      relatedTerms: ["فاتورة من SAP", "SAP", "طلب تركيب", "لوحة خدمة التركيب", "لا يبدأ من SAP"],
    },
    {
      id: "parent-task",
      number: "01",
      title: "طلب تركيب رئيسي",
      description:
        "طلب التركيب الذي أنشأته الفاتورة هو المهمة الرئيسية (Parent Task)، ومن داخلها تُدار عملية التركيب الجزئي. لا توجد دورة تركيب جزئي مستقلة عن المهمة الرئيسية، ولا يُنشأ طلب تركيب جزئي منفصل من SAP: المهمة الفرعية تُنشأ من داخل طلب التركيب الرئيسي وتبقى مرتبطة به.",
      execution: null,
      relatedTerms: ["طلب تركيب رئيسي", "Parent Task", "المهمة الرئيسية", "تركيب كامل"],
    },
    {
      id: "create-sub-task",
      number: "02",
      title: "إنشاء Sub Task",
      description:
        "من داخل طلب التركيب الرئيسي ننتقل إلى تبويب Sub-tasks في أسفل المهمة، ومنه تُضاف المهمة الفرعية المطلوبة. تظهر المهمة الفرعية بعد إضافتها كسطر داخل التبويب يحمل عمودي Title و Assignees، ويظهر بجانبه زر View لفتح المهمة الفرعية والانتقال إليها. وفي أعلى المهمة الرئيسية يظهر عدّاد المهام الفرعية Sub-tasks بالقيمة 0 / 1 (0%) ما دامت المهمة الفرعية غير مكتملة.",
      execution: null,
      image:
        "تبويب Sub-tasks داخل المهمة الرئيسية يعرض سطر المهمة الفرعية مع عمودي Title و Assignees وزر View، وفي أعلى المهمة عدّاد Sub-tasks بالقيمة 0 / 1 (0%)",
      relatedTerms: ["إنشاء Sub Task", "Sub-tasks", "تبويب Sub-tasks", "View", "Title", "Assignees", "0 / 1 (0%)"],
    },
    {
      id: "blocked-by-subtasks",
      number: "03",
      title: "Blocked by Subtasks",
      description:
        "بعد إنشاء المهمة الفرعية يتغيّر شكل المهمة الرئيسية على اللوحة: تظهر بطاقتها باللون البرتقالي ويظهر عليها شريط Blocked by Subtasks مع عدّاد المهام الفرعية بالقيمة 0/1. وتبقى المهمة الرئيسية بهذه الحالة ما دامت هناك مهمة فرعية واحدة على الأقل غير مكتملة.",
      execution: null,
      details: [
        "محظور بسبب المهام الفرعية: تعني أن المهمة الرئيسية تحتوي على مهمة فرعية واحدة أو أكثر غير مكتملة، ويظهر معها عدّاد المهام الفرعية بالقيمة 0/1. ويختفي هذا الشريط بعد اكتمال المهام الفرعية.",
        "محظور بسبب الاعتماد: حالة مختلفة تمامًا: تعني أن المهمة محظورة لأن خدمة أخرى مرتبطة بها لم تكتمل بعد، وليس بسبب وجود مهام فرعية.",
      ],
      image:
        "بطاقة المهمة الرئيسية على لوحة خدمة التركيب تظهر باللون البرتقالي مع شريط Blocked by Subtasks وعدّاد المهام الفرعية 0/1",
      relatedTerms: [
        "Blocked by Subtasks",
        "محظور بسبب المهام الفرعية",
        "Blocked by Dependency",
        "محظور بسبب الاعتماد",
        "0/1",
        "اللون البرتقالي",
      ],
    },
    {
      id: "execute",
      number: "04",
      title: "تنفيذ التركيب داخل Sub Task",
      description:
        "تُفتح المهمة الفرعية من زر View داخل تبويب Sub-tasks، ثم تُنفَّذ كأنها مهمة تركيب عادية. المهمة الفرعية تمشي بنفس مراحل دورة خدمة التركيب المعتمدة من طلب تركيب وحتى تم التركيب، ولا توجد مراحل خاصة بالتركيب الجزئي تختلف عن دورة التركيب العادية.",
      execution: null,
      relatedTerms: ["تنفيذ التركيب داخل Sub Task", "View", "دورة خدمة التركيب", "تركيب كامل", "تم التركيب"],
    },
    {
      id: "completed",
      number: "05",
      title: "اكتمال Sub Task",
      description:
        "بعد اكتمال المهمة الفرعية يتحدّث عدّاد المهام الفرعية على المهمة الرئيسية ليصبح 1/1، ويختفي شريط Blocked by Subtasks وتعود بطاقة المهمة الرئيسية إلى شكلها الطبيعي. ظهور العدّاد بالقيمة 1/1 بدون شريط Blocked by Subtasks هو المؤشر على أن المهمة الفرعية قد انتهت.",
      execution: null,
      image:
        "لوحة خدمة التركيب بعد اكتمال المهمة الفرعية: بطاقة المهمة الرئيسية عادت إلى شكلها الطبيعي وعدّاد المهام الفرعية أصبح 1/1 وشريط Blocked by Subtasks اختفى",
      relatedTerms: ["اكتمال Sub Task", "1/1", "اختفاء Blocked by Subtasks", "عدّاد المهام الفرعية"],
    },
  ],
  notes: [
    {
      id: "core-concept",
      title: "الفكرة الأساسية",
      text:
        "التركيب الجزئي يتم من خلال إنشاء مهمة فرعية (Sub Task) داخل طلب التركيب الرئيسي (Parent Task). وبعد إنشاء المهمة الفرعية يتم تنفيذها كأنها مهمة تركيب عادية. وطالما توجد مهمة فرعية غير مكتملة، تظهر على المهمة الرئيسية حالة Blocked by Subtasks، وبعد اكتمال المهمة الفرعية يظهر عدّاد المهام الفرعية مكتملًا مثل 1/1 وتختفي حالة Blocked by Subtasks.",
      relatedTerms: ["شو هو التركيب الجزئي", "Sub Task", "Parent Task", "Blocked by Subtasks", "1/1"],
    },
    {
      id: "not-the-same-as-dependency",
      title: "تنبيه: Blocked by Subtasks ليست Blocked by Dependency",
      text:
        "Blocked by Subtasks ليست Blocked by Dependency. الأولى سببها وجود مهام فرعية غير مكتملة داخل المهمة نفسها، والثانية سببها اعتماد المهمة على خدمة أخرى لم تكتمل. لا يتم الخلط بينهما.",
      relatedTerms: [
        "الفرق بين Blocked by Subtasks و Blocked by Dependency",
        "Blocked by Subtasks",
        "Blocked by Dependency",
      ],
    },
    {
      id: "summary",
      title: "الخلاصة",
      text:
        "التركيب الجزئي هو مهمة فرعية (Sub Task) داخل طلب التركيب الرئيسي (Parent Task) وليس دورة عمل مستقلة تبدأ من SAP. التسلسل الكامل هو: فاتورة من SAP ← طلب تركيب رئيسي ← إنشاء Sub Task ← ظهور Blocked by Subtasks على المهمة الرئيسية ← تنفيذ التركيب داخل Sub Task بنفس دورة التركيب العادية ← اكتمال Sub Task وظهور 1/1 واختفاء Blocked by Subtasks.",
      relatedTerms: ["الخلاصة", "تسلسل التركيب الجزئي", "Sub Task", "Blocked by Subtasks"],
    },
  ],
  relationships: [
    {
      id: "sub-task-of-parent",
      title: "التركيب الجزئي مهمة فرعية داخل طلب التركيب الرئيسي",
      text:
        "التركيب الجزئي ليس دورة عمل منفصلة ولا يصل كطلب مستقل من SAP. الذي يصل من SAP هو الفاتورة التي تُنشئ طلب التركيب الرئيسي (Parent Task)، ثم يُنشأ التركيب الجزئي كمهمة فرعية (Sub Task) من داخل هذا الطلب الرئيسي عبر تبويب Sub-tasks ويبقى مرتبطًا به.",
      services: ["installation"],
      relatedTerms: [
        "هل التركيب الجزئي بيجي مباشرة من SAP",
        "من وين يبدأ التركيب الجزئي",
        "التركيب الجزئي مستقل ولا لأ",
        "Sub Task داخل طلب التركيب الرئيسي",
      ],
    },
    {
      id: "counter-meaning",
      title: "معنى عدّاد المهام الفرعية 0/1 و 1/1",
      text:
        "عدّاد المهام الفرعية على المهمة الرئيسية يوضح كم مهمة فرعية اكتملت من إجمالي المهام الفرعية. القيمة 0/1 تعني أن هناك مهمة فرعية واحدة ولم تكتمل بعد، وتظهر معها حالة Blocked by Subtasks. والقيمة 1/1 تعني أن المهمة الفرعية الواحدة اكتملت، وعندها تختفي حالة Blocked by Subtasks.",
      services: ["installation"],
      relatedTerms: ["شو يعني 0/1", "شو يعني 1/1", "عدّاد المهام الفرعية", "Sub-tasks 0 / 1 (0%)"],
    },
    {
      id: "after-creating-sub-task",
      title: "ماذا يحدث بعد إنشاء المهمة الفرعية",
      text:
        "بعد إنشاء المهمة الفرعية تنتقل المهمة الرئيسية إلى حالة Blocked by Subtasks مع العدّاد 0/1 وتبقى كذلك ما دامت المهمة الفرعية غير مكتملة، بينما تُفتح المهمة الفرعية من زر View وتُنفَّذ كمهمة تركيب عادية بنفس مراحل دورة خدمة التركيب المعتمدة.",
      services: ["installation"],
      relatedTerms: [
        "بعد ما أعمل Sub Task شو بصير",
        "كيف تمشي الـ Sub Task",
        "تنفيذ المهمة الفرعية",
        "Blocked by Subtasks",
      ],
    },
    {
      id: "normal-installation-cycle",
      title: "المهمة الفرعية تتبع دورة التركيب العادية",
      text:
        "المهمة الفرعية للتركيب الجزئي لا تملك مراحل خاصة بها. هي تمشي بنفس مراحل دورة خدمة التركيب المعتمدة الموثقة في صفحة تركيب كامل، من مرحلة طلب تركيب وحتى مرحلة تم التركيب، وهذه الصفحة لا تكرر تلك المراحل.",
      services: ["installation"],
      relatedTerms: ["تركيب كامل", "دورة خدمة التركيب", "نفس المراحل", "مراحل المهمة الفرعية"],
    },
    {
      id: "not-documented",
      title: "ما هو غير موثق في التركيب الجزئي",
      text:
        "غير موثق حاليًا: الجهة التي تنشئ المهمة الفرعية أو تعيّن الفني لها، وأي إنشاء آلي للمهمة الفرعية، وعدد المهام الفرعية المسموح به، والكميات الجزئية، وأي إغلاق آلي للمهمة الرئيسية بعد اكتمال المهام الفرعية، وأي تصنيف (آلي/يدوي) أو جهة مسؤولة لمراحل هذه الصفحة، وأي مدد زمنية أو قواعد توقيت، وأي سلوك لرسائل الواتساب أو المستودع أو اعتماد على التوصيل أو التصنيع. القواعد المؤكدة هي: التركيب الجزئي مهمة فرعية داخل طلب التركيب الرئيسي، والمهمة الرئيسية تظهر بحالة Blocked by Subtasks ما دامت المهمة الفرعية غير مكتملة، والمهمة الفرعية تُنفَّذ بنفس دورة التركيب العادية.",
      services: ["installation"],
      relatedTerms: ["غير موثق", "من ينشئ المهمة الفرعية", "إنشاء آلي", "عدد المهام الفرعية", "الكميات الجزئية"],
    },
  ],
};
