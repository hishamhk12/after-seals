const { loadEnvFile } = require("./embeddingService");

const FALLBACK_ANSWER = "المعلومة غير متوفرة ضمن هذه الصفحة.";
const GLOBAL_FALLBACK_ANSWER = "المعلومة غير موثقة ضمن مسارات خدمات ما بعد البيع الحالية.";
const ERROR_ANSWER = "تعذر الحصول على إجابة حاليًا. حاول مرة أخرى.";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
// Cross-service answers list many stages; 1400 tokens truncated them mid-sentence.
const MAX_OUTPUT_TOKENS = 3000;
const TEMPERATURE = 0.05;

async function answerFromRetrievedContext({ question, retrievedContext, queryUnderstanding = null, fallbackAnswer = FALLBACK_ANSWER }) {
  loadEnvFile();

  if (!process.env.ai) {
    throw new Error("Gemini API key is missing. Set process.env.ai in .env.");
  }

  if (!retrievedContext || !hasRequiredExactTerms(question, retrievedContext)) {
    return fallbackAnswer;
  }

  const prompt = buildGroundedPrompt({ question, retrievedContext, queryUnderstanding, fallbackAnswer });
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
  const answer = stripGroundingIntro(data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim(), fallbackAnswer);

  return answer || fallbackAnswer;
}

function buildGroundedPrompt({ question, retrievedContext, queryUnderstanding = null, fallbackAnswer = FALLBACK_ANSWER }) {
  const understandingSection = buildUnderstandingSection(queryUnderstanding);

  return [
    "You are the LLM generation layer for an internal Arabic Odoo After-Sales training assistant.",
    "",
    "Use only the source material provided below to answer. Treat it as the complete allowed source for this turn.",
    "",
    "Internal accuracy rules:",
    `- If the source material does not support any part of the answer, respond exactly: ${fallbackAnswer}`,
    "- If the source material supports part of the answer (for example the relevant workflow or path) but not a detail in the question (for example a classification, duration or channel that is not documented), answer the supported part and say explicitly that the other detail is not documented in the current workflow. Do not refuse the whole question in that case.",
    "- Do not use outside Odoo knowledge.",
    "- Do not invent missing workflow behavior, missing fields, future stages, or business rules.",
    "- Do not answer from a similar-sounding term if the exact requested concept is not present in the source material.",
    "- Treat PAGE KNOWLEDGE as current page-specific information.",
    "- Treat GLOBAL KNOWLEDGE as project-wide after-sales information.",
    "- Source priority: current website/page facts (Source Type: page / related, and [Derived ...] blocks) > current approved PowerPoint facts (Source Type: powerpoint, or labels marked العرض التقديمي) > global/older documentation.",
    "- Use PowerPoint facts only to add details the website facts do not give (for example a responsibility label or department). If a PowerPoint fact and a website fact disagree, use the website fact. Stage names, stage numbers and stage order always come from the website facts.",
    "- Status supplemental means a current approved PowerPoint detail that the website does not show; it is valid current information. PowerPoint facts with status proposed are future plans, not current behaviour.",
    "- Do not mention where a fact came from (website, PowerPoint, slide numbers) unless the user asks for the source.",
    "- Status controls certainty: confirmed is current/established, observed is UAT evidence, requirement is desired behavior, proposed is a suggested future design, open is unresolved, unconfirmed is not verified, and historical_test is test evidence only.",
    "- If the user asks whether something is confirmed and the facts show it is proposed, open, unconfirmed, observed, requirement, or historical_test, answer directly that it is not confirmed and state the shown status.",
    "- Never present requirement, proposed, open, unconfirmed, or historical_test items as confirmed current system behavior.",
    "- Carry each fact's status into the wording of the answer, and keep the status of the fact the answer is mainly built on: a requirement fact reads as required or intended behavior (المطلوب أن / يجب أن), an observed fact as something seen or stated during testing (لوحظ / ظهر / أوضح الفريق), an open fact as still undecided (غير محسوم / مسألة مفتوحة), and a proposed fact as a suggestion (مقترح). Do this even when the question only asks what a term means, and never restate a secondary fact's status as if it were the main answer.",
    "- Preserve Odoo terms exactly when useful: Assign, Assignees, Stage, Appointment From, Appointment To, Task Forms, Start, End Task, OTP, Completed.",
    "- When the user asks about a named field, form, or Odoo term, include that exact name in the answer.",
    "- For multi-part sequence questions, combine the relevant facts into the clearest supported sequence.",
    "- For a general workflow_sequence question, answer with only the authoritative current high-level stage sequence found in the facts. Prefer current/primary workflow chunks over detailed supporting or legacy workflow chunks. Do not append Tasks, Appointment From/To, Assign, Task Forms, Start, End Task, OTP, Completed, or other internal details unless the user asks for detailed execution.",
    "- For next-step and previous-step questions, use the authoritative current workflow sequence in the facts and answer with the immediately adjacent current stage. Do not substitute booking actions or older supporting navigation wording for a current stage name.",
    "- If a multi-part question asks how the appointment is set and what happens afterward with the driver, answer both parts completely: include the booking link, customer location, date/time and confirmation, then continue through every driver step supported by the facts, including driver linking/assignment, Task Forms or form filling, Driver Portal, Start, execution photo, End Task, OTP, and Completed/service receipt. Do not stop at driver assignment or Task Forms when later supported steps are present.",
    "- For service-list questions, include every service name that is explicitly listed in the facts instead of summarizing the list.",
    "- For appointment or booking timing questions, include both the scheduling/readiness point and the allowed booking window when those details are present.",
    "- A current_status question does not provide access to a live Odoo record. Do not claim a real live stage; explain the training-page context or state that live status needs a specific record.",
    "- Start supported answers directly with the useful answer.",
    "- Do not include provenance, source, scope, or retrieval-process preambles in supported answers.",
    "- Do not begin with Arabic phrases that mean 'according to the available information' or 'based on the page'.",
    "- Adapt answer length to the question: define simple terms briefly, compare two fields in 2-3 lines, and use a short ordered list for sequence questions.",
    "- Stage numbers are shown exactly as on the website (most workflows start at 00). Use the stage number and exact stage title from the facts; never renumber stages.",
    "- For responsibility or manual/automatic (يدوي/آلي) questions, answer only from explicit 'التنفيذ' labels or explicit statements in the facts (for example 'يقوم النظام تلقائيًا'). If the facts do not state who performs a stage or whether it is manual or automatic, say clearly that this is not documented in the current workflow. Never infer automation, responsibilities, approvals, notifications, dependencies, or SLA rules.",
    "- Facts may come from several services. Never attribute a stage of one service to another service; when an answer covers more than one service, name each service explicitly.",
    "- Treat [Derived ...] blocks as exact structured data taken from the current website workflows.",
    "- Answer in clear Arabic.",
    "",
    understandingSection,
    understandingSection ? "" : "",
    "Facts:",
    retrievedContext,
    "",
    "User question:",
    question,
  ].join("\n");
}

