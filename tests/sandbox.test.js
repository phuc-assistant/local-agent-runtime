import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assertInside, defaultConfig } from "../src/paths.js";
import { writeFileSandboxed, listFilesSandboxed, selectSandbox } from "../src/sandbox/index.js";
import { dockerAvailable, runDocker } from "../src/sandbox/docker.js";

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

test("selectSandbox auto uses subprocess when docker is missing", async () => {
  const mode = await selectSandbox("auto");
  if (await dockerAvailable()) {
    assert.equal(mode, "docker");
  } else {
    assert.equal(mode, "subprocess");
  }
});

test("docker sandbox echo when docker is installed", async (t) => {
  if (!(await dockerAvailable())) {
    t.skip("docker not installed; subprocess is the documented fallback, not a VM");
    return;
  }
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), "lar-dock-"));
  fs.writeFileSync(path.join(ws, "marker.txt"), "ok\n");
  const out = await runDocker({ cwd: ws, command: "cat", args: ["marker.txt"], network: false, timeoutMs: 20000 });
  assert.equal(out.exitCode, 0, out.stderr);
  assert.match(out.stdout, /ok/);
});
