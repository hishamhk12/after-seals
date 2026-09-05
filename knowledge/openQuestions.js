const { defineKnowledgeItems } = require("./itemFactory");

const openQuestionsKnowledge = defineKnowledgeItems([
  {
    id: "open-sales-office-mapping-001",
    type: "open_question",
    domain: "integration",
    service: [],
    status: "open",
    source: "know.md",
    title: "Complete Sales Office mapping table",
    text: "The real mapping table for every Sales Office must be completed. If a new Sales Office arrives without mapping, an invoice may enter Odoo without a responsible team.",
    relatedTerms: ["Sales Office", "Mapping Table", "Responsible Team", "Odoo"],
  },
  {
    id: "open-product-service-cancellation-001",
    type: "open_question",
    domain: "integration",
    service: [],
    status: "open",
    source: "know.md",
    title: "Service cancellation behavior for returned products",
    text: "When a returned product is linked to a service, the system needs business rules for what happens to the related service. The source states this must be decided by business rule and should not automatically cancel all invoice services.",
    relatedTerms: ["Returns", "Cancellation", "Product-Service Relationship", "Business Rule"],
  },
  {
    id: "open-service-specific-stages-001",
    type: "open_question",
    domain: "workflow",
    service: [],
    status: "open",
    source: "know.md",
    title: "Service-specific stages need finalization",
    text: "The project needs richer stages than Pending, In Progress, and Done, such as New, Waiting for Customer, Appointment Booked, Ready, In Progress, Partial or تكملة لاحقًا, and Done. Some services need stages different from others.",
    relatedTerms: ["Stages", "Pending", "In Progress", "Done", "Waiting for Customer", "Appointment Booked", "Ready", "Partial", "تكملة لاحقًا"],
  },
  {
    id: "open-educational-site-scope-001",
    type: "open_question",
    domain: "training",
    service: [],
    status: "proposed",
    source: "know.md",
    title: "Educational site service training scope",
    text: "The educational HTML site is intended to explain Customer Journey, Business Flow, Business Rules, and System Actions for each service, starting with delivery and a guided overview. This is a project direction rather than a confirmed operational rule.",
    relatedTerms: ["Educational Site", "Customer Journey", "Business Flow", "Business Rules", "System Actions", "خدمة التوصيل"],
  },
]);

module.exports = {
  openQuestionsKnowledge,
};
