const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { ERROR_ANSWER, handleAskPayload } = require("./askHandler");
const { loadEnvFile } = require("./embeddingService");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
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

async function handleAsk(request, response) {
  const body = await readJsonBody(request);
  const result = await handleAskPayload(body);
  sendJson(response, result.statusCode, result.payload);
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
