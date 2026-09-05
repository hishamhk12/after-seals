const { defineKnowledgeItems } = require("../itemFactory");

const maintenanceKnowledge = defineKnowledgeItems([
  {
    id: "service-maintenance-001",
    type: "service",
    domain: "services",
    service: ["maintenance"],
    status: "confirmed",
    source: "know.md",
    title: "Field Maintenance service exists",
    text: "Field Maintenance is included among the After-Sales services and is different from Installation because it typically starts after the product is already with the customer.",
    relatedTerms: ["Field Maintenance", "الصيانة الميدانية", "Installation", "Customer Issue"],
  },
  {
    id: "workflow-maintenance-conceptual-001",
    type: "workflow",
    domain: "services",
    service: ["maintenance"],
    status: "unconfirmed",
    source: "know.md",
    title: "Conceptual Field Maintenance flow",
    text: "The conceptual Field Maintenance flow is Customer Issue, Maintenance Request, Diagnosis, Technician Assignment, Appointment, Field Visit, Repair or Action, and Completion. Detailed business rules are not finalized.",
    relatedTerms: ["Customer Issue", "Maintenance Request", "Diagnosis", "Technician Assignment", "Field Visit", "Completion"],
  },
  {
    id: "open-maintenance-detail-rules-001",
    type: "open_question",
    domain: "services",
    service: ["maintenance"],
    status: "open",
    source: "know.md",
    title: "Detailed Field Maintenance rules unavailable",
    text: "The source explicitly says Field Maintenance is less defined and does not have final business rules at the same level of detail as Delivery and Installation.",
    relatedTerms: ["Field Maintenance Rules", "Open Question", "Warranty", "Spare Parts", "Returns"],
  },
]);

module.exports = {
  maintenanceKnowledge,
};
