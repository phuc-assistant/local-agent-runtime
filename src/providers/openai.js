export function createOpenAIProvider(opts) {
  const baseUrl = opts.baseUrl;
  const model = opts.model;
  const apiKey = opts.apiKey;
  const timeoutMs = Number(opts.timeoutMs || 60000);
  if (!baseUrl) throw new Error("openai-compatible provider requires baseUrl");
  return {
    id: "openai-compatible",
    model,
    async complete({ messages, tools }) {
      if (!apiKey) {
        throw new Error("missing API key: set LAR_API_KEY or OPENAI_API_KEY in the environment; keys are never stored in the repo");
      }
      const url = baseUrl.replace(/\/$/, "") + "/chat/completions";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let res;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "Bearer " + apiKey,
          },
          body: JSON.stringify({
            model,
            messages: toOpenAIMessages(messages),
            tools: tools && tools.length ? tools : undefined,
          }),
          signal: controller.signal,
        });
      } catch (err) {
        if (err && err.name === "AbortError") {
          throw new Error("provider timed out after " + timeoutMs + "ms: " + url);
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) {
        const body = await res.text();
        throw new Error("provider HTTP " + res.status + ": " + body.slice(0, 500));
      }
      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error("provider returned non-JSON body from " + url);
      }
      const choice = json.choices && json.choices[0] && json.choices[0].message;
      if (!choice) throw new Error("provider returned no message");
      return {
        role: "assistant",
        content: choice.content || "",
        tool_calls: normalizeToolCalls(choice.tool_calls),
      };
    },
  };
}

function normalizeToolCalls(calls) {
  if (!calls || !calls.length) return undefined;
  return calls.map((c) => {
    const fn = (c && c.function) || {};
    const rawArgs = fn.arguments;
    const argumentsJson = typeof rawArgs === "string" ? rawArgs : JSON.stringify(rawArgs || {});
    return {
      id: c.id,
      type: c.type || "function",
      function: { name: fn.name, arguments: argumentsJson },
    };
  });
}

function toOpenAIMessages(messages) {
  return messages.map((m) => {
    if (m.role === "tool") {
      return { role: "tool", tool_call_id: m.tool_call_id, content: m.content };
    }
    const out = { role: m.role, content: m.content || "" };
    if (m.tool_calls) out.tool_calls = m.tool_calls;
    return out;
  });
}
