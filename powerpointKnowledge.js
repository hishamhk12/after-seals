// Secondary After-Sales knowledge source: the current approved PowerPoint.
//
// Source priority: current website page knowledge (pageKnowledge) > this deck > older documentation.
// Every fact taken from the deck is reconciled against the live website knowledge and classified:
//   duplicate    materially the same as the website → corroborating only, no chunk (avoids noisy
//                duplicate retrieval results)
//   supplemental adds a detail the website does not show → becomes a retrievable chunk
//   conflict     contradicts the website → excluded; the website fact stands
//   outdated     a stage number the current website workflow does not have → excluded
//   unverified   belongs to a slide stage that cannot be matched to a website stage → excluded
// Reconciliation runs against the current pageKnowledge at load time, so a website change that
// turns a slide fact into a duplicate or conflict takes effect without rebuilding anything.
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { JOURNEY_STEPS, SLIDES, SOURCE_FILE, STAGE_REVIEWS } = require("./knowledge/powerpoint/manifest");
const { SERVICE_NAMES } = require("./knowledge/pages/structuredPageKnowledge");
const { pageKnowledge } = require("./pageKnowledge");

const POWERPOINT_PAGE_ID = "powerpoint-after-sales";
const EXTRACTION_PATH = path.join(__dirname, "data", "powerpoint", "after-sales-powerpoint.json");
const POWERPOINT_STORE_PATH = path.join(__dirname, "data", "embeddings", `${POWERPOINT_PAGE_ID}.json`);
const SUPPLEMENTAL = "supplemental";
const DESCRIPTION_DUPLICATE_COVERAGE = 0.6;

const EXTRA_SERVICE_NAMES = { free_services: "الخدمات المجانية" };

// --- text helpers --------------------------------------------------------------------------------

