// Local, deterministic search over the site's own knowledge (pageKnowledge.js + knowledge/pages/*).
// No AI service, no network and no API key: the index is built once per process from the same page
// knowledge the training pages are written from, and every result is a passage of that knowledge
// with the route of the page (and stage) it comes from. Nothing is generated or summarised here.
const { pageKnowledge } = require("./pageKnowledge");
const { LEGACY_PAGE_META, SERVICE_NAMES } = require("./knowledge/pages/structuredPageKnowledge");
const { SERVICE_TERMS } = require("./knowledge/serviceTerms");
const { SYNONYM_GROUPS, normalizeQuery } = require("./queryUnderstanding");

const MAX_RESULTS = 5;
const MAX_RELATED = 3;
const EXCERPT_MAX_LENGTH = 420;

// Field weights: a word in a stage title says far more about the passage than the same word in its body.
// Headings are the sub-step labels inside a passage ("فتح نموذج رفع المقاسات: …").
const FIELD_WEIGHTS = { title: 4, headings: 3, terms: 2.5, context: 1.2, body: 1 };
const PRIMARY_PAGE_BOOST = 1.5;
const PARTIAL_MATCH_STRENGTH = 0.5;
const SYNONYM_MATCH_STRENGTH = 0.6;

// How much each kind of passage is worth before the question says anything about it.
const KIND_WEIGHTS = {
  stage: 1,
  workflow: 0.95,
  section: 1,
  note: 0.95,
  faq: 0.95,
  relationship: 0.9,
  page: 0.9,
  field: 0.85,
  glossary: 0.8,
  rule: 0.8,
};

// A result is only shown when the question's words are mostly found in it, and only while it stays
// within reach of the best result. A strong result is one that clearly beats the next one.
const MIN_COVERAGE = 0.5;
const MIN_RELATIVE_SCORE = 0.35;
const STRONG_MIN_COVERAGE = 0.75;
// …and most of the question has to be in what the passage is about, not only somewhere in its text.
const STRONG_MIN_ANCHOR_COVERAGE = 0.5;
const STRONG_MAX_RUNNER_UP_RATIO = 0.8;

// One page per service owns that service's own workflow; link and returns pages are excluded.
const SERVICE_PRIMARY_PAGE = {
  delivery: "intro-tour",
  installation: "installation",
  measurement: "measurement",
  design: "design",
  manufacturing: "manufacturing",
  internal_transfer: "internal-transfer",
  maintenance: "maintenance",
  warehouse_pickup: "warehouse-pickup",
  customer_service: "customer-service",
};

// Question words and fillers carry no meaning for the search (normalized spelling).
const STOP_WORDS = new Set(
  [
    "كيف", "ما", "ماذا", "ماهي", "ماهو", "هي", "هو", "هل", "في", "فى", "من", "الى", "إلى", "على", "عن", "مع",
    "يتم", "تتم", "شو", "ايش", "اش", "وش", "بصير", "يصير", "بيصير", "يحدث", "اعرف", "أعرف", "اريد", "أريد",
    "معرفة", "بدي", "ابغى", "لو", "اذا", "إذا", "او", "أو", "و", "ثم", "هذا", "هذه", "هاي", "ذلك", "تلك",
    "التي", "الذي", "اللي", "يلي", "كل", "شي", "شيء", "لي", "انا", "أنا", "نحن", "ممكن", "متى", "اين", "أين",
    "وين", "لماذا", "ليش", "عند", "لما", "قد", "لا", "نعم", "ان", "أن", "إن", "كان", "يكون", "تكون", "بـ",
    "خاص", "اشرح", "وضح", "شرح", "عن", "the", "a", "an", "of", "to", "in", "is", "what", "how",
  ].map(normalizeSearchText),
);

// Words that ask for the whole sequence of a service, or for what something is.
const SEQUENCE_INTENT = /(?:^| )(?:مراحل|خطوات|دوره|تسلسل|فلو|مسار|سايكل|ترتيب|workflow|flow|cycle)(?: |$)/u;
const DEFINITION_INTENT = /^(?:ما|ماذا|شو|ايش) (?:هي|هو|يعني|معني)(?: |$)|^(?:ماهي|ماهو)(?: |$)|(?:^| )(?:معني|تعريف|يعني)(?: |$)/u;

