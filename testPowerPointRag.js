// PowerPoint knowledge source tests.
//   node testPowerPointRag.js          offline: no Gemini calls (embedding + fetch are stubbed; retrieval
//                                      runs in lexical fallback mode)
//   node testPowerPointRag.js --live   small smoke test through handleAskPayload (a few Gemini calls)
const path = require("node:path");
const live = process.argv.includes("--live");

const embeddingService = require("./embeddingService");
if (!live) {
  embeddingService.createEmbedding = async () => {
    throw new Error("offline test: embeddings disabled");
  };
  global.fetch = async () => {
    throw new Error("offline test: network call attempted");
  };
}

const { extractPresentation } = require("./powerpointExtractor");
const { SOURCE_FILE } = require("./knowledge/powerpoint/manifest");
const { analyzePowerPoint, getPowerPointAnalysis, loadExtraction } = require("./powerpointKnowledge");
const { buildHybridRetrievedContext, isPowerPointRecordAllowedOnPage, retrieveGlobalAssistantChunks, retrieveHybridChunks } = require("./hybridRetrievalService");
const { buildAutomationSummaryContext, buildResponsibilityContext } = require("./derivedKnowledgeContext");
const { FALLBACK_ANSWER, GLOBAL_FALLBACK_ANSWER, answerFromRetrievedContext } = require("./llmService");
const { pageKnowledge } = require("./pageKnowledge");

const results = [];

function check(name, condition, detail = "") {
  results.push(Boolean(condition));
  console.log(`${condition ? "PASS" : "FAIL"} ${name}${!condition && detail ? `\n     ${detail}` : ""}`);
}

const { facts, chunks } = getPowerPointAnalysis();
const factOf = (id) => facts.find((fact) => fact.id === id);
const chunkText = chunks.map((chunk) => chunk.text).join("\n");

