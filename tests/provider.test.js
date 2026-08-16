import assert from "node:assert/strict";
import test from "node:test";
import { createStubProvider } from "../src/providers/stub.js";
import { createProvider } from "../src/providers/index.js";

test("stub writes hello.txt via tool call", async () => {
  const p = createStubProvider();
  const reply = await p.complete({ messages: [{ role: "user", content: "Write a hello world file" }] });
  assert.equal(reply.tool_calls[0].function.name, "write_file");
  const args = JSON.parse(reply.tool_calls[0].function.arguments);
  assert.equal(args.path, "hello.txt");
  assert.match(args.content, /Hello, world/);
});

test("stub finishes after tool result", async () => {
  const p = createStubProvider();
  const reply = await p.complete({ messages: [{ role: "tool", content: "{\"path\":\"hello.txt\"}" }] });
  assert.match(reply.content, /stub provider/i);
  assert.ok(!reply.tool_calls);
});

test("factory default is stub", () => {
  const p = createProvider({ provider: "stub" });
  assert.equal(p.id, "stub");
});

test("openai-compatible refuses missing key", async () => {
  const p = createProvider({ provider: "openai-compatible", baseUrl: "http://127.0.0.1:9/v1" });
  await assert.rejects(
    () => p.complete({ messages: [{ role: "user", content: "hi" }] }),
    /missing API key/i
  );
});
