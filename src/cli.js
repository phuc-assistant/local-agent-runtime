import fs from "node:fs";
import path from "node:path";
import { initWorkspace } from "./init.js";
import { runPrompt } from "./run.js";
import { getStatus, formatStatus } from "./status.js";
import { resolveWorkspace } from "./paths.js";

const HELP = [
  "local-agent-runtime — open-core local agent CLI",
  "",
  "Usage:",
  "  lar init [dir]              Create a workspace and config",
  "  lar run <prompt>          Run a sandboxed agent loop",
  "  lar status                  Show the last run",
  "  lar help                    Show this help",
  "",
  "Options:",
  "  --workspace <dir>           Workspace root (cwd or nearest .lar)",
  "  --sandbox auto|docker|subprocess",
  "  --version",
  "",
  "Offline by default (stub provider). Set provider to openai-compatible",
  "and LAR_API_KEY in the environment for a remote or local server.",
  "Do not put API keys in git.",
  "",
  "This is not a hardened VM when the sandbox is a child process.",
].join("\n") + "\n";

export async function main(argv) {
  const parsed = parseArgv(argv);
  const cmd = parsed.cmd;
  const args = parsed.args;
  const flags = parsed.flags;
  if (!cmd || cmd === "help" || flags.help) {
    process.stdout.write(HELP);
    return 0;
  }
  if (cmd === "version" || flags.version) {
    process.stdout.write(readVersion() + "\n");
    return 0;
  }
  if (cmd === "init") {
    const dir = args[0] || flags.workspace || process.cwd();
    const result = initWorkspace(dir);
    process.stdout.write([
      result.created ? "Initialized workspace" : "Reused workspace",
      "workspace: " + result.workspace,
      "config:    " + path.join(result.workspace, ".lar", "config.json"),
      "provider:  " + result.config.provider,
      "sandbox:   " + result.config.sandbox + " (resolved at run time)",
      "network:   " + (result.config.network ? "on" : "off (default)"),
      "",
      "Next: lar run Write a hello world file",
      "",
    ].join("\n"));
    return 0;
  }
  const workspace = resolveWorkspaceDir(flags.workspace);
  if (cmd === "run") {
    const prompt = args.join(" ").trim();
    if (!prompt) throw Object.assign(new Error("lar run requires a prompt"), { exitCode: 2 });
    process.stdout.write("running in " + workspace + "\n");
    const run = await runPrompt(workspace, prompt, { sandbox: flags.sandbox });
    process.stdout.write(formatRun(run) + "\n");
    return run.status === "completed" ? 0 : 1;
  }
  if (cmd === "status") {
    process.stdout.write(formatStatus(getStatus(workspace)) + "\n");
    return 0;
  }
  throw Object.assign(new Error("unknown command: " + cmd + "\n" + HELP), { exitCode: 2 });
}

function formatRun(run) {
  const lines = [
    "run:      " + run.id,
    "status:   " + run.status,
    "provider: " + run.provider,
    "sandbox:  " + run.sandbox,
    "result:",
    String(run.final || "").trim(),
  ];
  if (run.steps && run.steps.length) {
    lines.splice(4, 0, "tools:    " + run.steps.map((s) => s.tool + (s.ok ? "" : "!")).join(", "));
  }
  return lines.join("\n");
}

function resolveWorkspaceDir(flag) {
  if (flag) return path.resolve(flag);
  const found = resolveWorkspace(process.cwd());
  if (found) return found;
  throw Object.assign(new Error("no workspace (run lar init)"), { exitCode: 2 });
}

function parseArgv(argv) {
  const args = [];
  const flags = {};
  let cmd = null;
  const dash = String.fromCharCode(45, 45);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === dash + "help" || a === "-h") flags.help = true;
    else if (a === dash + "version" || a === "-V") flags.version = true;
    else if (a === dash + "workspace" || a === "-w") flags.workspace = argv[++i];
    else if (a === dash + "sandbox") flags.sandbox = argv[++i];
    else if (a.startsWith(dash)) flags[a.slice(2)] = true;
    else if (!cmd) cmd = a;
    else args.push(a);
  }
  return { cmd, args, flags };
}

function readVersion() {
  try {
    const here = new URL("../package.json", import.meta.url);
    const pkg = JSON.parse(fs.readFileSync(here, "utf8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.1.0";
  }
}