function buildUnderstandingSection(queryUnderstanding) {
  if (!queryUnderstanding || queryUnderstanding.primaryIntent === "unsupported") {
    return "";
  }

  return [
    "Query understanding hints (retrieval aids, not factual sources):",
    `- Primary intent: ${queryUnderstanding.primaryIntent}`,
    queryUnderstanding.secondaryIntents?.length ? `- Secondary intents: ${queryUnderstanding.secondaryIntents.join(", ")}` : "",
    queryUnderstanding.concepts?.length ? `- Recognized concepts: ${queryUnderstanding.concepts.join(", ")}` : "",
    queryUnderstanding.exactTerms?.length ? `- Preserve exact Odoo terms: ${queryUnderstanding.exactTerms.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function stripGroundingIntro(answer, fallbackAnswer = FALLBACK_ANSWER) {
  if (answer === FALLBACK_ANSWER || answer === fallbackAnswer) {
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
  return questionTerms.every((term) => {
    if (context.includes(term)) {
      return true;
    }

    const tokens = term.split(" ").filter((token) => token && !ENGLISH_STOP_WORDS.has(token));
    return tokens.length === 0 || tokens.every((token) => context.includes(token));
  });
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

const ENGLISH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "or",
  "the",
  "is",
  "are",
  "what",
  "how",
  "when",
  "who",
  "flow",
  "workflow",
  "cycle",
  "delivery",
  "service",
  "services",
  "driver",
  "technician",
  "supervisor",
  "execution",
  "booking",
  "form",
  "forms",
  "confirmed",
]);

module.exports = {
  ERROR_ANSWER,
  FALLBACK_ANSWER,
  GLOBAL_FALLBACK_ANSWER,
  answerFromRetrievedContext,
  buildGroundedPrompt,
  buildUnderstandingSection,
  hasRequiredExactTerms,
  stripGroundingIntro,
};
