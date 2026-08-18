import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { createStubProvider, STUB_BROKEN_SUM_PATH, STUB_FIXED_SUM_SOURCE } from "../src/providers/stub.js";
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

test("repo fixture broken-sum.js is deliberately wrong", async () => {
  const src = pathToFileURL(fileURLToPath(new URL("../fixtures/broken-sum.js", import.meta.url))).href;
  const mod = await import(src);
  assert.equal(mod.sum(2, 3), -1);
  assert.equal(mod.sumAll([1, 2, 3]), -6);
});

test("stub reads broken-sum then writes a correct implementation", async () => {
  const p = createStubProvider();
  const first = await p.complete({ messages: [{ role: "user", content: "fix the broken sum" }] });
  assert.equal(first.tool_calls[0].function.name, "read_file");
  const readArgs = JSON.parse(first.tool_calls[0].function.arguments);
  assert.equal(readArgs.path, STUB_BROKEN_SUM_PATH);

  const second = await p.complete({
    messages: [
      { role: "user", content: "fix the broken sum" },
      first,
      { role: "tool", tool_call_id: first.tool_calls[0].id, content: JSON.stringify({ path: STUB_BROKEN_SUM_PATH, content: "return a - b" }) },
    ],
  });
  assert.equal(second.tool_calls[0].function.name, "write_file");
  const writeArgs = JSON.parse(second.tool_calls[0].function.arguments);
  assert.equal(writeArgs.path, STUB_BROKEN_SUM_PATH);
  assert.equal(writeArgs.content, STUB_FIXED_SUM_SOURCE);
  assert.match(writeArgs.content, /Number\(a\) \+ Number\(b\)/);
  assert.doesNotMatch(writeArgs.content, /a - b/);

  const third = await p.complete({
    messages: [
      { role: "user", content: "fix the broken sum" },
      first,
      { role: "tool", tool_call_id: first.tool_calls[0].id, content: "{\"path\":\"fixtures/broken-sum.js\"}" },
      second,
      { role: "tool", tool_call_id: second.tool_calls[0].id, content: JSON.stringify({ path: STUB_BROKEN_SUM_PATH, bytes: 12 }) },
    ],
  });
  assert.ok(!third.tool_calls);
  assert.match(third.content, /Fixed broken-sum\.js/i);
  assert.match(third.content, /offline mock, not a model/i);
});
