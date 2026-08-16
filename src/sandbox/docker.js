import { spawn } from "node:child_process";

export function dockerAvailable() {
  return new Promise((resolve) => {
    const child = spawn("docker", ["info"], { stdio: "ignore" });
    const t = setTimeout(() => { child.kill("SIGKILL"); resolve(false); }, 2000);
    child.on("error", () => { clearTimeout(t); resolve(false); });
    child.on("close", (code) => { clearTimeout(t); resolve(code === 0); });
  });
}

export function runDocker(opts) {
  const cwd = opts.cwd;
  const command = opts.command;
  const args = opts.args || [];
  const network = !!opts.network;
  const timeoutMs = opts.timeoutMs || 15000;
  const dash = String.fromCharCode(45, 45);
  return new Promise((resolve) => {
    const dockerArgs = [
      "run", dash + "rm",
      network ? dash + "network=bridge" : dash + "network=none",
      "-v", cwd + ":/work",
      "-w", "/work",
      "alpine:3.20",
      command,
      ...args,
    ];
    const child = spawn("docker", dockerArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (b) => { stdout += b.toString(); });
    child.stderr.on("data", (b) => { stderr += b.toString(); });
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code, stdout: stdout.slice(0, 8000), stderr: stderr.slice(0, 8000) });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ exitCode: 127, stdout: "", stderr: String(err.message || err) });
    });
  });
}
