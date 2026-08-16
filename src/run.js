import { randomUUID } from "node:crypto";
import { loadConfig } from "./config.js";
import { createProvider } from "./providers/index.js";
import { selectSandbox } from "./sandbox/index.js";
import { runAgentLoop } from "./agent/loop.js";
import { recordRun, recordEvent } from "./store/index.js";

export async function runPrompt(workspace, prompt, options = {}) {
  if (!prompt || !String(prompt).trim()) throw new Error("run requires a prompt");
  const config = loadConfig(workspace);
  const sandbox = await selectSandbox(options.sandbox || config.sandbox);
  const provider = createProvider(config);
  const id = randomUUID();
  const startedAt = new Date().toISOString();
  const result = await runAgentLoop({
    prompt: String(prompt),
    provider,
    workspace,
    sandbox,
    config,
    onEvent: (ev) => {
      recordEvent(workspace, { runId: id, ...ev, at: new Date().toISOString() });
    },
  });
  const run = {
    id, prompt: String(prompt), status: result.status,
    provider: provider.id, model: provider.model, sandbox,
    network: !!config.network, startedAt, endedAt: new Date().toISOString(),
    final: result.final, steps: result.steps,
  };
  recordRun(workspace, run);
  return run;
}
