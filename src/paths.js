import fs from "node:fs";
import path from "node:path";

export const CONFIG_DIR = ".lar";
export const CONFIG_FILE = "config.json";

export function resolveWorkspace(start = process.cwd()) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, CONFIG_DIR, CONFIG_FILE))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function assertInside(workspace, relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error("path is required");
  }
  if (path.isAbsolute(relativePath)) {
    throw new Error("sandbox rejects absolute paths: " + relativePath);
  }
  const workspaceRoot = path.resolve(workspace);
  const resolved = path.resolve(workspaceRoot, relativePath);
  const rel = path.relative(workspaceRoot, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("sandbox path escapes workspace: " + relativePath);
  }
  return resolved;
}

export function defaultConfig() {
  return {
    provider: "stub",
    baseUrl: "http://127.0.0.1:11434/v1",
    model: "stub-echo",
    sandbox: "auto",
    network: false,
    maxSteps: 8,
    allowShell: false,
    store: "jsonl"
  };
}
