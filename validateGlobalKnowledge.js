const fs = require("node:fs");
const path = require("node:path");
const { globalKnowledgeItems } = require("./knowledge/globalKnowledge");
const { VALID_SERVICES, VALID_STATUSES, VALID_TYPES } = require("./knowledge/statuses");

const KNOW_SOURCE = "know.md";
const knowPath = path.join(__dirname, KNOW_SOURCE);

function main() {
  const errors = [];

  validateGlobalKnowledge(globalKnowledgeItems, errors);
  printSummary(globalKnowledgeItems, errors);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

function validateGlobalKnowledge(items = globalKnowledgeItems, errors = []) {
  if (!fs.existsSync(knowPath)) {
    errors.push("know.md is missing.");
  }

  validateItems(items, errors);
  return { ok: errors.length === 0, errors };
}

function validateItems(items, errors) {
  if (!Array.isArray(items)) {
    errors.push("globalKnowledgeItems must be an array.");
    return;
  }

  const ids = new Set();
  const duplicateKeys = new Set();

  for (const [index, item] of items.entries()) {
    const location = item?.id || `item at index ${index}`;

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${location}: item must be an object.`);
      continue;
    }

    for (const field of ["id", "type", "domain", "status", "source", "title", "text", "relatedTerms"]) {
      if (!(field in item)) {
        errors.push(`${location}: missing required field ${field}.`);
      }
    }

    if (typeof item.id !== "string" || !item.id.trim()) {
      errors.push(`${location}: id must be a non-empty string.`);
    } else if (ids.has(item.id)) {
      errors.push(`${location}: duplicate id.`);
    } else {
      ids.add(item.id);
    }

    if (!VALID_TYPES.includes(item.type)) {
      errors.push(`${location}: invalid type ${JSON.stringify(item.type)}.`);
    }

    if (!VALID_STATUSES.includes(item.status)) {
      errors.push(`${location}: invalid status ${JSON.stringify(item.status)}.`);
    }

    if (item.source !== KNOW_SOURCE) {
      errors.push(`${location}: source must be ${KNOW_SOURCE}.`);
    }

    if (typeof item.text !== "string" || !item.text.trim()) {
      errors.push(`${location}: text must be non-empty.`);
    }

    if (!Array.isArray(item.relatedTerms)) {
      errors.push(`${location}: relatedTerms must be an array.`);
    }

    if ("service" in item) {
      const services = Array.isArray(item.service) ? item.service : [item.service];
      for (const service of services.filter(Boolean)) {
        if (!VALID_SERVICES.includes(service)) {
          errors.push(`${location}: invalid service ${JSON.stringify(service)}.`);
        }
      }
    }

    const duplicateKey = normalizeDuplicateKey(item);
    if (duplicateKeys.has(duplicateKey)) {
      errors.push(`${location}: duplicate item content.`);
    }
    duplicateKeys.add(duplicateKey);
  }
}

function normalizeDuplicateKey(item) {
  return [item?.type, item?.domain, item?.status, item?.title, item?.text]
    .map((value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " "))
    .join("|");
}

function printSummary(items, errors) {
  console.log(`totalItems=${items.length}`);
  console.log(`countsByType=${JSON.stringify(countBy(items, "type"))}`);
  console.log(`countsByStatus=${JSON.stringify(countBy(items, "status"))}`);
  console.log(`countsByService=${JSON.stringify(countByService(items))}`);
  console.log(`openOrUnconfirmed=${items.filter((item) => ["open", "unconfirmed"].includes(item.status)).length}`);
  console.log(`knowMdExists=${fs.existsSync(knowPath)}`);
  console.log(`result=${errors.length === 0 ? "PASS" : "FAIL"}`);
}

function countBy(items, field) {
  return items.reduce((counts, item) => {
    const key = item[field] || "(none)";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function countByService(items) {
  return items.reduce((counts, item) => {
    const services = Array.isArray(item.service) ? item.service : item.service ? [item.service] : [];
    if (services.length === 0) {
      counts.global = (counts.global || 0) + 1;
      return counts;
    }

    for (const service of services) {
      counts[service] = (counts[service] || 0) + 1;
    }

    return counts;
  }, {});
}

if (require.main === module) {
  main();
}

module.exports = {
  countBy,
  countByService,
  validateGlobalKnowledge,
};
