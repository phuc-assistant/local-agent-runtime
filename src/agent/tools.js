import { writeFileSandboxed, readFileSandboxed, listFilesSandboxed, runCommandSandboxed } from "../sandbox/index.js";

export const TOOL_DEFS = [
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Write a UTF-8 file relative to the workspace. Paths cannot escape the workspace.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" }, content: { type: "string" } },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a UTF-8 file relative to the workspace.",
      parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files in a workspace directory.",
      parameters: { type: "object", properties: { path: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "run_shell",
      description: "Run a bare command in the sandbox. Disabled unless allowShell is true.",
      parameters: {
        type: "object",
        properties: { argv: { type: "array", items: { type: "string" } } },
        required: ["argv"],
      },
    },
  },
];

export async function executeTool(name, args, ctx) {
  if (name === "write_file") return writeFileSandboxed(ctx.workspace, args.path, args.content);
  if (name === "read_file") return { path: args.path, content: readFileSandboxed(ctx.workspace, args.path) };
  if (name === "list_files") return { path: args.path || ".", entries: listFilesSandboxed(ctx.workspace, args.path || ".") };
  if (name === "run_shell") {
    return runCommandSandboxed(ctx.workspace, args.argv, {
      sandbox: ctx.sandbox,
      network: ctx.network,
      timeoutMs: ctx.timeoutMs || 15000,
      allowShell: ctx.allowShell,
    });
  }
  throw new Error("unknown tool: " + name);
}

export function parseArgs(raw) {
  if (raw == null || raw === "") return {};
  if (typeof raw === "object") return raw;
  return JSON.parse(raw);
}