async function offline() {
  // A. website-only fact: design labels are shown on the website; the slide only corroborates them.
  const designLabels = facts.filter((fact) => fact.pageId === "design" && fact.factType === "stage-responsibility");
  check("A1 design stage labels are duplicates of the website", designLabels.length === 7 && designLabels.every((fact) => fact.classification === "duplicate"));
  const designContext = buildResponsibilityContext("design");
  check("A2 design responsibility context comes from the website only", designContext.includes("04 — موافقات داخلية: يدوي / إدارة التصميم") && !designContext.includes("العرض التقديمي"));

  // B. PowerPoint-only supplemental fact.
  check("B1 delivery stage 03 label is supplemental", factOf("intro-tour:service-workflow:03:stage-responsibility")?.classification === "supplemental");
  check(
    "B2 delivery responsibility context adds the slide label, marked as PowerPoint",
    buildResponsibilityContext("intro-tour").includes("03 — ربط الخدمة بالسائق: يدوي مسؤول التحميل / إدارة المستودعات (العرض التقديمي المعتمد"),
  );
  const deliveryRetrieval = await retrieveHybridChunks({ pageId: "intro-tour", question: "مين المسؤول عن ربط الخدمة بالسائق؟" });
  check(
    "B3 delivery page retrieval surfaces the delivery PowerPoint responsibility chunk",
    deliveryRetrieval.chunks.some((chunk) => chunk.id === "powerpoint:intro-tour:responsibility:responsibility"),
    deliveryRetrieval.chunks.map((chunk) => chunk.id).join(", "),
  );

  // C. duplicate fact: maintenance labels match the website; no duplicate chunk is created.
  check("C1 maintenance stage 00 label is a duplicate", factOf("maintenance:service-workflow:00:stage-responsibility")?.classification === "duplicate");
  check("C2 no PowerPoint chunk repeats the maintenance stage labels", !chunks.some((chunk) => chunk.metadata.page_id === "maintenance" && /يدوي \/ (الإدارة|خدمة العملاء|الجهة المختصة|الفني)/.test(chunk.text)));
  check("C3 maintenance preliminary report stays 'يدوي / الجهة المختصة' (website)", buildResponsibilityContext("maintenance").includes("03 — التقرير المبدئي: يدوي / الجهة المختصة"));
  check(
    "C4 the deck's old maintenance stage 04 (القرار النهائي / الموافقات) is excluded",
    factOf("maintenance:service-workflow:04:stage-title")?.classification === "conflict" &&
      ["unverified", "conflict"].includes(factOf("maintenance:service-workflow:04:stage-responsibility")?.classification),
  );

  // D. conflicting fact: slide says warehouse pickup stage 02 is manual, the website says automatic.
  check("D1 warehouse pickup stage 02 label is a conflict", factOf("warehouse-pickup:service-workflow:02:stage-responsibility")?.classification === "conflict");
  check(
    "D2 the conflicting label is excluded from chunks and derived context",
    !chunks.some((chunk) => chunk.metadata.page_id === "warehouse-pickup" && /يدوي \/ إدارة المستودعات/.test(chunk.text)) &&
      buildResponsibilityContext("warehouse-pickup").includes("02 — تأكيد استلام العميل: آلي من خلال النظام"),
  );
  check(
    "D3 every conflict / outdated / unverified fact stays out of chunk text",
    facts
      .filter((fact) => ["conflict", "outdated", "unverified"].includes(fact.classification) && fact.factType !== "stage-title")
      .every((fact) => !chunks.some((chunk) => chunk.metadata.fact_ids.includes(fact.id))),
  );

  // E. page-specific retrieval: PowerPoint chunks never cross into another service's page.
  let leaks = [];
  for (const pageId of Object.keys(pageKnowledge)) {
    for (const chunk of chunks) {
      const allowed = isPowerPointRecordAllowedOnPage({ record: chunk, pageId, mentionedRelatedPages: [], hasGlobalIntent: false });
      if (allowed !== (chunk.metadata.page_id === pageId)) leaks.push(`${pageId} ← ${chunk.id}`);
    }
  }
  check("E1 page eligibility is limited to the page's own PowerPoint chunks", leaks.length === 0, leaks.join(", "));
  const designRetrieval = await retrieveHybridChunks({ pageId: "design", question: "شو المراحل اللي فيها موافقات أو متابعة العمل؟" });
  const foreign = designRetrieval.chunks.filter((chunk) => chunk.sourceType === "powerpoint" && chunk.metadata?.page_id !== "design");
  check("E2 design page does not pull other services' PowerPoint chunks", foreign.length === 0, foreign.map((chunk) => chunk.id).join(", "));
  check("E3 design page answers from design knowledge first", designRetrieval.chunks[0]?.id.startsWith("design:"), designRetrieval.chunks[0]?.id);

  // F. cross-service global retrieval.
  const comparison = await retrieveGlobalAssistantChunks({ question: "ما الفرق بين التحويلات الداخلية واستلام العميل البضاعة من المستودع؟" });
  const services = new Set(comparison.chunks.flatMap((chunk) => chunk.service));
  check("F1 global comparison retrieves both services", services.has("internal_transfer") && services.has("warehouse_pickup"), [...services].join(","));
  const automation = buildAutomationSummaryContext();
  const fullyManual = automation.split("\n").filter((line) => /مراحل آلية: لا يوجد؛ مراحل يدوية/.test(line) && !/بلا تصنيف موثق/.test(line));
  // Maintenance stages 04 and 07 carry no execution label, so maintenance is not reported as fully manual.
  check(
    "F2 'which services are fully manual' → design, complaints (maintenance has unlabelled 04 / 07)",
    fullyManual.length === 2 && ["خدمة التصميم", "الشكاوى / الاستفسارات"].every((name) => fullyManual.some((line) => line.includes(name))) &&
      automation.split("\n").some((line) => line.includes("خدمة الصيانة") && line.includes("مراحل بلا تصنيف موثق: 04 — في انتظار قطع الغيار، 07 — مكتملة")),
    fullyManual.join(" | "),
  );
  const maintenanceGlobal = await retrieveGlobalAssistantChunks({ question: "شو مرحلة في انتظار قطع الغيار بالصيانة؟" });
  check(
    "F3 global maintenance question retrieves the maintenance spare-parts stage (website)",
    maintenanceGlobal.chunks.some((chunk) => chunk.id === "maintenance:current-workflow:maintenance-spare-parts"),
    maintenanceGlobal.chunks.map((chunk) => chunk.id).join(", "),
  );
  const complaintsGlobal = await retrieveGlobalAssistantChunks({ question: "شو مراحل الشكاوى / الاستفسارات؟" });
  check("F4 global complaints stages come from the complaints page", complaintsGlobal.chunks.some((chunk) => chunk.id === "complaints:workflow-sequence:current"));
  const csPage = await retrieveHybridChunks({ pageId: "customer-service", question: "شو مصدر الحالة بخدمة العملاء؟" });
  const csContext = buildHybridRetrievedContext(csPage.chunks);
  check("F5 case sources: internal departments / customer directly / system", ["من الإدارات الداخلية", "من العميل مباشرة", "من النظام"].every((term) => csContext.includes(term)));

  // G. outdated slide content is excluded; the website stage list stays authoritative.
  const synthetic = withSyntheticDesignChanges(loadExtraction());
  const syntheticAnalysis = analyzePowerPoint(synthetic);
  const outdated = syntheticAnalysis.facts.filter((fact) => fact.pageId === "design" && fact.stageNumber === "07");
  check("G1 a slide stage that the website does not have is outdated", outdated.length > 0 && outdated.every((fact) => fact.classification === "outdated"));
  const renamed = syntheticAnalysis.facts.filter((fact) => fact.pageId === "design" && fact.stageNumber === "04");
  check(
    "G2 a renamed (older) design stage is a title conflict and its facts are not used",
    renamed.find((fact) => fact.factType === "stage-title")?.classification === "conflict" &&
      renamed.filter((fact) => fact.factType !== "stage-title").every((fact) => fact.classification === "unverified"),
  );
  check("G3 no chunk is built from outdated / unverified design stages", !syntheticAnalysis.chunks.some((chunk) => /مراجعة الإدارة|أرشفة التصميم/.test(chunk.text)));
  check("G4 slide title 'استلام الخدمة' for measurement 06 is excluded (website: تمت الخدمة)", factOf("measurement:service-workflow:06:stage-title")?.classification === "conflict" && !/— استلام الخدمة/.test(chunks.filter((chunk) => chunk.metadata.page_id === "measurement").map((chunk) => chunk.text).join("\n")));

  // H. unsupported question: SLA is documented nowhere → fallback, no LLM call.
  for (const [label, retrieval, fallback] of [
    ["maintenance page", await retrieveHybridChunks({ pageId: "maintenance", question: "شو SLA الصيانة؟" }), FALLBACK_ANSWER],
    ["global", await retrieveGlobalAssistantChunks({ question: "شو SLA الصيانة؟" }), GLOBAL_FALLBACK_ANSWER],
  ]) {
    const answer = await answerFromRetrievedContext({ question: "شو SLA الصيانة؟", retrievedContext: buildHybridRetrievedContext(retrieval.chunks), fallbackAnswer: fallback });
    check(`H1 SLA question (${label}) → not documented`, answer === fallback, answer);
  }
  check("H2 no PowerPoint chunk mentions SLA", !/SLA/i.test(chunkText));

  // Update detection (per-slide reuse + stable chunk hashes).
  const extraction = loadExtraction();
  const sourcePath = path.join(__dirname, SOURCE_FILE);
  const again = extractPresentation(sourcePath, { previous: extraction });
  check("U1 committed extraction matches the approved deck", again.fileHash === extraction.fileHash);
  check("U2 unchanged deck → every slide reused from cache", again.stats.reused === extraction.slideCount && again.stats.parsed === 0);
  const oneChanged = { ...extraction, slides: extraction.slides.map((slide, index) => (index === 4 ? { ...slide, xmlHash: "changed" } : slide)) };
  const partial = extractPresentation(sourcePath, { previous: oneChanged });
  check("U3 one changed slide → only that slide is re-parsed", partial.stats.parsed === 1 && partial.stats.reused === extraction.slideCount - 1);
  const reordered = analyzePowerPoint({ ...extraction, slides: [...extraction.slides].reverse().map((slide, index) => ({ ...slide, number: index + 1 })) });
  const hashes = new Map(chunks.map((chunk) => [chunk.id, chunk.contentHash]));
  check("U4 reordering slides does not change chunk ids or content hashes (no re-embedding)", reordered.chunks.length === chunks.length && reordered.chunks.every((chunk) => hashes.get(chunk.id) === chunk.contentHash));

  // Source metadata is preserved for future source-aware answers.
  check(
    "S1 every chunk carries source metadata",
    chunks.every((chunk) => chunk.metadata.source_type === "powerpoint" && chunk.metadata.source_file === SOURCE_FILE && chunk.metadata.slide_number && chunk.metadata.slide_title && chunk.metadata.content_hash),
  );
}

