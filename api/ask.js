const { ERROR_ANSWER, handleAskPayload } = require("../askHandler");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await getRequestBody(request);
    const result = await handleAskPayload(body);
    sendJson(response, result.statusCode, result.payload);
  } catch {
    sendJson(response, 500, { answer: ERROR_ANSWER });
  }
};

async function getRequestBody(request) {
  if (Buffer.isBuffer(request.body)) {
    const text = request.body.toString("utf8");
    return text ? JSON.parse(text) : {};
  }

  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    return request.body ? JSON.parse(request.body) : {};
  }

  return readJsonBody(request);
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

function sendJson(response, statusCode, payload) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.status(statusCode).json(payload);
}
