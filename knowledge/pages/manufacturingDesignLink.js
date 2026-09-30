// Source of truth: rendered page #/lesson/manufacturing-with-design
// (خدمة التصنيع → الباب الأول — علاقات خدمة التصنيع → التصنيع مع التصميم;
// app.js renderManufacturingDesignLinkContent).
// Confirmed rule: Manufacturing execution cannot begin before the Design is complete and approved,
// and Manufacturing is carried out according to that approved design. This page covers the direct
// التصميم ← التصنيع dependency only; the upstream رفع المقاسات ← التصميم ← التصنيع chain belongs to
// manufacturing-measurement-link. No Blocked/Ready dependency states, no status colours, no
// per-stage responsibility labels, no approval mechanism and no timing rules are documented here.
module.exports = {
  id: "manufacturing-design-link",
  services: ["manufacturing", "design"],
  relatedServices: [],
  title: "التصنيع مع التصميم",
  route: "#/lesson/manufacturing-with-design",
  workflowLabel: "مسار علاقة خدمة التصنيع بالتصميم (التصميم ← التصنيع)",
  overview:
    "لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال واعتماد التصميم. التصميم المعتمد هو المرجع الذي يُنفَّذ المنتج بناءً عليه، ولا يدخل المنتج مرحلة التصنيع قبل اكتمال التصميم واعتماده. الاعتماد المباشر في هذه العلاقة هو التصميم ← التصنيع، ويتم التصنيع وفق التصميم المعتمد.",
  terms: [
    "التصنيع مع التصميم",
    "التصميم المعتمد",
    "اعتماد التصميم",
    "اكتمال التصميم",
    "التصنيع",
    "المرجع",
    "الاعتماد المباشر",
  ],
  stages: [
    {
      id: "design",
      number: "00",
      title: "التصميم",
      description:
        "يتم إعداد التصميم واعتماده قبل بدء التصنيع، ويصبح التصميم المعتمد المرجع الذي سيتم تنفيذ المنتج بناءً عليه.",
      execution: null,
      relatedTerms: ["التصميم", "اعتماد التصميم", "التصميم المعتمد", "المرجع", "قبل بدء التصنيع"],
    },
    {
      id: "manufacturing",
      number: "01",
      title: "التصنيع",
      description:
        "بعد اكتمال واعتماد التصميم، يمكن البدء بتنفيذ خدمة التصنيع وفق التفاصيل والمواصفات الواردة في التصميم المعتمد.",
      execution: null,
      relatedTerms: ["التصنيع", "تنفيذ خدمة التصنيع", "وفق التصميم المعتمد", "المواصفات", "بعد اعتماد التصميم"],
    },
  ],
  notes: [
    {
      id: "summary",
      title: "الخلاصة",
      text:
        "الاعتماد المباشر في هذه العلاقة هو التصميم ← التصنيع. يُعد التصميم ويُعتمد أولًا، ثم يُنفَّذ التصنيع وفق التصميم المعتمد، ولا يبدأ التصنيع قبل اعتماد التصميم.",
      relatedTerms: ["الخلاصة", "التصميم", "التصنيع", "التصميم المعتمد"],
    },
  ],
  relationships: [
    {
      id: "dependency",
      title: "اعتماد خدمة التصنيع على التصميم المعتمد",
      text:
        "لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال واعتماد التصميم. يعتمد التصنيع على التصميم المعتمد بوصفه المرجع الذي يُنفَّذ المنتج بناءً عليه، ولا يدخل المنتج مرحلة التصنيع قبل اكتمال التصميم واعتماده. التسلسل المباشر هو: التصميم ← التصنيع.",
      services: ["manufacturing", "design"],
      relatedTerms: ["لا يمكن البدء بتنفيذ خدمة التصنيع", "قبل التصميم", "على شو يعتمد التصنيع", "التصميم المعتمد"],
    },
    {
      id: "upstream-chain",
      title: "موقع رفع المقاسات من هذه العلاقة",
      text:
        "رفع المقاسات يسبق التصميم ضمن السلسلة الأوسع، لكنه ليس مرحلة ضمن علاقة التصميم بالتصنيع. السلسلة الكاملة رفع المقاسات ← التصميم ← التصنيع موثقة في صفحة التصنيع مع رفع المقاسات.",
      services: ["manufacturing", "design", "measurement"],
      relatedTerms: ["رفع المقاسات", "السلسلة الكاملة", "التصنيع مع رفع المقاسات"],
    },
    {
      id: "not-documented",
      title: "ما هو غير موثق في علاقة التصنيع بالتصميم",
      text:
        "غير موثق حاليًا: أي حالة حظر أو جاهزية بسبب الاعتماد (Blocked by Dependency / Dependency Ready)، وأي حالة لونية لاعتماد التصميم، وأي آلية اعتماد أو جهة معتمِدة للتصميم، وأي تصنيف (آلي/يدوي) أو جهة مسؤولة لمراحل هذه العلاقة، وأي مدد زمنية بين اعتماد التصميم وبدء التصنيع. القاعدة المؤكدة الوحيدة: لا يمكن البدء بتنفيذ خدمة التصنيع قبل اكتمال واعتماد التصميم.",
      services: ["manufacturing", "design"],
      relatedTerms: ["غير موثق", "Blocked by Dependency", "Dependency Ready", "آلية الاعتماد"],
    },
  ],
};
