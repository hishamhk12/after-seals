const { retrieveRelevantChunks } = require("./retrievalService");

const pageId = "intro-tour";
const tests = [
  {
    label: "Assign vs Assignees",
    question: "شو الفرق بين Assign و Assignees؟",
    expected: ["assign", "assignees"],
  },
  {
    label: "Booking window",
    question: "متى العميل بيقدر يحجز؟",
    expected: ["appointment", "booking"],
  },
  {
    label: "Driver assignment to completion",
    question: "شو بصير من وقت تعيين السائق لحد انتهاء التوصيل؟",
    expected: ["driver", "portal", "completed"],
  },
  {
    label: "OTP meaning",
    question: "شو يعني OTP؟",
    expected: ["otp"],
  },
  {
    label: "Unsupported return",
    question: "كيف بعمل مرتجع؟",
    expected: [],
  },
];

async function main() {
  for (const test of tests) {
    const result = await retrieveRelevantChunks({ pageId, question: test.question, topK: 5 });
    const ids = result.chunks.map((chunk) => chunk.id);
    const haystack = result.chunks.map((chunk) => `${chunk.id} ${chunk.title} ${chunk.text} ${chunk.relatedTerms.join(" ")}`).join(" ").toLowerCase();
    const hasExpected = test.expected.length === 0 ? result.thresholdTriggered : test.expected.every((term) => haystack.includes(term.toLowerCase()));

    console.log(`${test.label}: ${hasExpected ? "PASS" : "FAIL"}`);
    console.log(`topScore=${result.topScore.toFixed(6)} thresholdTriggered=${result.thresholdTriggered}`);
    console.log(`chunks=${ids.join(", ") || "none"}`);

    if (!hasExpected) {
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