function normalizeArabic(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ءئ]/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ساب/g, "sap")
    .replace(/[«»"'`()[\]{}.,،؛;:!?؟|\\/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set(
  ["من", "في", "على", "الي", "عن", "مع", "او", "ثم", "بعد", "قبل", "داخل", "حسب", "عند", "التي", "الذي", "يتم", "هذه", "هذا", "بين", "كل", "لا", "ما", "حتي", "خلال", "sap"].map(normalizeArabic),
);

// The system name appears in almost every stage sentence and says nothing about the stage.
// Applied to normalized text.
const BOILERPLATE_PATTERN = /(نظام )?خدمات ?ما ?بعد البيع/g;

function contentTokens(value) {
  return normalizeArabic(value)
    .replace(BOILERPLATE_PATTERN, " ")
    .split(" ")
    .map((token) => token.replace(/^و(?=.{4})/u, "").replace(/^(ف|ب|ل)?(ال|لل)(?=..)/u, ""))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

// Share of the slide text's content words that also appear (by a 4-letter prefix) in the website text.
function tokenCoverage(slideText, websiteText) {
  const slideTokens = [...new Set(contentTokens(slideText))];
  if (slideTokens.length === 0) return 1;
  const prefixes = new Set(contentTokens(websiteText).map((token) => token.slice(0, 4)));
  return slideTokens.filter((token) => prefixes.has(token.slice(0, 4))).length / slideTokens.length;
}

function titlesEquivalent(a, b) {
  const x = normalizeArabic(a);
  const y = normalizeArabic(b);
  return x === y || (Math.min(x.length, y.length) >= 5 && (x.includes(y) || y.includes(x)));
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function isStageNumber(text) {
  return /^\d{2}$/.test(text);
}

function isDecorative(text) {
  return !/[\p{L}\p{N}]/u.test(text);
}

function joinParagraphs(shape) {
  return shape.paragraphs.join(" ").replace(/\s+/g, " ").replace(/\s*\/\s*/g, " / ").trim();
}

function serviceNameOf(service) {
  return SERVICE_NAMES[service] || EXTRA_SERVICE_NAMES[service] || service || "";
}

// "يدوي مسؤول التحميل / إدارة المستودعات" → { mode: "manual", parties: ["مسؤول التحميل", "إدارة المستودعات"] }
// The deck spells one label "ألي"; `display` fixes only that hamza so it reads as the other labels.
function parseResponsibility(raw) {
  if (!raw) return null;
  const display = raw.replace(/^ألي(?=\s)/u, "آلي").replace(/\s+/g, " ").trim();
  const modeMatch = display.match(/^(آلي|يدوي)\s*/u);
  const mode = modeMatch ? (modeMatch[1] === "آلي" ? "automatic" : "manual") : null;
  const parties = display
    .slice(modeMatch ? modeMatch[0].length : 0)
    .replace(/^من خلال\s+/u, "")
    .split("/")
    .map((party) => party.trim())
    .filter(Boolean);
  return { raw, display, mode, parties };
}

function sameResponsibility(a, b) {
  if (!a || !b || a.mode !== b.mode) return false;
  const left = a.parties.map(normalizeArabic).sort();
  const right = b.parties.map(normalizeArabic).sort();
  return left.length === right.length && left.every((party, index) => party === right[index]);
}

// Stage text on the website that documents human work. A slide "آلي" label is never allowed to
// override it: the website stays authoritative and automation must not be inferred.
const MANUAL_CUE_PATTERN = /يدوي|يدويًا|يدويا|Drag & Drop|السحب والإفلات|المشرف|نيابةً? عن العميل/u;

// --- slide parsing -------------------------------------------------------------------------------

function matchManifestEntry(slide) {
  const texts = new Set(slide.shapes.map((shape) => normalizeArabic(joinParagraphs(shape))));
  const matches = SLIDES.filter((entry) => texts.has(normalizeArabic(entry.title)));
  return matches.length === 1 ? { entry: matches[0] } : { entry: null, candidates: matches.map((entry) => entry.title) };
}

function parseDeck(extraction) {
  const slides = [];
  const excluded = [];
  const anomalies = [];

  for (const slide of extraction.slides) {
    const { entry, candidates } = matchManifestEntry(slide);

    if (slide.hidden) {
      excluded.push({ slideNumber: slide.number, title: entry?.title || null, reason: "hidden slide" });
      continue;
    }
    if (!entry) {
      excluded.push({
        slideNumber: slide.number,
        title: null,
        reason: candidates.length ? `ambiguous title: matches ${candidates.join(" / ")}` : "unmapped: no manifest title found on the slide",
        review: true,
      });
      continue;
    }
    if (entry.include === false) {
      excluded.push({ slideNumber: slide.number, title: entry.title, reason: entry.reason });
      continue;
    }

    const base = {
      slideNumber: slide.number,
      slideTitle: entry.title,
      kind: entry.kind,
      service: entry.service || null,
      pageId: entry.pageId || null,
      section: entry.section || entry.kind,
      status: entry.status || SUPPLEMENTAL,
      layout: entry.layout || null,
      review: entry.review || null,
      notes: slide.notes || "",
    };
    const parser = SLIDE_PARSERS[entry.kind];
    const parsed = parser(slide, entry, (message) => anomalies.push({ slideNumber: slide.number, slideTitle: entry.title, message }));
    slides.push({ ...base, ...parsed });
  }

  return { slides, excluded, anomalies };
}

function parseServiceWorkflowSlide(slide, entry, report) {
  const shapes = slide.shapes.map((shape) => ({ ...shape, value: joinParagraphs(shape) }));
  const titleShape = shapes.find((shape) => normalizeArabic(shape.value) === normalizeArabic(entry.title));
  const partyShape = shapes.find((shape) => shape.value.startsWith("الجهة المسؤولة:"));
  const marker = shapes.find((shape) => shape.value === "ملخص الدورة");

  if (!marker) {
    report('no "ملخص الدورة" section found; stages not parsed');
    return { responsibleParty: partyShape ? partyShape.value.replace("الجهة المسؤولة:", "").trim() : null, stages: [] };
  }

  const rest = shapes.filter((shape) => shape !== titleShape && shape !== partyShape && shape !== marker && !isDecorative(shape.value));
  const flow = rest.filter((shape) => shape.y < marker.y);
  const summary = rest.filter((shape) => shape.y > marker.y);
  const stages = new Map();
  const stageFor = (number) => {
    if (!stages.has(number)) stages.set(number, { number, title: null, description: null, responsibility: null });
    return stages.get(number);
  };

  // Flow bar: a stage number above its short title; pair each title with the nearest number.
  const flowNumbers = flow.filter((shape) => isStageNumber(shape.value));
  for (const shape of flow.filter((item) => !isStageNumber(item.value))) {
    const nearest = [...flowNumbers].sort((a, b) => Math.abs(a.centerX - shape.centerX) - Math.abs(b.centerX - shape.centerX))[0];
    if (!nearest) {
      report(`flow text without a stage number: ${shape.value}`);
      continue;
    }
    const stage = stageFor(nearest.value);
    if (stage.title) report(`stage ${nearest.value} has two flow titles: ${stage.title} / ${shape.value}`);
    stage.title = stage.title || shape.value;
  }

  // Summary cards: rows of stage numbers; under each number a description, then a label. A card
  // spans leftwards from its number (right-to-left layout).
  const summaryNumbers = summary.filter((shape) => isStageNumber(shape.value));
  for (const shape of summary.filter((item) => !isStageNumber(item.value))) {
    const rowY = Math.max(...summaryNumbers.filter((number) => number.y <= shape.y + 5).map((number) => number.y));
    const row = summaryNumbers.filter((number) => Math.abs(number.y - rowY) <= 15);
    const owner = row.filter((number) => number.centerX >= shape.centerX).sort((a, b) => a.centerX - b.centerX)[0];

    if (!Number.isFinite(rowY) || !owner) {
      report(`summary text outside any stage card: ${shape.value}`);
      continue;
    }

    const stage = stageFor(owner.value);
    const field = shape.y - rowY < 75 ? "description" : "responsibility";
    if (stage[field]) report(`stage ${owner.value} has two ${field} texts: ${stage[field]} / ${shape.value}`);
    stage[field] = stage[field] || shape.value;
  }

  const ordered = [...stages.values()].sort((a, b) => Number(a.number) - Number(b.number));
  for (const stage of ordered) {
    if (!stage.title) report(`stage ${stage.number} has no flow-bar title`);
    if (!stage.description) report(`stage ${stage.number} has no summary description`);
  }

  return {
    responsibleParty: partyShape ? partyShape.value.replace("الجهة المسؤولة:", "").trim() : null,
    stages: ordered.map((stage) => ({ ...stage, responsibility: parseResponsibility(stage.responsibility) })),
  };
}

function parseCustomerServiceSourcesSlide(slide, entry, report) {
  const shapes = slide.shapes.map((shape) => ({ ...shape, value: joinParagraphs(shape), lines: shape.paragraphs.map((line) => line.replace(/^[•\s]+/u, "").trim()) }));
  const headings = shapes.filter((shape) => /^من\s/u.test(shape.value));
  const sources = headings
    .sort((a, b) => b.centerX - a.centerX)
    .map((heading, index) => {
      const examples = shapes
        .filter((shape) => shape.value.startsWith("•") && Math.abs(shape.x - heading.x) < 20 && shape.y > heading.y)
        .flatMap((shape) => shape.lines);
      if (examples.length === 0) report(`source "${heading.value}" has no examples`);
      return { number: pad(index + 1), title: heading.value, examples };
    });
  const paragraphs = shapes
    .filter((shape) => !headings.includes(shape) && !shape.value.startsWith("•") && !isDecorative(shape.value))
    .filter((shape) => normalizeArabic(shape.value) !== normalizeArabic(entry.title) && shape.value !== "خدمة العملاء")
    .sort((a, b) => a.y - b.y)
    .map((shape) => shape.value);
  return { sources, paragraphs };
}

function parseServiceJourneySlide(slide, entry, report) {
  const shapes = slide.shapes.map((shape) => ({ ...shape, value: joinParagraphs(shape) }));
  // Step labels read "name | department" (two paragraphs, or one line starting with the step name).
  const labels = slide.shapes
    .map((shape) => {
      const text = shape.paragraphs.join("\n");
      const name = Object.keys(JOURNEY_STEPS).find((step) => text.startsWith(step));
      return name ? { shape, name, department: text.slice(name.length).replace(/\s+/g, " ").trim() } : null;
    })
    .filter((label) => label && label.department);
  const titleShape = shapes.find((shape) => normalizeArabic(shape.value) === normalizeArabic(entry.title));
  const used = new Set([titleShape, ...labels.map((label) => shapes.find((shape) => shape.id === label.shape.id))]);
  const descriptions = shapes.filter((shape) => !used.has(shape) && !isDecorative(shape.value));

  const steps = labels
    .map((label) => {
      const description = descriptions
        .filter((shape) => Math.abs(shape.x - label.shape.x) <= 20)
        .sort((a, b) => Math.abs(a.y - label.shape.y) - Math.abs(b.y - label.shape.y))[0];
      if (!description) report(`journey step "${label.name}" has no description`);
      if (description) used.add(description);
      return { name: label.name, department: label.department, description: description?.value || null, x: label.shape.x, ...JOURNEY_STEPS[label.name] };
    })
    .sort((a, b) => a.x - b.x)
    .map(({ x, ...step }) => step);

  for (const name of Object.keys(JOURNEY_STEPS)) {
    if (!steps.some((step) => step.name === name)) report(`journey step "${name}" not found on the slide`);
  }

  const subtitle = descriptions.filter((shape) => !used.has(shape)).map((shape) => shape.value);
  return { steps, paragraphs: subtitle };
}

function parseExecutiveSummarySlide(slide, entry, report) {
  const shapes = slide.shapes
    .map((shape) => ({ ...shape, value: joinParagraphs(shape).replace(/^"|"$/g, "") }))
    .filter((shape) => !isDecorative(shape.value) && !isStageNumber(shape.value) && shape.value !== "VS")
    .filter((shape) => normalizeArabic(shape.value) !== normalizeArabic(entry.title));
  const isShort = (shape) => shape.value.split(/\s+/).length <= 6 && !/[.،]$/u.test(shape.value);

  if (entry.layout === "before-after") {
    const before = shapes.find((shape) => shape.value === "قبل المشروع");
    const after = shapes.find((shape) => shape.value === "بعد المشروع");
    if (!before || !after) {
      report('before/after headers not found');
      return { paragraphs: shapes.map((shape) => shape.value), items: [] };
    }
    const items = shapes.filter((shape) => shape !== before && shape !== after && isShort(shape));
    const beforeColumn = items.filter((shape) => Math.abs(shape.centerX - before.centerX) < Math.abs(shape.centerX - after.centerX));
    const afterColumn = items.filter((shape) => !beforeColumn.includes(shape));
    const pairs = beforeColumn
      .sort((a, b) => a.y - b.y)
      .map((left) => {
        const right = afterColumn.sort((a, b) => Math.abs(a.y - left.y) - Math.abs(b.y - left.y))[0];
        return { heading: `قبل المشروع: ${left.value}`, description: right ? `بعد المشروع: ${right.value}` : "", separator: " ← " };
      });
    return { paragraphs: shapes.filter((shape) => !isShort(shape)).map((shape) => shape.value), items: pairs };
  }

  if (entry.layout === "heading-description") {
    // Descriptions of the headings share one column; pick the column that pairs the most headings
    // (other long texts, e.g. the intro paragraph next to the title, stay paragraphs).
    const headings = shapes.filter(isShort).sort((a, b) => a.y - b.y);
    const longs = shapes.filter((shape) => !isShort(shape));
    const columns = [];
    for (const shape of longs) {
      const column = columns.find((items) => Math.abs(items[0].x - shape.x) <= 30);
      if (column) column.push(shape);
      else columns.push([shape]);
    }
    const pairWith = (column) => {
      const used = new Set();
      return headings.map((heading) => {
        const description = column
          .filter((shape) => !used.has(shape) && Math.abs(shape.centerX - heading.centerX) > 100 && shape.y - heading.y > -30 && shape.y - heading.y < 90)
          .sort((a, b) => Math.abs(a.y - heading.y) - Math.abs(b.y - heading.y))[0];
        if (description) used.add(description);
        return { heading: heading.value, description: description?.value || "", shape: description };
      });
    };
    const best = columns.map(pairWith).sort((a, b) => b.filter((pair) => pair.shape).length - a.filter((pair) => pair.shape).length)[0] || pairWith([]);
    const paired = new Set(best.map((pair) => pair.shape).filter(Boolean));
    return {
      paragraphs: longs.filter((shape) => !paired.has(shape)).sort((a, b) => a.y - b.y).map((shape) => shape.value),
      items: best.map(({ heading, description }) => ({ heading, description })),
    };
  }

  const ordered = shapes.sort((a, b) => a.y - b.y || b.x - a.x);
  return {
    paragraphs: ordered.filter((shape) => !isShort(shape)).map((shape) => shape.value),
    items: ordered.filter(isShort).map((shape) => ({ heading: shape.value, description: "" })),
  };
}

const SLIDE_PARSERS = {
  "service-workflow": parseServiceWorkflowSlide,
  "customer-service-sources": parseCustomerServiceSourcesSlide,
  "service-journey": parseServiceJourneySlide,
  "executive-summary": parseExecutiveSummarySlide,
};

// --- reconciliation ------------------------------------------------------------------------------

function websiteStages(pageId) {
  return (pageKnowledge[pageId]?.currentWorkflow || []).map((stage) => ({
    number: stage.number || pad(stage.order),
    title: stage.title,
    text: [stage.title, stage.summary, ...(stage.details || [])].join(" "),
    execution: parseResponsibility(stage.execution),
  }));
}

function websitePageText(pageId) {
  const knowledge = pageKnowledge[pageId];
  if (!knowledge) return "";
  const structured = knowledge.structured || {};
  return [
    knowledge.title,
    knowledge.scope,
    ...websiteStages(pageId).map((stage) => `${stage.text} ${stage.execution?.display || ""}`),
    ...(structured.sections || []).map((section) => `${section.title} ${section.description} ${(section.examples || []).join(" ")}`),
    ...(structured.notes || []).map((note) => `${note.title} ${note.text}`),
    ...(structured.relationships || []).map((relationship) => relationship.text),
  ].join(" ");
}

function reconcileDeck(deck) {
  const facts = [];
  const add = (slide, fact) =>
    facts.push({
      slideNumber: slide.slideNumber,
      slideTitle: slide.slideTitle,
      service: slide.service,
      pageId: slide.pageId,
      stageNumber: null,
      websiteValue: null,
      ...fact,
      id: [slide.pageId || "global", slide.section, fact.stageNumber, fact.factType].filter(Boolean).join(":"),
    });

  for (const slide of deck.slides) {
    if (slide.kind === "service-workflow") reconcileServiceWorkflow(slide, add);
    else if (slide.kind === "customer-service-sources") reconcileCustomerServiceSources(slide, add);
    else if (slide.kind === "service-journey") reconcileServiceJourney(slide, add);
    else add(slide, { factType: "summary", value: slide.slideTitle, classification: slide.status === SUPPLEMENTAL ? SUPPLEMENTAL : slide.status, reason: "project context; the website has no counterpart" });

    if (slide.notes) add(slide, { factType: "note", value: slide.notes, classification: SUPPLEMENTAL, reason: "speaker notes" });
  }

  return facts;
}

function reconcileServiceWorkflow(slide, add) {
  const pageText = websitePageText(slide.pageId);

  if (slide.responsibleParty) {
    const missing = slide.pageId ? slide.responsibleParty.split("/").map((party) => party.trim()).filter((party) => !normalizeArabic(pageText).includes(normalizeArabic(party))) : ["(no website page)"];
    add(slide, {
      factType: "service-responsibility",
      value: slide.responsibleParty,
      classification: missing.length === 0 ? "duplicate" : SUPPLEMENTAL,
      reason: missing.length === 0 ? "the website page already names this party" : `not shown on the website: ${missing.join("، ")}`,
    });
  }

  // No website page (e.g. free services): the whole flow is supplemental, global assistant only.
  if (!slide.pageId) {
    for (const stage of slide.stages) {
      add(slide, { factType: "stage", stageNumber: stage.number, value: stage, classification: SUPPLEMENTAL, reason: slide.review || "no website page covers this service" });
    }
    return;
  }

  const website = new Map(websiteStages(slide.pageId).map((stage) => [stage.number, stage]));

  for (const stage of slide.stages) {
    const web = website.get(stage.number);
    const review = STAGE_REVIEWS[`${slide.pageId}:${stage.number}`] || {};
    const stageFact = (factType, value, websiteValue, classification, reason) =>
      add(slide, { factType, stageNumber: stage.number, stageTitle: web?.title || stage.title, value, websiteValue, classification, reason });

    if (!web) {
      for (const [factType, value] of [["stage-title", stage.title], ["stage-description", stage.description], ["stage-responsibility", stage.responsibility?.display]]) {
        if (value) stageFact(factType, value, null, "outdated", `stage ${stage.number} does not exist in the current website workflow`);
      }
      continue;
    }

    const titleMatches = !stage.title || titlesEquivalent(stage.title, web.title);
    if (stage.title) {
      stageFact("stage-title", stage.title, web.title, titleMatches ? "duplicate" : "conflict", titleMatches ? "same stage title" : "stage title differs from the website; the website title is used");
    }

    const stageIsVerified = titleMatches || review.sameStage;
    const reviewedConflict = (field) => (review.conflicts || []).includes(field);

    if (stage.description) {
      const coverage = tokenCoverage(stage.description, web.text);
      const [classification, reason] = !stageIsVerified
        ? ["unverified", "slide stage cannot be matched to the website stage (different title, not reviewed)"]
        : reviewedConflict("description")
          ? ["conflict", review.reason]
          : coverage >= DESCRIPTION_DUPLICATE_COVERAGE
            ? ["duplicate", `website stage text covers it (coverage ${coverage.toFixed(2)})`]
            : [SUPPLEMENTAL, `adds wording not on the website (coverage ${coverage.toFixed(2)})`];
      stageFact("stage-description", stage.description, web.text, classification, reason);
    }

    if (stage.responsibility) {
      const label = stage.responsibility;
      let classification;
      let reason;
      if (!stageIsVerified) {
        [classification, reason] = ["unverified", "slide stage cannot be matched to the website stage (different title, not reviewed)"];
      } else if (reviewedConflict("responsibility")) {
        [classification, reason] = ["conflict", review.reason];
      } else if (web.execution) {
        [classification, reason] = sameResponsibility(label, web.execution)
          ? ["duplicate", "same execution label as the website"]
          : ["conflict", `website label is "${web.execution.display}"`];
      } else if (label.mode === "automatic" && MANUAL_CUE_PATTERN.test(web.text)) {
        [classification, reason] = ["conflict", `the website documents manual action in this stage ("${web.text.match(MANUAL_CUE_PATTERN)[0]}"); an automatic label would contradict it`];
      } else {
        [classification, reason] = [SUPPLEMENTAL, "the website shows no execution label for this stage"];
      }
      stageFact("stage-responsibility", label.display, web.execution?.display || null, classification, reason);
    }
  }
}

function reconcileCustomerServiceSources(slide, add) {
  const sections = pageKnowledge[slide.pageId]?.structured?.sections || [];
  const pageText = websitePageText(slide.pageId);

  for (const source of slide.sources) {
    const section = sections.find((item) => titlesEquivalent(item.title, source.title));
    const missingExamples = source.examples.filter((example) => !section?.examples?.some((item) => titlesEquivalent(item, example)));
    add(slide, {
      factType: "case-source",
      stageNumber: source.number,
      stageTitle: source.title,
      value: source,
      websiteValue: section ? { title: section.title, examples: section.examples } : null,
      classification: section && missingExamples.length === 0 ? "duplicate" : SUPPLEMENTAL,
      reason: section && missingExamples.length === 0 ? "same source and examples as the website" : `not on the website: ${section ? missingExamples.join("، ") : source.title}`,
    });
  }

  slide.paragraphs.forEach((paragraph, index) => {
    const coverage = tokenCoverage(paragraph, pageText);
    add(slide, {
      factType: `paragraph-${index + 1}`,
      value: paragraph,
      classification: coverage >= DESCRIPTION_DUPLICATE_COVERAGE ? "duplicate" : SUPPLEMENTAL,
      reason: `website coverage ${coverage.toFixed(2)}`,
    });
  });
}

function reconcileServiceJourney(slide, add) {
  add(slide, { factType: "journey", value: slide.steps, classification: SUPPLEMENTAL, reason: "cross-service journey with departments; the website has no end-to-end counterpart" });

  for (const step of slide.steps.filter((item) => item.pageId)) {
    const pageText = normalizeArabic(websitePageText(step.pageId));
    const coverage = tokenCoverage(step.description, pageText);
    // "قسم التصميم" and "إدارة التصميم" name the same department.
    const departmentKey = normalizeArabic(step.department).replace(/^(قسم|اداره) /, "");
    const departmentShown = ["قسم", "اداره"].some((prefix) => pageText.includes(`${prefix} ${departmentKey}`));
    // The step's position between services is never on a website page, so the step is always a
    // relationship supplement; coverage / department are recorded for review.
    add(
      { ...slide, service: step.service, pageId: step.pageId, section: "service-journey-step" },
      {
        factType: "journey-step",
        stageTitle: step.name,
        value: step,
        classification: SUPPLEMENTAL,
        reason: `cross-service position not on the website; description coverage ${coverage.toFixed(2)}; department ${departmentShown ? "shown" : "not shown"} on the website`,
      },
    );
  }
}

// --- chunks --------------------------------------------------------------------------------------

function buildChunksFromFacts(deck, facts, sourceFile) {
  const chunks = [];
  const active = (fact) => fact.classification === SUPPLEMENTAL || fact.classification === "proposed";
  const slideByNumber = new Map(deck.slides.map((slide) => [slide.slideNumber, slide]));

  const add = ({ key, type, pageId, service, services, title, text, relatedTerms = [], section, stage = null, responsibility = null, status = SUPPLEMENTAL, slide, factIds }) => {
    const pageTitle = pageId ? pageKnowledge[pageId]?.title || null : null;
    const chunk = {
      id: `powerpoint:${pageId || "global"}:${type.replace(/^powerpoint-/, "")}:${key}`,
      pageId: POWERPOINT_PAGE_ID,
      type,
      title,
      text,
      status,
      service: services || (service ? [service] : []),
      domain: "powerpoint",
      relatedTerms: [...new Set(relatedTerms.filter(Boolean))],
      stageId: stage ? `${pageId}:${stage.number}` : null,
      metadata: {
        source_type: "powerpoint",
        source_file: sourceFile,
        slide_number: slide.slideNumber,
        slide_title: slide.slideTitle,
        service: service || null,
        services: services || (service ? [service] : []),
        service_name: serviceNameOf(service),
        page_id: pageId,
        page: pageId,
        page_title: pageTitle,
        section,
        stage_number: stage?.number || null,
        stage_title: stage?.title || null,
        responsibility,
        status,
        fact_ids: factIds,
      },
    };
    chunk.contentHash = buildPowerPointContentHash(chunk);
    chunk.metadata.content_hash = chunk.contentHash;
    chunks.push(chunk);
  };

  for (const slide of deck.slides) {
    const slideFacts = facts.filter((fact) => fact.slideNumber === slide.slideNumber && active(fact));
    if (slideFacts.length === 0) continue;
    // The slide title names the service as the deck does (e.g. "الشكاوى / الاستفسارات" inside customer service).
    const serviceName = slide.kind === "service-workflow" ? slide.slideTitle : serviceNameOf(slide.service);

    if (slide.kind === "service-workflow" && slide.pageId) {
      const party = slideFacts.find((fact) => fact.factType === "service-responsibility");
      const labels = slideFacts.filter((fact) => fact.factType === "stage-responsibility");
      if (party || labels.length) {
        add({
          key: "responsibility",
          type: "powerpoint-responsibility",
          pageId: slide.pageId,
          service: slide.service,
          title: `${serviceName} — الجهة المسؤولة والتنفيذ`,
          text: [
            `${serviceName} — الجهة المسؤولة وتصنيف التنفيذ (آلي/يدوي) كما يعرضه العرض التقديمي المعتمد، للمراحل التي لا تعرض الصفحة لها تصنيفًا:`,
            party ? `الجهة المسؤولة عن الخدمة: ${party.value}` : "",
            ...labels.map((fact) => `المرحلة ${fact.stageNumber} — ${fact.stageTitle}: ${fact.value}`),
          ]
            .filter(Boolean)
            .join("\n"),
          relatedTerms: ["الجهة المسؤولة", "التنفيذ", "آلي", "يدوي", party?.value, ...labels.map((fact) => fact.stageTitle)],
          section: "responsibility",
          responsibility: party?.value || null,
          slide,
          factIds: [party, ...labels].filter(Boolean).map((fact) => fact.id),
        });
      }

      for (const fact of slideFacts.filter((item) => item.factType === "stage-description")) {
        const label = slideFacts.find((item) => item.factType === "stage-responsibility" && item.stageNumber === fact.stageNumber);
        add({
          key: `stage-${fact.stageNumber}`,
          type: "powerpoint-stage",
          pageId: slide.pageId,
          service: slide.service,
          title: `${serviceName} — ${fact.stageNumber} — ${fact.stageTitle}`,
          text: [`${serviceName} — المرحلة ${fact.stageNumber} — ${fact.stageTitle}`, `ملخص المرحلة: ${fact.value}`, label ? `التنفيذ: ${label.value}` : ""].filter(Boolean).join("\n"),
          relatedTerms: [fact.stageTitle, `المرحلة ${fact.stageNumber}`],
          section: "workflow-stage",
          stage: { number: fact.stageNumber, title: fact.stageTitle },
          responsibility: label?.value || null,
          slide,
          factIds: [fact, label].filter(Boolean).map((item) => item.id),
        });
      }
      continue;
    }

    if (slide.kind === "service-workflow") {
      // A service with no website page: one overview chunk with its whole flow.
      const party = slideFacts.find((fact) => fact.factType === "service-responsibility");
      const stages = slideFacts.filter((fact) => fact.factType === "stage").map((fact) => fact.value);
      add({
        key: slide.service,
        type: "powerpoint-overview",
        pageId: null,
        service: slide.service,
        title: `${slide.slideTitle} — ملخص الدورة`,
        text: [
          `${slide.slideTitle} (لا توجد لها صفحة على الموقع؛ المصدر هو العرض التقديمي المعتمد).`,
          party ? `الجهة المسؤولة: ${party.value}` : "",
          `المراحل (${stages.length}): ${stages.map((stage) => `${stage.number} — ${stage.title}`).join(" → ")}`,
          ...stages.map((stage) => `المرحلة ${stage.number} — ${stage.title}: ${stage.description || ""}${stage.responsibility ? ` (التنفيذ: ${stage.responsibility.display})` : ""}`),
          stages.some((stage) => stage.responsibility) ? "" : "لا يعرض العرض التقديمي تصنيفًا (آلي/يدوي) لمراحل هذه الخدمة.",
        ]
          .filter(Boolean)
          .join("\n"),
        relatedTerms: [slide.slideTitle, ...stages.map((stage) => stage.title)],
        section: "service-overview",
        responsibility: party?.value || null,
        slide,
        factIds: slideFacts.map((fact) => fact.id),
      });
      continue;
    }

    if (slide.kind === "customer-service-sources") {
      add({
        key: "case-sources",
        type: "powerpoint-note",
        pageId: slide.pageId,
        service: slide.service,
        title: `${slide.slideTitle} — تفاصيل إضافية`,
        text: slideFacts.map((fact) => (typeof fact.value === "string" ? fact.value : `${fact.value.number} — ${fact.value.title}: ${fact.value.examples.join("، ")}`)).join("\n"),
        section: "case-sources",
        slide,
        factIds: slideFacts.map((fact) => fact.id),
      });
      continue;
    }

    if (slide.kind === "service-journey") {
      const journey = slideFacts.find((fact) => fact.factType === "journey");
      if (journey) {
        add({
          key: "service-journey",
          type: "powerpoint-relationship",
          pageId: null,
          services: [...new Set(journey.value.map((step) => step.service).filter(Boolean))],
          title: slide.slideTitle,
          text: [
            `${slide.slideTitle}: ${slide.paragraphs.join(" ")}`,
            "الرحلة تنتقل بين الخدمات حسب احتياج العميل؛ لا يلزم أن يمر كل طلب بجميع الخدمات.",
            `تسلسل الرحلة: ${journey.value.map((step) => `${step.name} (${step.department})`).join(" → ")}`,
            ...journey.value.map((step) => `${step.name} — ${step.department}: ${step.description || ""}`),
          ].join("\n"),
          relatedTerms: ["رحلة الخدمة", ...journey.value.map((step) => step.name), ...journey.value.map((step) => step.department)],
          section: "service-journey",
          slide,
          factIds: [journey.id],
        });
      }
      for (const fact of slideFacts.filter((item) => item.factType === "journey-step")) {
        const step = fact.value;
        add({
          key: "journey-step",
          type: "powerpoint-relationship",
          pageId: step.pageId,
          service: step.service,
          title: `${serviceNameOf(step.service)} ضمن رحلة الخدمة`,
          text: [
            `${serviceNameOf(step.service)} ضمن ${slide.slideTitle}: ${step.description}`,
            `القسم المسؤول في الرحلة: ${step.department}`,
            `موقعها في الرحلة: ${journeyNeighbours(journey?.value || slide.steps, step.name)} (الرحلة تنتقل بين الخدمات حسب احتياج العميل)`,
          ].join("\n"),
          relatedTerms: [step.name, step.department, "رحلة الخدمة"],
          section: "service-journey",
          responsibility: step.department,
          slide,
          factIds: [fact.id],
        });
      }
      continue;
    }

    const status = slide.status || SUPPLEMENTAL;
    add({
      key: slide.section,
      type: slide.kind === "executive-summary" ? "powerpoint-summary" : "powerpoint-note",
      pageId: null,
      title: slide.slideTitle,
      text: [
        `${slide.slideTitle}${status === "proposed" ? " (خطة مستقبلية مقترحة، وليست الوضع الحالي)" : ""}`,
        ...(slide.paragraphs || []),
        ...(slide.items || []).map((item) => (item.description ? `- ${item.heading}${item.separator || ": "}${item.description}` : `- ${item.heading}`)),
      ].join("\n"),
      relatedTerms: [slide.slideTitle, ...(slide.items || []).map((item) => item.heading)],
      section: slide.section,
      status,
      slide,
      factIds: slideFacts.map((fact) => fact.id),
    });
  }

  return chunks;
}

function journeyNeighbours(steps, name) {
  const index = steps.findIndex((step) => step.name === name);
  const previous = steps[index - 1];
  const next = steps[index + 1];
  return [previous ? `بعد ${previous.name}` : "", next ? `وقبل ${next.name}` : ""].filter(Boolean).join(" ") || "-";
}

// --- public API ----------------------------------------------------------------------------------

let cached = null;

function loadExtraction() {
  if (!fs.existsSync(EXTRACTION_PATH)) return null;
  return JSON.parse(fs.readFileSync(EXTRACTION_PATH, "utf8"));
}

// Full offline analysis of an extraction (defaults to the committed one).
function analyzePowerPoint(extraction = loadExtraction()) {
  if (!extraction) {
    return { extraction: null, deck: { slides: [], excluded: [], anomalies: [] }, facts: [], chunks: [] };
  }
  const deck = parseDeck(extraction);
  const facts = reconcileDeck(deck);
  const chunks = buildChunksFromFacts(deck, facts, extraction.sourceFile || SOURCE_FILE);
  return { extraction, deck, facts, chunks };
}

function getPowerPointAnalysis() {
  if (!cached) cached = analyzePowerPoint();
  return cached;
}

function buildPowerPointChunks() {
  return getPowerPointAnalysis().chunks;
}

// Supplemental stage labels for a website page: Map(stage number → label), used by the derived
// responsibility context for stages the website leaves unlabelled.
function getPowerPointStageLabels(pageId) {
  return new Map(
    getPowerPointAnalysis()
      .facts.filter((fact) => fact.pageId === pageId && fact.factType === "stage-responsibility" && fact.classification === SUPPLEMENTAL)
      .map((fact) => [fact.stageNumber, { label: fact.value, slideNumber: fact.slideNumber }]),
  );
}

function getPowerPointServiceParty(pageId) {
  const fact = getPowerPointAnalysis().facts.find((item) => item.pageId === pageId && item.factType === "service-responsibility" && item.classification === SUPPLEMENTAL);
  return fact ? { party: fact.value, slideNumber: fact.slideNumber } : null;
}

// --- embedding store -----------------------------------------------------------------------------

function formatPowerPointChunkForEmbedding(chunk) {
  return [
    "task: retrieval_document",
    `Collection: ${POWERPOINT_PAGE_ID}`,
    `Title: ${chunk.title}`,
    `Type: ${chunk.type}`,
    `Status: ${chunk.status}`,
    chunk.service.length ? `Service: ${chunk.service.join(", ")}` : "Service: global",
    chunk.metadata.page_title ? `Page: ${chunk.metadata.page_title}` : "",
    `Text: ${chunk.text}`,
    chunk.relatedTerms.length ? `Related terms: ${chunk.relatedTerms.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Slide number / title are metadata only: moving a slide does not invalidate its embedding.
function buildPowerPointContentHash(chunk) {
  const input = {
    id: chunk.id,
    type: chunk.type,
    title: chunk.title,
    text: chunk.text,
    status: chunk.status,
    service: [...chunk.service].sort(),
    page: chunk.metadata?.page_id || null,
    relatedTerms: [...chunk.relatedTerms].sort(),
  };
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function loadPowerPointEmbeddingStore() {
  if (!fs.existsSync(POWERPOINT_STORE_PATH)) return null;
  return JSON.parse(fs.readFileSync(POWERPOINT_STORE_PATH, "utf8"));
}

function savePowerPointEmbeddingStore({ model, embeddingDimension, sourceFile, sourceFileHash, records }) {
  fs.mkdirSync(path.dirname(POWERPOINT_STORE_PATH), { recursive: true });
  const payload = { pageId: POWERPOINT_PAGE_ID, model, generatedAt: new Date().toISOString(), embeddingDimension, sourceFile, sourceFileHash, records };
  fs.writeFileSync(POWERPOINT_STORE_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return POWERPOINT_STORE_PATH;
}

function createPowerPointEmbeddingRecord(chunk, embedding) {
  return { id: chunk.id, contentHash: chunk.contentHash, slideNumber: chunk.metadata.slide_number, embedding };
}

function isValidEmbedding(embedding, dimension) {
  return Array.isArray(embedding) && embedding.length === dimension && embedding.every((value) => typeof value === "number" && Number.isFinite(value));
}

// Joins active chunks with their stored embeddings. A chunk without a fresh embedding (new, or its
// text changed since the last build) is reported in `missing` and left out of semantic ranking;
// it never makes retrieval fail. Store records for chunks that are no longer active are ignored.
function loadPowerPointRecords({ expectedModel = null, expectedDimension = 768 } = {}) {
  const chunks = buildPowerPointChunks();
  const store = loadPowerPointEmbeddingStore();
  const usable = store && (!expectedModel || store.model === expectedModel) && Number(store.embeddingDimension) === expectedDimension;
  const byId = new Map(usable ? store.records.map((record) => [record.id, record]) : []);
  const records = [];
  const missing = [];

  for (const chunk of chunks) {
    const record = byId.get(chunk.id);
    if (record && record.contentHash === chunk.contentHash && isValidEmbedding(record.embedding, expectedDimension)) {
      records.push({ ...chunk, embedding: record.embedding });
    } else {
      missing.push(chunk.id);
    }
  }

  return { store, storeUsable: Boolean(usable), chunks, records, missing };
}

function validatePowerPointEmbeddingStore({ chunks = buildPowerPointChunks(), store = loadPowerPointEmbeddingStore(), expectedModel, expectedDimension = 768 } = {}) {
  const errors = [];
  if (!store) return { ok: false, errors: ["PowerPoint embedding store does not exist."], chunkCount: chunks.length, recordCount: 0 };
  if (store.pageId !== POWERPOINT_PAGE_ID) errors.push(`Store pageId mismatch: expected ${POWERPOINT_PAGE_ID}, got ${store.pageId}`);
  if (expectedModel && store.model !== expectedModel) errors.push(`Store model mismatch: expected ${expectedModel}, got ${store.model}`);
  if (Number(store.embeddingDimension) !== expectedDimension) errors.push(`Store dimension mismatch: expected ${expectedDimension}, got ${store.embeddingDimension}`);

  const byId = new Map();
  for (const record of store.records || []) {
    if (byId.has(record.id)) errors.push(`Duplicate record id: ${record.id}`);
    byId.set(record.id, record);
  }
  for (const chunk of chunks) {
    const record = byId.get(chunk.id);
    if (!record) errors.push(`Missing embedding for chunk: ${chunk.id}`);
    else if (record.contentHash !== chunk.contentHash) errors.push(`Stale content hash for chunk: ${chunk.id}`);
    else if (!isValidEmbedding(record.embedding, expectedDimension)) errors.push(`Malformed embedding vector for chunk: ${chunk.id}`);
  }
  const activeIds = new Set(chunks.map((chunk) => chunk.id));
  const orphans = (store.records || []).filter((record) => !activeIds.has(record.id)).map((record) => record.id);
  if (orphans.length) errors.push(`Records for inactive chunks (rebuild to prune): ${orphans.join(", ")}`);

  return { ok: errors.length === 0, errors, chunkCount: chunks.length, recordCount: (store.records || []).length, dimension: Number(store.embeddingDimension) || 0, model: store.model || "" };
}

module.exports = {
  EXTRACTION_PATH,
  POWERPOINT_PAGE_ID,
  POWERPOINT_STORE_PATH,
  SUPPLEMENTAL,
  analyzePowerPoint,
  buildPowerPointChunks,
  createPowerPointEmbeddingRecord,
  formatPowerPointChunkForEmbedding,
  getPowerPointAnalysis,
  getPowerPointServiceParty,
  getPowerPointStageLabels,
  loadExtraction,
  loadPowerPointEmbeddingStore,
  loadPowerPointRecords,
  normalizeArabic,
  parseResponsibility,
  savePowerPointEmbeddingStore,
  tokenCoverage,
  validatePowerPointEmbeddingStore,
};
