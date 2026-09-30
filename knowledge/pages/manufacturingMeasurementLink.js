// Source of truth: rendered page #/lesson/manufacturing-with-measurement
// (خدمة التصنيع → الباب الأول — علاقات خدمة التصنيع → التصنيع مع رفع المقاسات;
// app.js renderManufacturingMeasurementLinkContent).
// Confirmed rule: Manufacturing execution cannot begin before Measurement is complete and the
// Design is approved. Measurement never feeds Manufacturing directly — Design sits between them.
// No Blocked/Ready dependency states, no status colours, no per-stage responsibility labels and no
// timing rules are documented for this relationship.
module.exports = {
  id: "manufacturing-measurement-link",
  services: ["manufacturing", "measurement", "design"],
  relatedServices: [],
  title: "التصنيع مع رفع المقاسات",
  route: "#/lesson/manufacturing-with-measurement",
  workflowLabel: "مسار علاقة خدمة التصنيع برفع المقاسات (رفع المقاسات ← التصميم ← التصنيع)",
  overview:
    "لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال رفع المقاسات والتصميم المعتمد. المنتج المُصنَّع في هذا المسار، مثل مغسلة مفصّلة حسب الطلب، يحتاج إلى مقاسات فعلية قبل إعداد التصميم، ويُنفَّذ التصنيع بناءً على التصميم المعتمد. لذلك تمر هذه العلاقة بثلاث خدمات بالترتيب: رفع المقاسات، ثم التصميم، ثم التصنيع. لا تنتقل خدمة رفع المقاسات إلى التصنيع مباشرة، لأن التصميم يقع بينهما.",
  terms: [
    "التصنيع مع رفع المقاسات",
    "رفع المقاسات",
    "المقاسات المعتمدة",
    "التصميم المعتمد",
    "اعتماد التصميم",
    "التصنيع",
    "التسلسل",
    "الاعتماد",
  ],
  stages: [
    {
      id: "measurement",
      number: "00",
      title: "رفع المقاسات",
      description:
        "يتم رفع المقاسات الفعلية للمنتج أو موقع التنفيذ، وهي الأساس الذي سيتم الاعتماد عليه في إعداد التصميم.",
      execution: null,
      relatedTerms: ["رفع المقاسات", "المقاسات الفعلية", "موقع التنفيذ", "أساس التصميم"],
    },
    {
      id: "design",
      number: "01",
      title: "التصميم",
      description:
        "يتم إعداد التصميم بناءً على المقاسات المعتمدة، ويجب اعتماد التصميم قبل الانتقال إلى التصنيع.",
      execution: null,
      relatedTerms: ["التصميم", "المقاسات المعتمدة", "اعتماد التصميم", "قبل التصنيع"],
    },
    {
      id: "manufacturing",
      number: "02",
      title: "التصنيع",
      description:
        "بعد اكتمال رفع المقاسات واعتماد التصميم، يمكن البدء بتنفيذ خدمة التصنيع وفق التصميم المعتمد.",
      execution: null,
      relatedTerms: ["التصنيع", "تنفيذ خدمة التصنيع", "التصميم المعتمد", "اكتمال رفع المقاسات"],
    },
  ],
  notes: [
    {
      id: "summary",
      title: "الخلاصة",
      text:
        "التسلسل المعتمد لهذه العلاقة هو رفع المقاسات ← التصميم ← التصنيع. تبدأ العلاقة برفع المقاسات الفعلية، ثم يُعد التصميم بناءً على هذه المقاسات ويُعتمد، وبعد اعتماد التصميم يمكن البدء بتنفيذ خدمة التصنيع. لا تنتقل خدمة رفع المقاسات إلى التصنيع مباشرة، لأن التصميم يقع بينهما.",
      relatedTerms: ["الخلاصة", "التسلسل", "رفع المقاسات", "التصميم", "التصنيع"],
    },
  ],
  relationships: [
    {
      id: "dependency",
      title: "اعتماد خدمة التصنيع على رفع المقاسات والتصميم",
      text:
        "لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال رفع المقاسات والتصميم المعتمد. رفع المقاسات مطلوب قبل التصميم، والتصميم يُعد بناءً على المقاسات المعتمدة، والتصنيع يُنفَّذ بناءً على التصميم المعتمد. التسلسل هو: رفع المقاسات ← التصميم ← التصنيع.",
      services: ["manufacturing", "measurement", "design"],
      relatedTerms: ["لا يمكن البدء بتنفيذ خدمة التصنيع", "قبل التصنيع", "بدون رفع مقاسات", "التسلسل", "الاعتماد"],
    },
    {
      id: "not-documented",
      title: "ما هو غير موثق في علاقة التصنيع برفع المقاسات",
      text:
        "غير موثق حاليًا: أي حالة حظر أو جاهزية بسبب الاعتماد (Blocked by Dependency / Dependency Ready)، وأي حالة لونية لاعتماد المقاسات أو التصميم، وأي تصنيف (آلي/يدوي) أو جهة مسؤولة لمراحل هذه العلاقة، وأي مدد زمنية أو قواعد توقيت بين الخدمات الثلاث. القاعدة المؤكدة الوحيدة: لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال رفع المقاسات والتصميم المعتمد.",
      services: ["manufacturing", "measurement", "design"],
      relatedTerms: ["غير موثق", "Blocked by Dependency", "Dependency Ready", "توقيت"],
    },
  ],
};
