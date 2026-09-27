// Source of truth: rendered page #/lesson/warehouse-pickup (app.js renderWarehousePickupWorkflow).
module.exports = {
  id: "warehouse-pickup",
  services: ["warehouse_pickup"],
  relatedServices: ["delivery"],
  title: "خدمة استلام العميل البضاعة من المستودع",
  route: "#/lesson/warehouse-pickup",
  workflowLabel: "مسار خدمة استلام العميل البضاعة من المستودع",
  overview:
    "تعرض الصفحة دورة عمل خدمة استلام العميل البضاعة من المستودع، وهي ضمن الباب الأول — أنواع خدمات التوصيل. تتكون الدورة من ثلاث مراحل، وجميعها منفذة بشكل آلي من خلال النظام.",
  terms: ["خدمة الاستلام من المستودع", "استلام العميل البضاعة من المستودع", "المستودع", "Warehouse Pickup"],
  stages: [
    {
      id: "invoice",
      number: "00",
      title: "فاتورة من SAP",
      description: "وصول فاتورة من SAP تحتوي على خدمة استلام العميل البضاعة من المستودع.",
      execution: "آلي من خلال النظام",
      relatedTerms: ["فاتورة من SAP", "SAP"],
    },
    {
      id: "customer-message",
      number: "01",
      title: "إرسال رسالة إلى العميل",
      description: "يقوم النظام تلقائيًا بإرسال رسالة إلى العميل لإبلاغه بجاهزية البضاعة للاستلام من المستودع.",
      execution: "آلي من خلال النظام",
      relatedTerms: ["رسالة", "إبلاغ العميل", "جاهزية البضاعة"],
    },
    {
      id: "customer-receipt",
      number: "02",
      title: "تأكيد استلام العميل",
      description: "بعد استلام العميل للبضاعة، يتم تأكيد الاستلام داخل النظام وتكتمل دورة الخدمة.",
      execution: "آلي من خلال النظام",
      relatedTerms: ["تأكيد الاستلام", "اكتمال الخدمة"],
    },
  ],
};
