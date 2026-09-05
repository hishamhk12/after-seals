const { defineKnowledgeItems } = require("../itemFactory");

const designKnowledge = defineKnowledgeItems([
  {
    id: "service-design-001",
    type: "service",
    domain: "services",
    service: ["design"],
    status: "confirmed",
    source: "know.md",
    title: "Design service exists",
    text: "Design is listed as one of the core services in the customer after-sales journey.",
    relatedTerms: ["Design", "خدمة التصميم", "Customer Journey"],
  },
  {
    id: "workflow-design-high-level-001",
    type: "workflow",
    domain: "services",
    service: ["design", "measurement", "manufacturing", "delivery", "installation"],
    status: "confirmed",
    source: "know.md",
    title: "High-level design-to-installation relationship",
    text: "The educational service journey may include design to measurement to manufacturing to delivery to installation, depending on the scenario. Not every invoice necessarily passes through all of these services.",
    relatedTerms: ["Design", "Measurement", "Manufacturing", "Delivery", "Installation", "Customer Journey"],
  },
  {
    id: "open-design-detail-rules-001",
    type: "open_question",
    domain: "services",
    service: ["design"],
    status: "open",
    source: "know.md",
    title: "Detailed design rules unavailable",
    text: "The source explicitly says detailed business rules for design were not built to the same level as Delivery and Installation.",
    relatedTerms: ["Design Rules", "Open Question", "Business Rules"],
  },
]);

module.exports = {
  designKnowledge,
};
