import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createOpenAIProvider } from "../src/providers/openai.js";
import { runAgentLoop } from "../src/agent/loop.js";
import { defaultConfig } from "../src/paths.js";
import { TOOL_DEFS } from "../src/agent/tools.js";

function startMock(handler) {
  const requests = [];
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      let parsed = null;
      try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = raw; }
      requests.push({
        method: req.method,
        url: req.url,
        authorization: req.headers.authorization || "",
        body: parsed,
      });
      res.setHeader("connection", "close");
      handler({ req, res, body: parsed, raw });
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({
        server,
        requests,
        port: addr.port,
        baseUrl: "http://127.0.0.1:" + addr.port + "/v1",
        close: () => new Promise((done) => {
          if (typeof server.closeAllConnections === "function") server.closeAllConnections();
          server.close(() => done());
        }),
      });
    });
  });
}

function writeCompletions(res, message, finishReason) {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({
    id: "chatcmpl-mock",
    object: "chat.completion",
    choices: [{ index: 0, message, finish_reason: finishReason }],
  }));
}

test("openai-compatible adapter POSTs /chat/completions and write_file via mock HTTP", async () => {
  const mock = await startMock(({ req, res, body }) => {
    if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const messages = (body && body.messages) || [];
    const hasToolResult = messages.some((m) => m.role === "tool");
    if (!hasToolResult) {
      writeCompletions(res, {
        role: "assistant",
        content: null,
        tool_calls: [{
          id: "call_write_1",
          type: "function",
          function: {
            name: "write_file",
            arguments: { path: "hello.txt", content: "Hello, world\n" },
          },
        }],
      }, "tool_calls");
      return;
    }
    writeCompletions(res, {
      role: "assistant",
      content: "Wrote hello.txt via openai-compatible mock (no paid API).",
    }, "stop");
  });
  try {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "lar-oai-"));
    const provider = createOpenAIProvider({
      baseUrl: mock.baseUrl,
      model: "mock-model",
      apiKey: "sk-test-not-a-real-key",
    });
    const result = await runAgentLoop({
      prompt: "Write a hello world file",
      provider,
      workspace: ws,
      sandbox: "subprocess",
      config: { ...defaultConfig(), maxSteps: 4, allowShell: false },
    });
    assert.equal(result.status, "completed");
    assert.equal(fs.readFileSync(path.join(ws, "hello.txt"), "utf8"), "Hello, world\n");
    assert.equal(mock.requests.length, 2);
    assert.equal(mock.requests[0].method, "POST");
    assert.equal(mock.requests[0].url, "/v1/chat/completions");
    assert.equal(mock.requests[0].authorization, "Bearer sk-test-not-a-real-key");
    assert.equal(mock.requests[0].body.model, "mock-model");
    const toolNames = (mock.requests[0].body.tools || []).map((t) => t.function && t.function.name);
    assert.ok(toolNames.includes("write_file"));
    assert.ok(JSON.stringify(TOOL_DEFS).includes("write_file"));
    const toolMsg = mock.requests[1].body.messages.find((m) => m.role === "tool");
    assert.ok(toolMsg);
    assert.equal(toolMsg.tool_call_id, "call_write_1");
    assert.match(result.final, /openai-compatible mock/);
    assert.equal(result.steps[0].tool, "write_file");
    assert.equal(result.steps[0].ok, true);
  } finally {
    await mock.close();
  }
});

test("openai-compatible adapter surfaces HTTP errors from mock", async () => {
  const mock = await startMock(({ res }) => {
    res.writeHead(401, { "content-type": "application/json", connection: "close" });
    res.end(JSON.stringify({ error: { message: "invalid mock key" } }));
  });
  try {
    const provider = createOpenAIProvider({
      baseUrl: mock.baseUrl,
      model: "mock-model",
      apiKey: "sk-test-not-a-real-key",
    });
    await assert.rejects(
      () => provider.complete({ messages: [{ role: "user", content: "hi" }] }),
      /provider HTTP 401/,
    );
  } finally {
    await mock.close();
  }
});
