// Source of truth: rendered pages #/lesson/full-cancellation + #/lesson/partial-return (Delivery)
// and #/lesson/installation-full-cancellation + #/lesson/installation-partial-return (Installation),
// rendered by app.js renderMinimalPlaceholderPage / renderPartialReturnContent.
function buildReturnsPage({ id, service, serviceLabel, routes }) {
  return {
    id,
    services: [service],
    relatedServices: [],
    title: `المرتجعات والإلغاءات — ${serviceLabel}`,
    route: routes.join(" + "),
    workflowLabel: `مسار المرتجع الجزئي لفاتورة ${serviceLabel}`,
    overview: `يغطي هذا القسم حالتين لـ${serviceLabel}: إلغاء كامل للفاتورة، ومرتجع جزئي للفاتورة.`,
    terms: ["المرتجعات والإلغاءات", "إلغاء كامل للفاتورة", "مرتجع جزئي للفاتورة", "مرتجع SAP", serviceLabel],
    stages: [
      {
        id: "return-arrival",
        number: "00",
        title: "وصول مرتجع من SAP",
        description: "يبدأ مسار المرتجع الجزئي للفاتورة بوصول مرتجع من SAP.",
        paraphrased: true, // the page shows this stage as a diagram card only
        execution: null,
        relatedTerms: ["وصول مرتجع من SAP", "مرتجع جزئي"],
      },
      {
        id: "return-review",
        number: "01",
        title: "التحقق من محتوى المرتجع",
        description:
          "يتم التحقق من محتوى المرتجع: إذا كان المرتجع يحتوي على الخدمة ← إلغاء الخدمة تلقائيًا. إذا كان المرتجع يحتوي على أصناف فقط ← قرار الشخص المسؤول ← إلغاء الخدمة أو استمرار الخدمة.",
        paraphrased: true, // the page shows this branch as a diagram
        execution: null,
        relatedTerms: ["التحقق من محتوى المرتجع", "إلغاء الخدمة تلقائيًا", "قرار الشخص المسؤول"],
      },
    ],
    notes: [
      {
        id: "full-cancellation",
        title: "إلغاء كامل للفاتورة",
        text: `عند وصول فاتورة إلغاء من SAP إلى نظام خدمات مابعد البيع، يتم إلغاء ${serviceLabel} المرتبطة بالفاتورة ما لم تكن الخدمة قد تم تسليمها أو إكمالها مسبقًا.`,
        relatedTerms: ["إلغاء كامل للفاتورة", "فاتورة إلغاء", "SAP"],
      },
      {
        id: "partial-return-case-01",
        title: "مرتجع جزئي للفاتورة — الحالة 01",
        text: `إذا كان مرتجع SAP يحتوي على ${serviceLabel}، يتم إلغاء ${serviceLabel} تلقائيًا داخل نظام خدمات مابعد البيع.`,
        relatedTerms: ["مرتجع جزئي", "الحالة 01", "إلغاء تلقائي"],
      },
      {
        id: "partial-return-case-02",
        title: "مرتجع جزئي للفاتورة — الحالة 02",
        text: `إذا كان المرتجع يحتوي على أصناف فقط دون ${serviceLabel}، فلا يتم إلغاء ${serviceLabel} تلقائيًا، ويكون قرار إلغاء الخدمة أو استمرارها لدى الشخص المسؤول.`,
        relatedTerms: ["مرتجع جزئي", "الحالة 02", "أصناف فقط", "الشخص المسؤول"],
      },
    ],
  };
}

module.exports = {
  deliveryReturns: buildReturnsPage({
    id: "delivery-returns",
    service: "delivery",
    serviceLabel: "خدمة التوصيل",
    routes: ["#/lesson/full-cancellation", "#/lesson/partial-return"],
  }),
  installationReturns: buildReturnsPage({
    id: "installation-returns",
    service: "installation",
    serviceLabel: "خدمة التركيب",
    routes: ["#/lesson/installation-full-cancellation", "#/lesson/installation-partial-return"],
  }),
};
