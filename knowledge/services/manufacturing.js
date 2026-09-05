const { defineKnowledgeItems } = require("../itemFactory");

const manufacturingKnowledge = defineKnowledgeItems([
  {
    id: "service-manufacturing-001",
    type: "service",
    domain: "services",
    service: ["manufacturing"],
    status: "confirmed",
    source: "know.md",
    title: "Manufacturing in After-Sales flow",
    text: "Manufacturing is part of the After-Sales flow for products that may not be ready directly after sale. The source mentions related objects such as manufacturing_measurement and manufacturing sequence.",
    relatedTerms: ["Manufacturing", "خدمة التصنيع", "manufacturing_measurement", "manufacturing sequence"],
  },
  {
    id: "workflow-manufacturing-high-level-001",
    type: "workflow",
    domain: "services",
    service: ["manufacturing", "measurement", "delivery", "installation"],
    status: "confirmed",
    source: "know.md",
    title: "High-level manufacturing dependency",
    text: "A supported high-level flow is Sale to Measurement to Manufacturing to Warehouse or Readiness to Delivery to Installation, depending on product and service type.",
    relatedTerms: ["Sale", "Measurement", "Manufacturing", "Warehouse", "Readiness", "Delivery", "Installation"],
  },
  {
    id: "open-manufacturing-detail-rules-001",
    type: "open_question",
    domain: "services",
    service: ["manufacturing"],
    status: "open",
    source: "know.md",
    title: "Detailed manufacturing rules unavailable",
    text: "The source explicitly says detailed business rules for manufacturing were not built to the same level as Delivery and Installation.",
    relatedTerms: ["Manufacturing Rules", "Open Question", "Business Rules"],
  },
]);

module.exports = {
  manufacturingKnowledge,
};