// Test-only deck variant: design gets an extra stage 07 and an older name for stage 04.
function withSyntheticDesignChanges(extraction) {
  const slides = extraction.slides.map((slide) => {
    const texts = slide.shapes.map((shape) => shape.text);
    if (!texts.includes("خدمة التصميم")) return slide;
    const shapes = slide.shapes.map((shape) => (shape.text === "موافقات داخلية" ? { ...shape, text: "مراجعة الإدارة", paragraphs: ["مراجعة الإدارة"] } : shape));
    const shape = (id, text, x, y) => ({ id, name: `synthetic ${id}`, group: null, x, y, width: 60, height: 30, centerX: x + 30, paragraphs: [text], text });
    shapes.push(shape(9001, "07", 150, 215), shape(9002, "أرشفة التصميم", 100, 284), shape(9003, "07", 315, 654), { ...shape(9004, "أرشفة التصميم بعد الاعتماد.", 55, 695), width: 250, centerX: 180 });
    return { ...slide, shapes };
  });
  return { ...extraction, slides };
}

async function smoke() {
  const { handleAskPayload } = require("./askHandler");
  const cases = [
    { pageId: "maintenance", question: "ما الفرق بين موعد جدولة موعد وموعد تحديد موعد الصيانة؟", expect: (answer) => /معاينة/.test(answer) && /تنفيذ/.test(answer) },
    { pageId: "design", question: "ما مراحل خدمة التصميم؟", expect: (answer) => ["فاتورة من SAP", "طلب تصميم", "مُسندة لمصمم", "جاري العمل على التصميم", "موافقات داخلية", "بانتظار موافقة العميل", "مكتمل ومعتمد"].every((title) => answer.includes(title)) },
    { pageId: "customer-service", question: "شو مصدر الحالة بخدمة العملاء؟", expect: (answer) => /الإدارات الداخلية/.test(answer) && /العميل مباشرة/.test(answer) && /النظام/.test(answer) },
    { pageId: "maintenance", question: "شو SLA الصيانة؟", expect: (answer) => answer === FALLBACK_ANSWER || /غير (موثق|متوفر|مذكور)/.test(answer) },
  ];
  for (const testCase of cases) {
    const result = await handleAskPayload({ pageId: testCase.pageId, question: testCase.question }, { log: (line) => console.log(`  log: ${line}`), error: console.error });
    const answer = result.payload.answer || "";
    check(`LIVE ${testCase.pageId}: ${testCase.question}`, result.statusCode === 200 && testCase.expect(answer), answer);
    console.log(`  answer: ${answer}`);
  }
}

(live ? smoke() : offline())
  .then(() => {
    console.log(`result=${results.every(Boolean) ? "PASS" : "FAIL"} (${results.filter(Boolean).length}/${results.length})`);
    if (!results.every(Boolean)) process.exitCode = 1;
  })
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
