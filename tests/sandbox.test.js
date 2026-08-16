import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assertInside, defaultConfig } from "../src/paths.js";
import { writeFileSandboxed, listFilesSandboxed } from "../src/sandbox/index.js";

test("assertInside rejects absolute paths", () => {
  const ws = os.tmpdir();
  assert.throws(() => assertInside(ws, "/etc/passwd"));
});

test("assertInside rejects parent escape", () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), "lar-"));
  assert.throws(() => assertInside(ws, "../escape.txt"));
  assert.throws(() => assertInside(ws, "ok/../../../etc/passwd"));
});

test("writeFileSandboxed stays in workspace", () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), "lar-"));
  const out = writeFileSandboxed(ws, "hello.txt", "Hello, world\n");
  assert.equal(out.bytes, 13);
  assert.equal(fs.readFileSync(path.join(ws, "hello.txt"), "utf8"), "Hello, world\n");
  const names = listFilesSandboxed(ws, ".").map((e) => e.name);
  assert.ok(names.includes("hello.txt"));
});

test("defaultConfig uses stub and network off", () => {
  const c = defaultConfig();
  assert.equal(c.provider, "stub");
  assert.equal(c.network, false);
  assert.equal(c.sandbox, "auto");
});
