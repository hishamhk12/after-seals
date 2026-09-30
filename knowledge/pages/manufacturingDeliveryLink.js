// Source of truth: rendered page #/lesson/manufacturing-with-delivery
// (خدمة التصنيع → الباب الأول — علاقات خدمة التصنيع → التصنيع مع التوصيل;
// app.js renderManufacturingDeliveryLinkContent).
// Confirmed rule: a manufactured product cannot be delivered before Manufacturing is complete, and
// Delivery is the next service that moves the completed product to the customer. This page covers
// the direct التصنيع ← التوصيل handover only. Nothing is documented about HOW the handover happens:
// no Blocked/Ready dependency states, no automatic creation or unlocking of a delivery task, no
// status colours, no responsibility or manual/automatic labels, and no timing rules.
module.exports = {
  id: "manufacturing-delivery-link",
  services: ["manufacturing", "delivery"],
  relatedServices: [],
  title: "التصنيع مع التوصيل",
  route: "#/lesson/manufacturing-with-delivery",
  workflowLabel: "مسار علاقة خدمة التصنيع بالتوصيل (التصنيع ← التوصيل)",
  overview:
    "لا يمكن تنفيذ توصيل المنتج المُصنَّع قبل اكتمال خدمة التصنيع. بالنسبة للمنتج الذي يتطلب تصنيعًا، يجب اكتمال المنتج المُصنَّع أولًا، وبعدها تكون خدمة التوصيل هي الخدمة التالية التي ينتقل بها المنتج إلى العميل. الاعتماد المباشر في هذه العلاقة هو التصنيع ← التوصيل.",
  terms: [
    "التصنيع مع التوصيل",
    "المنتج المُصنَّع",
    "اكتمال خدمة التصنيع",
    "خدمة التوصيل",
    "الخدمة التالية",
    "الاعتماد المباشر",
  ],
  stages: [
    {
      id: "manufacturing",
      number: "00",
      title: "التصنيع",
      description:
        "يتم تنفيذ خدمة التصنيع حتى يصبح المنتج المُصنَّع جاهزًا للانتقال إلى الخدمة التالية.",
      execution: null,
      relatedTerms: ["التصنيع", "المنتج المُصنَّع", "جاهز للانتقال", "الخدمة التالية"],
    },
    {
      id: "delivery",
      number: "01",
      title: "التوصيل",
      description:
        "بعد اكتمال خدمة التصنيع، يمكن متابعة دورة المنتج من خلال خدمة التوصيل حتى يصل المنتج إلى العميل.",
      execution: null,
      relatedTerms: ["التوصيل", "بعد اكتمال خدمة التصنيع", "وصول المنتج إلى العميل"],
    },
  ],
  notes: [
    {
      id: "summary",
      title: "الخلاصة",
      text:
        "الاعتماد المباشر في هذه العلاقة هو التصنيع ← التوصيل. يكتمل التصنيع أولًا، وبعد اكتماله يمكن تنفيذ خدمة التوصيل لإيصال المنتج المُصنَّع إلى العميل.",
      relatedTerms: ["الخلاصة", "التصنيع", "التوصيل", "المنتج المُصنَّع"],
    },
  ],
  relationships: [
    {
      id: "dependency",
      title: "اعتماد توصيل المنتج المُصنَّع على اكتمال التصنيع",
      text:
        "لا يمكن تنفيذ توصيل المنتج المُصنَّع قبل اكتمال خدمة التصنيع. التوصيل لا يسبق التصنيع في هذه العلاقة، بل يأتي بعده: يكتمل المنتج المُصنَّع أولًا، ثم تكون خدمة التوصيل هي الخدمة التالية التي ينتقل بها المنتج إلى العميل. التسلسل المباشر هو: التصنيع ← التوصيل.",
      services: ["manufacturing", "delivery"],
      relatedTerms: [
        "لا يمكن تنفيذ توصيل المنتج المُصنَّع",
        "هل التوصيل يسبق التصنيع",
        "شو بيجي بعد التصنيع",
        "متى يدخل المنتج خدمة التوصيل",
      ],
    },
    {
      id: "wider-chain",
      title: "موقع هذه العلاقة من سلسلة الخدمات",
      text:
        "علاقة التصنيع بالتوصيل جزء من سلسلة خدمات أوسع. الجزء الذي يسبق التصنيع (رفع المقاسات ثم التصميم) موثق في صفحة التصنيع مع رفع المقاسات وصفحة التصنيع مع التصميم.",
      services: ["manufacturing", "delivery", "measurement", "design"],
      relatedTerms: ["سلسلة الخدمات", "التصنيع مع رفع المقاسات", "التصنيع مع التصميم"],
    },
    {
      id: "not-documented",
      title: "ما هو غير موثق في علاقة التصنيع بالتوصيل",
      text:
        "غير موثق حاليًا: أي حالة حظر أو جاهزية بسبب الاعتماد (Blocked by Dependency / Dependency Ready)، وأي حالة لونية لاعتماد التصنيع، وأي سلوك آلي ينشئ مهمة التوصيل أو ينقلها أو يفتحها عند اكتمال التصنيع، وأي تصنيف (آلي/يدوي) أو جهة مسؤولة لمراحل هذه العلاقة، وأي مدد زمنية أو قواعد توقيت بين اكتمال التصنيع وتنفيذ التوصيل، وأي سلوك للتصنيع الجزئي أو التوصيل الجزئي. القاعدة المؤكدة الوحيدة: لا يمكن تنفيذ توصيل المنتج المُصنَّع قبل اكتمال خدمة التصنيع.",
      services: ["manufacturing", "delivery"],
      relatedTerms: ["غير موثق", "Blocked by Dependency", "Dependency Ready", "التصنيع الجزئي", "التوصيل الجزئي"],
    },
  ],
};
