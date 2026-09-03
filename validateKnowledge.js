const { buildPageContext, buildKnowledgeChunks } = require("./pageKnowledge");

const pageId = "intro-tour";
const context = buildPageContext(pageId);
const chunks = buildKnowledgeChunks(pageId);
const requiredTerms = [
  "Assign",
  "Assignees",
  "Stage",
  "Appointment From",
  "Appointment To",
  "حجز موعد التوصيل",
  "تعيين السائق",
  "Task Forms",
  "بوابة السائق",
  "OTP",
  "Completed",
];

const missingTerms = requiredTerms.filter((term) => !chunks.some((chunk) => chunk.text.includes(term) || chunk.title.includes(term) || chunk.relatedTerms.includes(term)));

console.log(`contextNonEmpty=${context.length > 0}`);
console.log(`contextLength=${context.length}`);
console.log(`chunkCount=${chunks.length}`);
console.log(`missingTerms=${missingTerms.length ? missingTerms.join(", ") : "none"}`);

if (!context || missingTerms.length > 0) {
  process.exitCode = 1;
}
