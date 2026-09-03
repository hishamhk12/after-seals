const { loadEnvFile } = require("./embeddingService");

const FALLBACK_ANSWER = "المعلومة غير متوفرة ضمن هذه الصفحة.";
const ERROR_ANSWER = "تعذر الحصول على إجابة حاليًا. حاول مرة أخرى.";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const MAX_OUTPUT_TOKENS = 1400;
const TEMPERATURE = 0.05;

async function answerFromRetrievedContext({ question, retrievedContext }) {
  loadEnvFile();

  if (!process.env.ai) {
    throw new Error("Gemini API key is missing. Set process.env.ai in .env.");
  }

  if (!retrievedContext || !hasRequiredExactTerms(question, retrievedContext)) {
    return FALLBACK_ANSWER;
  }

  const prompt = buildGroundedPrompt({ question, retrievedContext });
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.ai,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: TEMPERATURE,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      }),
    },
  );

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    throw new Error(`status=${geminiResponse.status} ${geminiResponse.statusText}; body=${limitLogText(errorText)}`);
  }

  const data = await geminiResponse.json();
  const answer = stripGroundingIntro(data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim());

  return answer || FALLBACK_ANSWER;
}

function buildGroundedPrompt({ question, retrievedContext }) {
  return [
    "You are the LLM generation layer for an internal Arabic Odoo After-Sales training assistant.",
    "",
    "Use only the source material provided below to answer. Treat it as the complete allowed source for this turn.",
    "",
    "Internal accuracy rules:",
    `- If the source material does not directly support the answer, respond exactly: ${FALLBACK_ANSWER}`,
    "- Do not use outside Odoo knowledge.",
    "- Do not invent missing workflow behavior, missing fields, future stages, or business rules.",
    "- Do not answer from a similar-sounding term if the exact requested concept is not present in the source material.",
    "- Preserve Odoo terms exactly when useful: Assign, Assignees, Stage, Appointment From, Appointment To, Task Forms, Start, End Task, OTP, Completed.",
    "- For multi-part sequence questions, combine the relevant facts into the clearest supported sequence.",
    "- For appointment or booking timing questions, include both the scheduling/readiness point and the allowed booking window when those details are present.",
    "- Start supported answers directly with the useful answer.",
    "- Do not include provenance, source, scope, or retrieval-process preambles in supported answers.",
    "- Do not begin with Arabic phrases that mean 'according to the available information' or 'based on the page'.",
    "- Adapt answer length to the question: define simple terms briefly, compare two fields in 2-3 lines, and use a short ordered list for sequence questions.",
    "- Answer in clear Arabic.",
    "",
    "Facts:",
    retrievedContext,
    "",
    "User question:",
    question,
  ].join("\n");
}

function stripGroundingIntro(answer) {
  if (answer === FALLBACK_ANSWER) {
    return answer;
  }

  return String(answer || "")
    .replace(/^\s*(وفقًا للمعلومات المتاحة في الصفحة|وفقًا للمعلومات المتاحة|حسب المعلومات المتاحة|حسب المعلومات المتوفرة|بناءً على المعلومات المتاحة)\s*[:：،.-]?\s*/i, "")
    .trim();
}

function hasRequiredExactTerms(question, retrievedContext) {
  const questionTerms = extractEnglishTerms(question);

  if (questionTerms.length === 0) {
    return true;
  }

  const context = normalizeEnglish(retrievedContext);
  return questionTerms.every((term) => context.includes(term));
}

function extractEnglishTerms(value) {
  const matches = String(value || "").match(/[A-Za-z][A-Za-z0-9]*(?:\s+[A-Za-z][A-Za-z0-9]*)*/g) || [];
  const terms = [];

  for (const match of matches) {
    const normalized = normalizeEnglish(match);

    if (!normalized || ENGLISH_STOP_WORDS.has(normalized)) {
      continue;
    }

    terms.push(normalized);
  }

  return [...new Set(terms)];
}

function normalizeEnglish(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limitLogText(text) {
  return String(text || "").replace(/\s+/g, " ").slice(0, 700);
}

const ENGLISH_STOP_WORDS = new Set(["a", "an", "and", "or", "the", "is", "are", "what", "how", "when", "who"]);

module.exports = {
  ERROR_ANSWER,
  FALLBACK_ANSWER,
  answerFromRetrievedContext,
  buildGroundedPrompt,
  hasRequiredExactTerms,
  stripGroundingIntro,
};
