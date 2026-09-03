const { buildGroundedPrompt, FALLBACK_ANSWER, hasRequiredExactTerms } = require("./llmService");

const retrievedContext = [
  "[Chunk: intro-tour:field:stage]",
  "Type: field",
  "Title: Stage",
  "Content:",
  "Stage: المرحلة الحالية التي وصلت إليها المهمة ضمن دورة تنفيذ الخدمة.",
  "",
  "[Chunk: intro-tour:field:otp]",
  "Type: field",
  "Title: OTP",
  "Content:",
  "OTP: رمز تأكيد يرسل إلى العميل ويستخدم لتأكيد استلام الخدمة.",
].join("\n");

const prompt = buildGroundedPrompt({ question: "شو يعني Stage؟", retrievedContext });
const checks = [
  ["usesRetrievedChunks", prompt.includes("Retrieved chunks:") && prompt.includes(retrievedContext)],
  ["doesNotUseFullPageContextLabel", !prompt.includes("CURRENT PAGE KNOWLEDGE") && !prompt.includes("STAGES AND SCREENS:")],
  ["strictFallbackPresent", prompt.includes(FALLBACK_ANSWER)],
  ["preservesOdooTerms", ["Assign", "Assignees", "Stage", "Appointment From", "Appointment To", "Task Forms", "OTP", "Completed"].every((term) => prompt.includes(term))],
  ["lengthAdaptationPresent", prompt.includes("Adapt answer length")],
  ["multiChunkSequencePresent", prompt.includes("multi-chunk sequence")],
  ["operationCaseRejected", hasRequiredExactTerms("شو هو Operation Case؟", "Title: Operations\nContent: Operations indicator") === false],
  ["endTaskAccepted", hasRequiredExactTerms("شو بصير بعد End Task؟", "Title: End Task\nContent: End Task appears after upload") === true],
];

for (const [name, passed] of checks) {
  console.log(`${name}=${passed}`);

  if (!passed) {
    process.exitCode = 1;
  }
}

console.log(`result=${process.exitCode ? "FAIL" : "PASS"}`);
