// Structured page knowledge for completed service pages (stages with number / title /
// description / execution), taken from the rendered website. The Delivery page (intro-tour)
// keeps its richer hand-written entry in pageKnowledge.js; LEGACY_PAGE_META gives it metadata.
const internalTransfer = require("./internalTransfer");
const warehousePickup = require("./warehousePickup");
const design = require("./design");
const manufacturing = require("./manufacturing");
const measurement = require("./measurement");
const installation = require("./installation");
const installationPartial = require("./installationPartial");
const internalTransferDeliveryLink = require("./internalTransferDeliveryLink");
const installationDeliveryLink = require("./installationDeliveryLink");
const installationInternalTransferLink = require("./installationInternalTransferLink");
const installationManufacturingLink = require("./installationManufacturingLink");
const manufacturingMeasurementLink = require("./manufacturingMeasurementLink");
const manufacturingDesignLink = require("./manufacturingDesignLink");
const manufacturingDeliveryLink = require("./manufacturingDeliveryLink");
const manufacturingInstallationLink = require("./manufacturingInstallationLink");
const compositeManufacturingEndToEnd = require("./compositeManufacturingEndToEnd");
const { deliveryReturns, installationReturns } = require("./returns");
const { customerService, complaints, maintenance, accessServices, accessInvoices } = require("./customerService");

const structuredPages = [
  internalTransfer,
  warehousePickup,
  internalTransferDeliveryLink,
  deliveryReturns,
  measurement,
  design,
  manufacturing,
  installation,
  installationPartial,
  installationDeliveryLink,
  installationInternalTransferLink,
  installationManufacturingLink,
  manufacturingMeasurementLink,
  manufacturingDesignLink,
  manufacturingDeliveryLink,
  manufacturingInstallationLink,
  compositeManufacturingEndToEnd,
  installationReturns,
  customerService,
  complaints,
  maintenance,
  accessServices,
  accessInvoices,
];

const SERVICE_NAMES = {
  delivery: "خدمة التوصيل",
  internal_transfer: "التحويلات الداخلية",
  warehouse_pickup: "خدمة استلام العميل البضاعة من المستودع",
  measurement: "خدمة رفع المقاسات",
  design: "خدمة التصميم",
  manufacturing: "خدمة التصنيع",
  installation: "خدمة التركيب",
  customer_service: "خدمة العملاء",
  maintenance: "خدمة الصيانة",
};

// Service metadata for the hand-written Delivery page in pageKnowledge.js.
const LEGACY_PAGE_META = {
  "intro-tour": {
    services: ["delivery"],
    relatedServices: ["internal_transfer", "installation"],
    relatedPages: ["internal-transfer-delivery-link", "delivery-returns"],
    route: "#/lesson/customer-delivery",
  },
};

module.exports = { structuredPages, SERVICE_NAMES, LEGACY_PAGE_META };