// Synonyms already defined by the project (queryUnderstanding.js), limited to the groups whose words
// really are interchangeable. The "service" and "stage" groups mix in service names and statuses.
const SYNONYM_GROUP_IDS = ["workflow", "task", "invoice", "appointment", "driver", "technician", "supervisor", "form"];
const EXTRA_SYNONYM_GROUPS = [["مقاسات", "قياسات", "مقاس", "قياس"]];

let index = null;

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ً-ٰٟۖ-ۭـ]/gu, "")
    .replace(/[‎‏‪-‮⁦-⁩]/gu, "")
    .replace(/[أإآٱ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/ة/gu, "ه")
    .replace(/ؤ/gu, "و")
    .replace(/ئ/gu, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

// The base form of a word without its definite article or attached particle (ال، وال، بال، لل، و، ب، ل…).
function baseToken(token) {
  const article = token.match(/^(?:[وفبك]?ال|لل)(.{2,})$/u);
  return article ? article[1] : token;
}

// Every form a word can be matched under: itself, without its article or particle, without a verb
// prefix (احجز ← حجز، افتح ← فتح), without a plural ending (التحويلات ← تحويل) and with a nisba
// adjective in either gender (الداخلية ← داخلي). A bare feminine ending is kept: dropping it would
// make حالة (status) the same word as حال (in "في حال") and الحالي (current).
function tokenVariants(token) {
  const stems = new Set([baseToken(token)]);

  if (stems.has(token)) {
    const particle = token.match(/^[وفبلك](.{3,})$/u);
    if (particle) stems.add(particle[1]);
  }

  for (const form of [...stems]) {
    if (/^[ايتن].{3,}$/u.test(form)) stems.add(form.slice(1));
  }

  for (const form of [...stems]) {
    if (/^.{3,}ات$/u.test(form)) stems.add(form.slice(0, -2));
    if (/^.{2,}يه$/u.test(form)) stems.add(form.slice(0, -1));
  }

  return new Set([token, ...stems]);
}

function tokenize(text) {
  return normalizeSearchText(text)
    .split(" ")
    .filter((token) => token && !STOP_WORDS.has(token));
}

function buildField(texts) {
  const tokens = tokenize(texts.filter(Boolean).join(" \n "));
  const positions = tokens.map(tokenVariants);
  const variants = new Set();
  for (const set of positions) for (const variant of set) variants.add(variant);
  return { tokens, bases: tokens.map(baseToken), positions, variants };
}

// ---------------------------------------------------------------- Index

function routesOf(pageId, knowledge) {
  const raw = knowledge.route || LEGACY_PAGE_META[pageId]?.route || "";
  return raw.split("+").map((route) => route.trim()).filter(Boolean);
}

// Pages documented under more than one route: each passage links to the route that shows it.
// خدمة العملاء: the overview vs. the case-sources chapter; returns: full cancellation vs. partial return.
function pickRoute(pageId, routes, doc) {
  if (routes.length < 2) return routes[0] || "";
  if (pageId === "customer-service") {
    return doc.kind === "section" || String(doc.sourceId).startsWith("source-") ? routes[1] : routes[0];
  }
  if (pageId === "delivery-returns" || pageId === "installation-returns") {
    return doc.kind === "page" || doc.sourceId === "full-cancellation" ? routes[0] : routes[1];
  }
  return routes[0];
}

function servicesOf(pageId, knowledge) {
  return knowledge.services || LEGACY_PAGE_META[pageId]?.services || [];
}

function cleanParagraph(text) {
  return String(text || "").replace(/^نص الصفحة الحالي:\s*/u, "").trim();
}

function buildPageDocs(pageId, knowledge) {
  const services = servicesOf(pageId, knowledge);
  const routes = routesOf(pageId, knowledge);
  const serviceName = SERVICE_NAMES[services[0]] || knowledge.title;
  const structured = knowledge.structured || null;
  const docs = [];

  const add = (doc) => {
    const full = {
      pageId,
      pageTitle: knowledge.title,
      services,
      serviceName,
      stageTitle: "",
      stageNumber: "",
      terms: [],
      stages: null,
      ...doc,
      paragraphs: doc.paragraphs.map(cleanParagraph).filter(Boolean),
    };
    full.route = pickRoute(pageId, routes, full);
    if (!full.route || full.paragraphs.length === 0) return;
    full.id = `${pageId}:${full.kind}:${full.sourceId}`;
    full.fields = {
      title: buildField([full.title]),
      headings: buildField(full.paragraphs.map(headingOf)),
      terms: buildField(full.terms),
      context: buildField([serviceName, knowledge.title, knowledge.workflowLabel]),
      body: buildField([...full.paragraphs, ...(full.stages || []).map((stage) => stage.title)]),
    };
    docs.push(full);
  };

  add({
    kind: "page",
    sourceId: "overview",
    title: knowledge.title,
    paragraphs: [structured?.overview || knowledge.scope],
    terms: structured?.terms || [],
  });

  const workflow = knowledge.currentWorkflow || [];
  if (workflow.length > 0) {
    add({
      kind: "workflow",
      sourceId: "sequence",
      title: `مراحل ${knowledge.title}`,
      paragraphs: [structured?.overview || knowledge.scope],
      terms: ["مراحل", "خطوات", "دورة العمل", "تسلسل"],
      stages: workflow.map((stage) => ({ number: String(stage.order).padStart(2, "0"), title: stage.title })),
    });
  }

  for (const stage of workflow) {
    add({
      kind: "stage",
      sourceId: stage.id,
      title: stage.title,
      stageTitle: stage.title,
      stageNumber: String(stage.order).padStart(2, "0"),
      paragraphs: [stage.summary, ...(stage.details || []).filter((detail) => !/^التنفيذ:/u.test(detail))],
      terms: stage.relatedTerms || [],
    });
  }

  for (const section of structured?.sections || []) {
    add({
      kind: "section",
      sourceId: section.id,
      title: section.title,
      paragraphs: [section.description, section.examples?.length ? `أمثلة: ${section.examples.join("، ")}.` : ""],
      terms: section.relatedTerms || [],
    });
  }

  for (const note of structured?.notes || []) {
    add({ kind: "note", sourceId: note.id, title: note.title, paragraphs: splitLongText(note.text), terms: note.relatedTerms || [] });
  }

  for (const relationship of structured?.relationships || []) {
    add({
      kind: "relationship",
      sourceId: relationship.id,
      title: relationship.title,
      paragraphs: splitLongText(relationship.text),
      terms: relationship.relatedTerms || [],
    });
  }

  // The hand-written Delivery page (pageKnowledge.js) also documents its fields, curated questions,
  // glossary and business rules. Its legacy screen-by-screen stages are superseded by currentWorkflow.
  if (!structured) {
    for (const [name, field] of Object.entries(knowledge.fields || {})) {
      add({ kind: "field", sourceId: name, title: name, paragraphs: [field.meaning, field.deliveryMeaning], terms: field.relatedTerms || [] });
    }

    for (const item of knowledge.supportedQuestions || []) {
      const stage = workflow.find((candidate) => item.id === `${candidate.id}-question`);
      add({
        kind: "faq",
        sourceId: item.id,
        title: stage ? stage.title : item.questions[0],
        stageTitle: stage?.title || "",
        stageNumber: stage ? String(stage.order).padStart(2, "0") : "",
        paragraphs: [item.answer],
        terms: [...item.questions, ...(item.relatedTerms || [])],
      });
    }

    for (const item of knowledge.glossary || []) {
      add({ kind: "glossary", sourceId: item.term, title: item.term, paragraphs: [item.definition], terms: item.relatedTerms || [] });
    }

    for (const rule of knowledge.businessRules || []) {
      add({ kind: "rule", sourceId: rule.id, title: rule.title, paragraphs: [rule.rule], terms: rule.relatedTerms || [] });
    }
  }

  return docs;
}

// The label a passage opens with, as in "اعتماد العميل واستلام الخدمة: بعد الانتهاء من …".
function headingOf(paragraph) {
  return paragraph.match(/^([^:،.]{3,60}):\s/u)?.[1] || "";
}

// Long notes are one paragraph made of "label: text" steps; split them so an excerpt is one step.
function splitLongText(text) {
  return String(text || "")
    .split(/(?<=[.؟!])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildSynonymMap() {
  const groups = [
    ...SYNONYM_GROUP_IDS.map((id) => SYNONYM_GROUPS[id]?.terms || []),
    ...EXTRA_SYNONYM_GROUPS,
  ];
  const map = new Map();

  for (const group of groups) {
    const words = [...new Set(group.map(normalizeSearchText).filter((word) => word && !word.includes(" ")).map(baseToken))];
    for (const word of words) {
      if (!map.has(word)) map.set(word, new Set());
      for (const other of words) if (other !== word) map.get(word).add(other);
    }
  }

  return map;
}

function buildServiceMatchers() {
  return Object.entries(SERVICE_TERMS).map(([service, terms]) => ({
    service,
    terms: terms.map(normalizeSearchText).filter(Boolean),
  }));
}

function getIndex() {
  if (index) return index;

  const docs = Object.entries(pageKnowledge).flatMap(([pageId, knowledge]) => buildPageDocs(pageId, knowledge));
  index = {
    docs,
    synonyms: buildSynonymMap(),
    serviceMatchers: buildServiceMatchers(),
    documentFrequency: new Map(),
  };
  return index;
}

// ---------------------------------------------------------------- Query

function analyzeQuery(question) {
  // Dialect phrasing ("شو بصير", "وين", "بدي اعرف") is mapped by queryUnderstanding.js first.
  const normalized = normalizeSearchText(normalizeQuery(question));
  const seen = new Set();
  const tokens = [];

  for (const token of tokenize(normalized)) {
    const base = baseToken(token);
    if (seen.has(base)) continue;
    seen.add(base);
    tokens.push({ token, base, variants: tokenVariants(token) });
  }

  // "شو بصير بعد تأكيد الموعد؟" asks for what follows an event: the words after "بعد".
  const after = normalized.match(/(?:^| )بعد (.+)$/u);
  const afterTokens = after ? tokenize(after[1]).map((token) => ({ token, base: baseToken(token), variants: tokenVariants(token) })) : [];

  return {
    normalized,
    tokens,
    afterTokens,
    wantsSequence: SEQUENCE_INTENT.test(normalized),
    wantsDefinition: DEFINITION_INTENT.test(normalized),
  };
}

// A passage that opens with "بعد <the same event>، …" is the page's own account of what follows it,
// as in "بعد تأكيد موعد خدمة رفع المقاسات، تنتقل المهمة إلى مرحلة تم تعيين الفني".
function describesWhatFollows(doc, afterTokens) {
  if (afterTokens.length === 0) return false;
  const opening = normalizeSearchText(doc.paragraphs[0].split(/[،,]/u)[0]);
  if (!opening.startsWith("بعد ")) return false;
  const field = buildField([opening]);
  return afterTokens.every((queryToken) => hasExactMatch(queryToken, field));
}

function detectServices(normalizedQuestion, serviceMatchers) {
  const padded = ` ${normalizedQuestion} `;
  return serviceMatchers
    .filter(({ terms }) => terms.some((term) => padded.includes(` ${term} `) || padded.includes(` ال${term} `) || normalizedQuestion.includes(term)))
    .map(({ service }) => service);
}

function hasExactMatch(queryToken, field) {
  for (const variant of queryToken.variants) if (field.variants.has(variant)) return true;
  return false;
}

// One word contained in the other, both long enough to mean something (حجز / احجز، فني / الفنيين).
function hasPartialMatch(queryToken, field) {
  const base = queryToken.base;
  if (base.length < 3) return false;

  return field.bases.some((token) => {
    if (token.length < 3) return false;
    const [shorter, longer] = token.length < base.length ? [token, base] : [base, token];
    return longer.includes(shorter) && shorter.length / longer.length >= 0.5;
  });
}

function hasSynonymMatch(queryToken, field, synonyms) {
  const related = synonyms.get(queryToken.base);
  if (!related) return false;
  for (const word of related) if (field.variants.has(word)) return true;
  return false;
}

function matchStrength(queryToken, field, synonyms) {
  if (hasExactMatch(queryToken, field)) return 1;
  if (hasSynonymMatch(queryToken, field, synonyms)) return SYNONYM_MATCH_STRENGTH;
  if (hasPartialMatch(queryToken, field)) return PARTIAL_MATCH_STRENGTH;
  return 0;
}

function inverseDocumentFrequency(queryToken, searchIndex) {
  const key = queryToken.base;
  if (!searchIndex.documentFrequency.has(key)) {
    const frequency = searchIndex.docs.filter((doc) => Object.values(doc.fields).some((field) => hasExactMatch(queryToken, field))).length;
    searchIndex.documentFrequency.set(key, frequency);
  }
  const frequency = searchIndex.documentFrequency.get(key);
  return Math.log(1 + searchIndex.docs.length / (1 + frequency));
}

// Two neighbouring question words that also stand side by side in the passage ("تعيين الفني").
function phraseBonus(queryTokens, field, weights) {
  let bonus = 0;

  for (let index = 0; index < queryTokens.length - 1; index += 1) {
    const first = queryTokens[index];
    const second = queryTokens[index + 1];
    const found = field.positions.some(
      (variants, position) =>
        position < field.positions.length - 1 &&
        [...first.variants].some((variant) => variants.has(variant)) &&
        [...second.variants].some((variant) => field.positions[position + 1].has(variant)),
    );
    if (found) bonus += (weights[index] + weights[index + 1]) / 2;
  }

  return bonus;
}

// Fields that name what a passage is about, as opposed to the service it belongs to or its body text.
const ANCHOR_FIELDS = new Set(["title", "headings", "terms"]);

function scoreDoc(doc, query, idfs, context, searchIndex) {
  let score = 0;
  let matchedWeight = 0;
  let anchorWeight = 0;
  let anchored = false;

  query.tokens.forEach((queryToken, position) => {
    let best = 0;
    let inAnchor = false;
    for (const [name, weight] of Object.entries(FIELD_WEIGHTS)) {
      const strength = matchStrength(queryToken, doc.fields[name], searchIndex.synonyms);
      if (strength > 0 && name !== "body") anchored = true;
      if (strength > 0 && ANCHOR_FIELDS.has(name)) inAnchor = true;
      best = Math.max(best, weight * strength);
    }
    if (best > 0) matchedWeight += idfs[position];
    if (inAnchor) anchorWeight += idfs[position];
    score += idfs[position] * best;
  });

  const totalWeight = idfs.reduce((sum, value) => sum + value, 0) || 1;
  const coverage = matchedWeight / totalWeight;
  const anchorCoverage = anchorWeight / totalWeight;
  if (score === 0) return { score: 0, coverage: 0, anchorCoverage: 0, anchored: false };

  score += phraseBonus(query.tokens, doc.fields.title, idfs) * FIELD_WEIGHTS.title;
  score += phraseBonus(query.tokens, doc.fields.headings, idfs) * FIELD_WEIGHTS.headings;
  score += phraseBonus(query.tokens, doc.fields.body, idfs) * FIELD_WEIGHTS.body;

  // A passage whose whole title is in the question is what the question names.
  const titleTokens = doc.fields.title.tokens;
  if (titleTokens.length > 0) {
    const titleCovered = doc.fields.title.positions.filter((variants) =>
      query.tokens.some((queryToken) => [...queryToken.variants].some((variant) => variants.has(variant))),
    ).length;
    const titleCoverage = titleCovered / titleTokens.length;
    score *= 1 + 0.5 * titleCoverage * titleCoverage;
  }

  score *= KIND_WEIGHTS[doc.kind] || 1;
  // "ما هو غير موثق …" lists what a page does not cover; it is never the answer to a question.
  if (doc.sourceId === "not-documented") score *= 0.4;
  score *= 0.5 + 0.5 * coverage;

  if (query.wantsSequence && doc.kind === "workflow") score *= 1.8;
  if (query.wantsDefinition && doc.kind === "page") score *= 1.8;
  if (query.wantsDefinition && (doc.kind === "field" || doc.kind === "glossary")) score *= 1.4;
  if (describesWhatFollows(doc, query.afterTokens)) score *= 1.8;

  // The service the question names comes first, its own page before the pages that link services.
  if (context.services.length > 0) {
    const namesService = doc.services.some((service) => context.services.includes(service));
    if (!namesService) score *= 0.55;
    else {
      score *= 1.3;
      if (context.services.some((service) => SERVICE_PRIMARY_PAGE[service] === doc.pageId)) {
        score *= PRIMARY_PAGE_BOOST;
        // "مراحل خدمة التركيب" / "ما هي التحويلات الداخلية": the service's own workflow or overview.
        const asksForTheService = (query.wantsSequence && doc.kind === "workflow") || (query.wantsDefinition && doc.kind === "page");
        if (asksForTheService) score *= 1.4;
      }
    }
  } else if (context.pageId && doc.pageId === context.pageId) {
    // Without a named service, the page the reader has open is the likeliest meaning.
    score *= 1.2;
  }

  return { score, coverage, anchorCoverage, anchored };
}

// ---------------------------------------------------------------- Excerpts

function countHits(text, queryTokens) {
  const field = buildField([text]);
  return queryTokens.filter((queryToken) => hasExactMatch(queryToken, field) || hasPartialMatch(queryToken, field)).length;
}

function trimToLength(text, maxLength) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : maxLength).trim()}…`;
}

// The paragraph of the passage that holds most of the question's words, cut down to a readable
// length around its best sentence. The text itself is never rewritten.
function buildExcerpt(doc, queryTokens) {
  const ranked = doc.paragraphs
    .map((text, position) => ({ text, position, hits: countHits(text, queryTokens) }))
    .sort((a, b) => b.hits - a.hits || a.position - b.position);
  const paragraph = ranked[0].hits > 0 ? ranked[0].text : doc.paragraphs[0];

  if (paragraph.length <= EXCERPT_MAX_LENGTH) return paragraph;

  const sentences = splitLongText(paragraph);
  const best = sentences
    .map((text, position) => ({ position, hits: countHits(text, queryTokens) }))
    .sort((a, b) => b.hits - a.hits || a.position - b.position)[0];

  let excerpt = sentences[best.position];
  for (let next = best.position + 1; next < sentences.length; next += 1) {
    if (excerpt.length + sentences[next].length + 1 > EXCERPT_MAX_LENGTH) break;
    excerpt = `${excerpt} ${sentences[next]}`;
  }

  return `${best.position > 0 ? "… " : ""}${trimToLength(excerpt, EXCERPT_MAX_LENGTH)}`;
}

// ---------------------------------------------------------------- Search

function toResult(entry, queryTokens) {
  const { doc } = entry;
  return {
    id: doc.id,
    kind: doc.kind,
    title: doc.title,
    excerpt: buildExcerpt(doc, queryTokens),
    service: doc.serviceName,
    pageId: doc.pageId,
    pageTitle: doc.pageTitle,
    route: doc.route,
    stageTitle: doc.stageTitle,
    stageNumber: doc.stageNumber,
    ...(doc.stages ? { stages: doc.stages } : {}),
    score: Number(entry.score.toFixed(3)),
  };
}

function searchKnowledge(question, { pageId = "" } = {}) {
  const searchIndex = getIndex();
  const query = analyzeQuery(question);

  if (query.tokens.length === 0) {
    return { query: question, strong: false, results: [], related: [] };
  }

  const context = {
    pageId: pageKnowledge[pageId] ? pageId : "",
    services: detectServices(query.normalized, searchIndex.serviceMatchers),
  };
  const idfs = query.tokens.map((queryToken) => inverseDocumentFrequency(queryToken, searchIndex));

  const scored = searchIndex.docs
    .map((doc) => ({ doc, ...scoreDoc(doc, query, idfs, context, searchIndex) }))
    .filter((entry) => entry.score > 0 && entry.coverage >= MIN_COVERAGE && (entry.anchored || entry.coverage >= STRONG_MIN_COVERAGE))
    .sort((a, b) => b.score - a.score);

  // One result per destination: a stage, its curated question and its field all open the same place.
  const seen = new Set();
  const ranked = [];
  for (const entry of scored) {
    const destination = `${entry.doc.route}|${entry.doc.stageTitle}`;
    if (seen.has(destination)) continue;
    seen.add(destination);
    ranked.push(entry);
  }

  const top = ranked[0];
  const kept = top ? ranked.filter((entry) => entry.score >= top.score * MIN_RELATIVE_SCORE) : [];
  const runnerUp = kept[1];
  const strong = Boolean(
    top &&
      top.coverage >= STRONG_MIN_COVERAGE &&
      top.anchorCoverage >= STRONG_MIN_ANCHOR_COVERAGE &&
      (!runnerUp || runnerUp.score <= top.score * STRONG_MAX_RUNNER_UP_RATIO),
  );

  const results = (strong ? kept.slice(0, 1) : kept.slice(0, MAX_RESULTS)).map((entry) => toResult(entry, query.tokens));
  // Related results add something new: a stage title already shown (every cycle has "فاتورة من SAP")
  // is not offered again from another page.
  const shownTitles = new Set(results.map((result) => normalizeSearchText(result.title)));
  const related = strong
    ? kept
        .slice(1)
        .filter((entry) => {
          const title = normalizeSearchText(entry.doc.title);
          if (shownTitles.has(title)) return false;
          shownTitles.add(title);
          return true;
        })
        .slice(0, MAX_RELATED)
        .map((entry) => toResult(entry, query.tokens))
    : [];

  return { query: question, strong, results, related };
}

module.exports = { normalizeSearchText, searchKnowledge, tokenVariants };
