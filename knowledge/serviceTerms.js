// The words a reader uses to name each After-Sales service. Shared by the local knowledge search
// (localSearchService.js) and the offline RAG tooling (hybridRetrievalService.js).
const SERVICE_TERMS = {
  delivery: ["خدمة التوصيل", "التوصيل", "Delivery"],
  installation: ["التركيب", "خدمة التركيب", "Installation"],
  measurement: ["رفع القياسات", "القياسات", "قياسات", "رفع المقاسات", "المقاسات", "مقاسات", "Measurement"],
  manufacturing: ["التصنيع", "خدمة التصنيع", "Manufacturing"],
  design: ["التصميم", "خدمة التصميم", "Design"],
  internal_transfer: ["التحويلات الداخلية", "التحويل الداخلي", "النقل الداخلي", "Internal Transfer"],
  maintenance: ["الصيانة الميدانية", "الصيانة", "Field Maintenance", "Maintenance"],
  warehouse_pickup: ["الاستلام من المستودع", "استلام العميل البضاعة", "استلام البضاعة من المستودع", "يستلم من المستودع", "Warehouse Pickup"],
  customer_service: ["خدمة العملاء", "الشكاوى", "شكوى", "الاستفسارات", "Customer Service", "مكتب المساعدة", "Helpdesk", "التذكرة", "التذاكر", "Customer Care"],
};

module.exports = { SERVICE_TERMS };
