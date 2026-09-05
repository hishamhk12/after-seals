const { businessRulesKnowledge } = require("./businessRules");
const { customerExperienceKnowledge } = require("./customerExperience");
const { integrationKnowledge } = require("./integration");
const { openQuestionsKnowledge } = require("./openQuestions");
const { relationshipsKnowledge } = require("./relationships");
const { uatKnowledge } = require("./uatKnowledge");
const { deliveryKnowledge } = require("./services/delivery");
const { designKnowledge } = require("./services/design");
const { installationKnowledge } = require("./services/installation");
const { internalTransferKnowledge } = require("./services/internalTransfer");
const { maintenanceKnowledge } = require("./services/maintenance");
const { manufacturingKnowledge } = require("./services/manufacturing");
const { measurementKnowledge } = require("./services/measurement");

const globalKnowledgeItems = [
  ...integrationKnowledge,
  ...businessRulesKnowledge,
  ...uatKnowledge,
  ...customerExperienceKnowledge,
  ...openQuestionsKnowledge,
  ...relationshipsKnowledge,
  ...deliveryKnowledge,
  ...installationKnowledge,
  ...measurementKnowledge,
  ...manufacturingKnowledge,
  ...designKnowledge,
  ...internalTransferKnowledge,
  ...maintenanceKnowledge,
];

module.exports = {
  globalKnowledgeItems,
};
