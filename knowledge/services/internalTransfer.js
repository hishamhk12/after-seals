const { defineKnowledgeItems } = require("../itemFactory");

const internalTransferKnowledge = defineKnowledgeItems([
  {
    id: "service-internal-transfer-001",
    type: "service",
    domain: "services",
    service: ["internal_transfer"],
    status: "confirmed",
    source: "know.md",
    title: "Internal Transfer service nature",
    text: "Internal Transfer is different from direct customer-facing services because it is more of an internal operation.",
    relatedTerms: ["Internal Transfer", "التحويلات الداخلية", "Internal Operation"],
  },
  {
    id: "workflow-internal-transfer-readiness-001",
    type: "workflow",
    domain: "services",
    service: ["internal_transfer", "delivery", "installation"],
    status: "confirmed",
    source: "know.md",
    title: "Internal Transfer as readiness dependency",
    text: "Internal Transfer may be needed when goods are in one warehouse and the team executing the service belongs to another location. The high-level path is Product, Warehouse A, Internal Transfer, Warehouse B, then Delivery or Installation.",
    relatedTerms: ["Warehouse A", "Warehouse B", "Readiness", "Delivery", "Installation"],
  },
  {
    id: "uat-internal-transfer-j504-j521-001",
    type: "uat_scenario",
    domain: "uat",
    service: ["internal_transfer"],
    status: "historical_test",
    source: "know.md",
    title: "Internal Transfer UAT example J504 to J521",
    text: "A UAT scenario used invoice INV/2026/00087 for Internal Transfer from J504 to J521. The task could be created manually. This is historical UAT evidence, not a universal business rule.",
    relatedTerms: ["INV/2026/00087", "J504", "J521", "Manual Creation", "Internal Transfer"],
  },
  {
    id: "uat-internal-transfer-locked-fields-001",
    type: "uat_observation",
    domain: "uat",
    service: ["internal_transfer"],
    status: "observed",
    source: "know.md",
    title: "Locked fields in Internal Transfer UAT",
    text: "During Internal Transfer testing, some fields were initially locked.",
    relatedTerms: ["Internal Transfer", "Locked Fields", "UAT"],
  },
]);

module.exports = {
  internalTransferKnowledge,
};
