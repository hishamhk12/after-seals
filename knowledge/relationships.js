const { defineKnowledgeItems } = require("./itemFactory");

const relationshipsKnowledge = defineKnowledgeItems([
  {
    id: "relationship-core-after-sales-chain-001",
    type: "mapping",
    domain: "relationships",
    service: [],
    status: "confirmed",
    source: "know.md",
    title: "Core after-sales relationship chain",
    text: "The core relationship chain is Customer, SAP Invoice, Invoice Line, Product, Service, Warehouse, Operational Team, Appointment, Technician, Execution, Partial or Complete, and Customer Rating.",
    relatedTerms: ["Customer", "SAP Invoice", "Invoice Line", "Product", "Service", "Warehouse", "Operational Team", "Appointment", "Technician", "Execution", "Customer Rating"],
  },
  {
    id: "relationship-target-system-map-001",
    type: "mapping",
    domain: "relationships",
    service: [],
    status: "proposed",
    source: "know.md",
    title: "Target system relationship map",
    text: "The target system map places SAP Sales or Invoice as the source of Products and Services, linked by Product-Service mapping, flowing into Odoo After Sales Request, Branch, Warehouse, Service Type, Operational Team, Service Task, Appointment, Technician, Products, Execution, Partial or Done, Customer Rating, Reports and Analytics, and AI calls or tickets analysis.",
    relatedTerms: ["Target System", "SAP", "Odoo", "After Sales Request", "Product-Service", "Operational Team", "Reports", "Analytics", "AI"],
  },
  {
    id: "relationship-service-end-to-end-map-001",
    type: "workflow",
    domain: "relationships",
    service: ["design", "measurement", "manufacturing", "internal_transfer", "delivery", "installation", "maintenance"],
    status: "confirmed",
    source: "know.md",
    title: "Service end-to-end map",
    text: "At a high level, customer purchase from SAP leads to invoice or request, then design, measurement, or direct service paths. Design and measurement can lead to manufacturing, then goods readiness, internal transfer when needed, delivery, installation, completion or completion later with a new appointment, and customer rating. After execution, customer issues can lead to Field Maintenance, technician or appointment, resolution, and rating.",
    relatedTerms: ["Design", "Measurement", "Manufacturing", "Readiness", "Internal Transfer", "Delivery", "Installation", "تكملة لاحقًا", "Field Maintenance", "Rating"],
  },
  {
    id: "relationship-service-dependencies-001",
    type: "mapping",
    domain: "relationships",
    service: ["measurement", "manufacturing", "internal_transfer", "delivery", "installation"],
    status: "confirmed",
    source: "know.md",
    title: "Service dependencies",
    text: "Supported service dependencies include Measurement to Manufacturing, Manufacturing to Readiness, Readiness to Delivery, and Delivery to Installation. Internal Transfer may occur before delivery or installation when needed for readiness.",
    relatedTerms: ["Measurement", "Manufacturing", "Readiness", "Delivery", "Installation", "Internal Transfer"],
  },
]);

module.exports = {
  relationshipsKnowledge,
};
