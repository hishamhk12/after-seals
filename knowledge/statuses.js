const VALID_STATUSES = [
  "confirmed",
  "observed",
  "requirement",
  "proposed",
  "open",
  "unconfirmed",
  "historical_test",
  // Kept for the record but excluded from retrieval: replaced by a current approved workflow.
  "superseded",
];

const VALID_TYPES = [
  "system_overview",
  "service",
  "field",
  "business_rule",
  "requirement",
  "workflow",
  "integration",
  "mapping",
  "uat_scenario",
  "uat_observation",
  "known_error",
  "customer_experience",
  "analytics",
  "ai_use_case",
  "open_question",
];

const VALID_SERVICES = [
  "delivery",
  "installation",
  "measurement",
  "manufacturing",
  "design",
  "internal_transfer",
  "maintenance",
  "warehouse_pickup",
  "customer_service",
];

module.exports = {
  VALID_SERVICES,
  VALID_STATUSES,
  VALID_TYPES,
};
