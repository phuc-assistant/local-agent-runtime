export function createOpenAIProvider(opts) {
  const baseUrl = opts.baseUrl;
  const model = opts.model;
  const apiKey = opts.apiKey;
  if (!baseUrl) throw new Error("openai-compatible provider requires baseUrl");
  return {
    id: "openai-compatible",
    model,
    async complete({ messages, tools }) {
      if (!apiKey) {
        throw new Error("missing API key: set LAR_API_KEY or OPENAI_API_KEY in the environment; keys are never stored in the repo");
      }
      const root = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const url = root + "/chat/completions";
      const res = await fetch(url, {
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
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error("provider HTTP " + res.status + ": " + body.slice(0, 500));
      }
      const json = await res.json();
      const choice = json.choices && json.choices[0] && json.choices[0].message;
      if (!choice) throw new Error("provider returned no message");
      return {
        role: "assistant",
        content: choice.content || "",
        tool_calls: choice.tool_calls,
      };
    },
  };
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
