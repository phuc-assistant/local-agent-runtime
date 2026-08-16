import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { recordRun, lastRun } from "../src/store/index.js";

test("jsonl stores last run", () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), "lar-store-"));
  fs.mkdirSync(path.join(ws, ".lar"), { recursive: true });
  recordRun(ws, {
    id: "run_test_1", prompt: "hello", status: "completed",
    provider: "stub", model: "stub-echo", sandbox: "subprocess",
    network: false, startedAt: "2026-08-16T00:00:00.000Z",
    endedAt: "2026-08-16T00:00:01.000Z", final: "ok", steps: [],
  });
  const run = lastRun(ws);
  assert.equal(run.id, "run_test_1");
  assert.equal(run.provider, "stub");
  const jsonl = fs.readFileSync(path.join(ws, ".lar", "runs.jsonl"), "utf8");
  assert.match(jsonl, /run_test_1/);
  const dump = fs.readFileSync(path.join(ws, ".lar", "runs.sql"), "utf8");
  assert.match(dump, /CREATE TABLE IF NOT EXISTS Run/);
  assert.match(dump, /run_test_1/);
});
