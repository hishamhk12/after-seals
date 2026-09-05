const { defineKnowledgeItems } = require("../itemFactory");

const measurementKnowledge = defineKnowledgeItems([
  {
    id: "service-measurement-001",
    type: "service",
    domain: "services",
    service: ["measurement"],
    status: "confirmed",
    source: "know.md",
    title: "Measurement service exists",
    text: "Measurement is one of the core After-Sales services and appears in Odoo model names close to decor_measurement and manufacturing_measurement.",
    relatedTerms: ["Measurement", "رفع القياسات", "decor_measurement", "manufacturing_measurement"],
  },
  {
    id: "mapping-measurement-types-001",
    type: "mapping",
    domain: "services",
    service: ["measurement"],
    status: "unconfirmed",
    source: "know.md",
    title: "Possible measurement purpose distinction",
    text: "The source indicates a possible design distinction between decoration measurements and manufacturing measurements, with separate sequences for records, but detailed rules are not finalized.",
    relatedTerms: ["Decoration Measurement", "Manufacturing Measurement", "Sequence", "Unconfirmed"],
  },
]);

module.exports = {
  measurementKnowledge,
};
