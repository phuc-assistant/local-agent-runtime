import fs from "node:fs";
import path from "node:path";
import { assertInside } from "../paths.js";
import { runSubprocess } from "./subprocess.js";
import { dockerAvailable, runDocker } from "./docker.js";

export async function selectSandbox(mode = "auto") {
  if (mode === "subprocess") return "subprocess";
  if (mode === "docker") {
    if (await dockerAvailable()) return "docker";
    throw new Error("sandbox=docker requested but docker is not available");
  }
  if (await dockerAvailable()) return "docker";
  return "subprocess";
}

export function writeFileSandboxed(workspace, relPath, content) {
  const dest = assertInside(workspace, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, "utf8");
  return { path: relPath, bytes: Buffer.byteLength(content, "utf8") };
}

export function readFileSandboxed(workspace, relPath) {
  const dest = assertInside(workspace, relPath);
  if (!fs.existsSync(dest) || fs.statSync(dest).isDirectory()) {
    throw new Error("file not found: " + relPath);
  }
  const buf = fs.readFileSync(dest);
  if (buf.length > 200000) throw new Error("file too large to read in sandbox");
  return buf.toString("utf8");
}

export function listFilesSandboxed(workspace, relPath = ".") {
  const dest = assertInside(workspace, relPath === "" ? "." : relPath);
  if (!fs.existsSync(dest)) throw new Error("path not found: " + relPath);
  const entries = fs.readdirSync(dest, { withFileTypes: true });
  return entries
    .filter((e) => e.name !== ".lar")
    .map((e) => ({ name: e.name, type: e.isDirectory() ? "dir" : "file" }));
}

export async function runCommandSandboxed(workspace, argv, ctx) {
  if (!ctx.allowShell) throw new Error("run_shell is disabled (set allowShell true in config)");
  if (!Array.isArray(argv) || argv.length === 0) throw new Error("command argv required");
  const command = argv[0];
  if (command.includes("/") || command.includes("\\\\")) {
    throw new Error("sandbox rejects command paths; use a bare executable name");
  }
  const args = argv.slice(1).map(String);
  if (ctx.sandbox === "docker") {
    return runDocker({ cwd: workspace, command, args, network: ctx.network, timeoutMs: ctx.timeoutMs });
  }
  return runSubprocess({ cwd: workspace, command, args, network: ctx.network, timeoutMs: ctx.timeoutMs });
}
