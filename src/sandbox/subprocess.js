import { spawn } from "node:child_process";
import fs from "node:fs";

const SAFE_PATH = "/usr/bin:/bin:/usr/local/bin";

export function sandboxEnv(workspace, extra = {}) {
  return {
    PATH: SAFE_PATH,
    HOME: workspace,
    LANG: "C",
    LC_ALL: "C",
    TERM: "dumb",
    LAR_SANDBOX: "subprocess",
    ...extra,
  };
}

export function runSubprocess(opts) {
  const cwd = opts.cwd;
  const command = opts.command;
  const args = opts.args || [];
  const network = !!opts.network;
  const timeoutMs = opts.timeoutMs || 15000;
  const env = opts.env;
  return new Promise((resolve) => {
    const wrapped = wrapNetwork(command, args, network);
    const child = spawn(wrapped.command, wrapped.args, {
      cwd,
      env: sandboxEnv(cwd, env),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (b) => { stdout += b.toString(); });
    child.stderr.on("data", (b) => { stderr += b.toString(); });
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({
        exitCode: code,
        signal,
        stdout: stdout.slice(0, 8000),
        stderr: stderr.slice(0, 8000),
        command: wrapped.command,
        args: wrapped.args,
        networkWrapped: wrapped.wrapped,
      });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        exitCode: 127,
        stdout: "",
        stderr: String(err.message || err),
        command: wrapped.command,
        args: wrapped.args,
        networkWrapped: wrapped.wrapped,
      });
    });
  });
}

function wrapNetwork(command, args, network) {
  if (network) return { command, args, wrapped: false };
  if (!fs.existsSync("/usr/bin/unshare")) {
    return { command, args, wrapped: false };
  }
  const dash = String.fromCharCode(45, 45);
  const flags = ["user", "map-root-user", "net", "fork"].map((f) => dash + f);
  return {
    command: "unshare",
    args: flags.concat([command], args),
    wrapped: true,
  };
}
