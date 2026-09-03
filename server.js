const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { pageKnowledge, findSupportedAnswer } = require("./pageKnowledge");
const { buildRetrievedContext, retrieveRelevantChunks } = require("./retrievalService");
const { answerFromRetrievedContext } = require("./llmService");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MAX_QUESTION_LENGTH = 500;
const FALLBACK_ANSWER = "المعلومة غير متوفرة ضمن هذه الصفحة.";
const ERROR_ANSWER = "تعذر الحصول على إجابة حاليًا. حاول مرة أخرى.";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";

loadEnvFile();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/ask") {
      console.log("POST /api/ask received");
      await handleAsk(request, response);
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      serveStatic(request, response);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed" });
  } catch {
    sendJson(response, 500, { answer: ERROR_ANSWER });
  }
});

server.listen(PORT, () => {
  console.log(`Training portal server running at http://localhost:${PORT}`);
  console.log(`Gemini key loaded: ${Boolean(process.env.ai)}`);
  console.log(`Gemini model: ${GEMINI_MODEL}`);
});

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

async function handleAsk(request, response) {
  const body = await readJsonBody(request);
  const pageId = typeof body.pageId === "string" ? body.pageId.trim() : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";

  console.log(
    `Ask payload: pageId=${pageId || "(missing)"}, questionLength=${question.length}, supportedPage=${Boolean(pageKnowledge[pageId])}`,
  );

  if (!pageKnowledge[pageId]) {
    sendJson(response, 400, { answer: FALLBACK_ANSWER });
    return;
  }

  if (!question || question.length > MAX_QUESTION_LENGTH) {
    sendJson(response, 400, { answer: "يرجى كتابة سؤال واضح لا يتجاوز 500 حرف." });
    return;
  }

  if (!process.env.ai) {
    console.error("Gemini key loaded: false");
    sendJson(response, 503, { answer: ERROR_ANSWER });
    return;
  }

  const supportedAnswer = findSupportedAnswer(pageId, question);

  if (supportedAnswer) {
    sendJson(response, 200, { answer: supportedAnswer });
    return;
  }

  try {
    const retrieval = await retrieveRelevantChunks({ pageId, question });

    console.log(
      [
        `RAG retrieval: pageId=${pageId}`,
        `retrieved=${retrieval.chunks.map((chunk) => `${chunk.id}:${chunk.score}`).join(", ") || "none"}`,
        `topScore=${retrieval.topScore}`,
        `thresholdTriggered=${retrieval.thresholdTriggered}`,
      ].join("; "),
    );

    if (retrieval.thresholdTriggered || retrieval.chunks.length === 0) {
      sendJson(response, 200, { answer: FALLBACK_ANSWER });
      return;
    }

    const answer = await answerFromRetrievedContext({ question, retrievedContext: buildRetrievedContext(retrieval.chunks) });
    sendJson(response, 200, { answer: answer || FALLBACK_ANSWER });
  } catch (error) {
    console.error(`Gemini API failure: ${error.message}`);
    sendJson(response, 502, { answer: ERROR_ANSWER });
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let data = "";

    request.on("data", (chunk) => {
      data += chunk;

      if (data.length > 10_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    request.on("error", reject);
  });
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname);
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.slice(1);
  const filePath = path.resolve(ROOT, relativePath);
  const relativeResolvedPath = path.relative(ROOT, filePath);

  if (
    relativeResolvedPath.startsWith("..") ||
    path.isAbsolute(relativeResolvedPath) ||
    path.basename(filePath) === ".env"
  ) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    response.end(data);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}
