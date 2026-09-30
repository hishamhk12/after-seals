// Source of truth: rendered page #/lesson/manufacturing-with-installation
// (خدمة التصنيع → الباب الأول — علاقات خدمة التصنيع → التصنيع مع التركيب;
// app.js renderManufacturingInstallationLinkContent).
// Confirmed rule: Installation of a manufactured product cannot begin before Manufacturing is
// complete AND the product has reached the customer through Delivery. Delivery sits between the two,
// so Manufacturing never moves straight to Installation.
// The same dependency is documented from the Installation side on installation-manufacturing-link,
// which keeps the installation execution detail; this page is the Manufacturing-side view and does
// not restate it. Nothing is documented about HOW the handovers happen: no Blocked/Ready dependency
// states, no automatic creation or unlocking of Delivery or Installation tasks, no status colours,
// no responsibility or manual/automatic labels, and no timing rules.
module.exports = {
  id: "manufacturing-installation-link",
  services: ["manufacturing", "installation", "delivery"],
  relatedServices: [],
  title: "التصنيع مع التركيب",
  route: "#/lesson/manufacturing-with-installation",
  workflowLabel: "مسار علاقة خدمة التصنيع بالتركيب (التصنيع ← التوصيل ← التركيب)",
  overview:
    "لا يمكن البدء بتنفيذ خدمة التركيب للمنتج المُصنَّع قبل اكتمال خدمة التصنيع ووصول المنتج إلى العميل من خلال خدمة التوصيل. لا ينتقل المنتج من التصنيع إلى التركيب مباشرة، لأن خدمة التوصيل تقع بينهما: يكتمل التصنيع أولًا، ثم يُنفَّذ التوصيل لإيصال المنتج إلى العميل، وبعد وصوله يمكن البدء بأعمال التركيب. التسلسل المعتمد هو: التصنيع ← التوصيل ← التركيب.",
  terms: [
    "التصنيع مع التركيب",
    "المنتج المُصنَّع",
    "اكتمال خدمة التصنيع",
    "وصول المنتج إلى العميل",
    "خدمة التوصيل",
    "خدمة التركيب",
    "التوصيل بين التصنيع والتركيب",
  ],
  stages: [
    {
      id: "manufacturing",
      number: "00",
      title: "التصنيع",
      description:
        "يتم تنفيذ خدمة التصنيع حتى يكتمل المنتج المُصنَّع ويصبح جاهزًا للانتقال إلى الخدمة التالية.",
      execution: null,
      relatedTerms: ["التصنيع", "المنتج المُصنَّع", "اكتمال التصنيع", "الخدمة التالية"],
    },
    {
      id: "delivery",
      number: "01",
      title: "التوصيل",
      description:
        "بعد اكتمال التصنيع، يتم تنفيذ خدمة التوصيل لإيصال المنتج المُصنَّع إلى العميل.",
      execution: null,
      relatedTerms: ["التوصيل", "إيصال المنتج إلى العميل", "بين التصنيع والتركيب"],
    },
    {
      id: "installation",
      number: "02",
      title: "التركيب",
      description:
        "بعد اكتمال التوصيل ووصول المنتج إلى العميل، يمكن البدء بتنفيذ خدمة التركيب.",
      execution: null,
      relatedTerms: ["التركيب", "بعد اكتمال التوصيل", "وصول المنتج إلى العميل", "بدء التركيب"],
    },
  ],
  notes: [
    {
      id: "summary",
      title: "الخلاصة",
      text:
        "التسلسل المعتمد لهذه العلاقة هو التصنيع ← التوصيل ← التركيب. التوصيل يقع بين التصنيع والتركيب، ولا ينتقل المنتج المُصنَّع من التصنيع إلى التركيب مباشرة.",
      relatedTerms: ["الخلاصة", "التصنيع", "التوصيل", "التركيب", "التسلسل"],
    },
  ],
  relationships: [
    {
      id: "dependency",
      title: "اعتماد تركيب المنتج المُصنَّع على التصنيع والتوصيل",
      text:
        "لا يمكن البدء بتنفيذ خدمة التركيب للمنتج المُصنَّع قبل اكتمال خدمة التصنيع ووصول المنتج إلى العميل من خلال خدمة التوصيل. التوصيل يقع بين التصنيع والتركيب، والتصنيع لا يذهب مباشرة إلى التركيب. التسلسل هو: التصنيع ← التوصيل ← التركيب.",
      services: ["manufacturing", "installation", "delivery"],
      relatedTerms: [
        "هل التصنيع يروح مباشرة للتركيب",
        "شو بيجي بين التصنيع والتركيب",
        "هل التوصيل لازم قبل التركيب",
        "متى يبدأ تركيب المنتج المُصنَّع",
      ],
    },
    {
      id: "installation-side",
      title: "التوثيق من جهة خدمة التركيب",
      text:
        "هذه العلاقة موثقة أيضًا من جهة خدمة التركيب في صفحة تركيب مع تصنيع، وهي تحمل تفاصيل تنفيذ التركيب بعد وصول البضاعة. الصفحة الحالية هي العرض من جهة خدمة التصنيع ولا تكرر تلك التفاصيل.",
      services: ["manufacturing", "installation"],
      relatedTerms: ["تركيب مع تصنيع", "من جهة التركيب"],
    },
    {
      id: "wider-chain",
      title: "موقع هذه العلاقة من سلسلة الخدمات",
      text:
        "علاقة التصنيع بالتركيب جزء من سلسلة خدمات أوسع. الجزء الذي يسبق التصنيع (رفع المقاسات ثم التصميم) موثق في صفحة التصنيع مع رفع المقاسات وصفحة التصنيع مع التصميم، والانتقال من التصنيع إلى التوصيل موثق في صفحة التصنيع مع التوصيل.",
      services: ["manufacturing", "installation", "delivery", "measurement", "design"],
      relatedTerms: ["سلسلة الخدمات", "التصنيع مع رفع المقاسات", "التصنيع مع التصميم", "التصنيع مع التوصيل"],
    },
    {
      id: "not-documented",
      title: "ما هو غير موثق في علاقة التصنيع بالتركيب",
      text:
        "غير موثق حاليًا: أي حالة حظر أو جاهزية بسبب الاعتماد (Blocked by Dependency / Dependency Ready)، وأي حالة لونية لاعتماد التصنيع أو التوصيل، وأي سلوك آلي ينشئ مهمة التوصيل أو التركيب أو ينقلها أو يفتحها عند اكتمال الخدمة السابقة، وأي تصنيف (آلي/يدوي) أو جهة مسؤولة لمراحل هذه العلاقة، وأي مدد زمنية أو قواعد توقيت بين الخدمات الثلاث، وأي سلوك للتصنيع الجزئي أو التوصيل الجزئي أو التركيب الجزئي. القاعدة المؤكدة الوحيدة: لا يمكن البدء بتنفيذ خدمة التركيب للمنتج المُصنَّع قبل اكتمال خدمة التصنيع ووصول المنتج إلى العميل من خلال خدمة التوصيل.",
      services: ["manufacturing", "installation", "delivery"],
      relatedTerms: ["غير موثق", "Blocked by Dependency", "Dependency Ready", "التركيب الجزئي"],
    },
  ],
};
