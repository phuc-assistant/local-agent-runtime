import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { initWorkspace } from "../src/init.js";
import { runPrompt } from "../src/run.js";
import { getStatus } from "../src/status.js";
import { main } from "../src/cli.js";

const bin = fileURLToPath(new URL("../bin/lar.js", import.meta.url));

test("init plus run hello world writes hello.txt", async () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), "lar-cli-"));
  const init = initWorkspace(ws);
  assert.equal(init.config.provider, "stub");
  const run = await runPrompt(ws, "Write a hello world file", { sandbox: "subprocess" });
  assert.equal(run.status, "completed");
  assert.equal(run.provider, "stub");
  assert.equal(run.sandbox, "subprocess");
  const hello = fs.readFileSync(path.join(ws, "hello.txt"), "utf8");
  assert.equal(hello, "Hello, world\n");
  const status = getStatus(ws);
  assert.equal(status.run.id, run.id);
});

test("cli help exits 0", async () => {
  const code = await main(["help"]);
  assert.equal(code, 0);
});

test("cli binary init and run hello-world", () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), "lar-bin-"));
  const init = spawnSync(process.execPath, [bin, "init", ws], { encoding: "utf8" });
  assert.equal(init.status, 0, init.stderr);
  assert.match(init.stdout, /Initialized workspace|Reused workspace/);
  const run = spawnSync(
    process.execPath,
    [bin, "run", "--workspace", ws, "--sandbox", "subprocess", "Write a hello world file"],
    { encoding: "utf8" },
  );
  assert.equal(run.status, 0, run.stderr + run.stdout);
  assert.match(run.stdout, /Hello-world complete/);
  assert.equal(fs.readFileSync(path.join(ws, "hello.txt"), "utf8"), "Hello, world\n");
});

test("stub echo does not write hello.txt", async () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), "lar-echo-"));
  initWorkspace(ws);
  const run = await runPrompt(ws, "What is 2+2?", { sandbox: "subprocess" });
  assert.equal(run.status, "completed");
  assert.match(run.final, /stub-echo/);
  assert.equal(fs.existsSync(path.join(ws, "hello.txt")), false);
});
