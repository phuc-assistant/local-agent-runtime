import { executeTool, parseArgs, TOOL_DEFS } from "./tools.js";

export async function runAgentLoop(opts) {
  const prompt = opts.prompt;
  const provider = opts.provider;
  const workspace = opts.workspace;
  const sandbox = opts.sandbox;
  const config = opts.config;
  const emit = opts.onEvent || (() => {});
  const messages = [
    { role: "system", content: "You are a local coding agent. Use tools to work inside the workspace. Stay in the sandbox. Do not ask for API keys." },
    { role: "user", content: prompt },
  ];
  const maxSteps = Number(config.maxSteps || 8);
  const steps = [];
  for (let i = 0; i < maxSteps; i++) {
    const reply = await provider.complete({ messages, tools: TOOL_DEFS });
    messages.push(reply);
    emit({ type: "assistant", step: i + 1, content: reply.content || "", tool_calls: reply.tool_calls || [] });
    const calls = reply.tool_calls || [];
    if (!calls.length) {
      return { messages, steps, final: reply.content || "", status: "completed" };
    }
    for (const call of calls) {
      const name = call.function && call.function.name;
      let args;
      try {
        args = parseArgs(call.function && call.function.arguments);
      } catch (err) {
        const payload = { error: "invalid tool arguments: " + err.message };
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(payload) });
        steps.push({ tool: name, ok: false, result: payload });
        emit({ type: "tool", tool: name, ok: false, result: payload });
        continue;
      }
      try {
        const result = await executeTool(name, args, {
          workspace, sandbox, network: !!config.network, allowShell: !!config.allowShell,
        });
        steps.push({ tool: name, ok: true, result });
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
        emit({ type: "tool", tool: name, ok: true, result });
      } catch (err) {
        const payload = { error: err.message };
        steps.push({ tool: name, ok: false, result: payload });
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(payload) });
        emit({ type: "tool", tool: name, ok: false, result: payload });
      }
    }
  }
  return { messages, steps, final: "maxSteps reached", status: "max_steps" };
}
