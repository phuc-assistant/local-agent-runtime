export const STUB_BROKEN_SUM_PATH = "fixtures/broken-sum.js";

export const STUB_FIXED_SUM_SOURCE = `// Corrected by the stub provider (offline mock, not a model).
export function sum(a, b) {
  return Number(a) + Number(b);
}

export function sumAll(xs) {
  let total = 0;
  for (const n of xs) total += Number(n);
  return total;
}
`;

export function createStubProvider() {
  return {
    id: "stub",
    model: "stub-echo",
    async complete({ messages }) {
      const userText = lastUserText(messages);
      const toolNames = assistantToolNames(messages);
      const toolResults = messages.filter((m) => m.role === "tool");
      const summary = toolResults.map((m) => m.content).join("\n").slice(0, 2000);

      if (shouldFixBrokenSum(userText)) {
        if (!toolNames.includes("read_file")) {
          return toolCall("call_read_broken_sum", "read_file", { path: STUB_BROKEN_SUM_PATH });
        }
        if (!toolNames.includes("write_file")) {
          return toolCall("call_write_fixed_sum", "write_file", {
            path: STUB_BROKEN_SUM_PATH,
            content: STUB_FIXED_SUM_SOURCE,
          });
        }
        return {
          role: "assistant",
          content: "Fixed broken-sum.js (stub provider, offline mock, not a model).\n" + summary,
        };
      }

      if (shouldWriteHello(userText)) {
        if (toolResults.length === 0 && !toolNames.includes("write_file")) {
          return toolCall("call_hello_txt", "write_file", {
            path: "hello.txt",
            content: "Hello, world\n",
          });
        }
        return {
          role: "assistant",
          content: "Hello-world complete (stub provider, offline, no API key).\n" + summary,
        };
      }

      if (toolResults.length > 0) {
        return {
          role: "assistant",
          content: "Hello-world complete (stub provider, offline, no API key).\n" + summary,
        };
      }

      return {
        role: "assistant",
        content: "stub-echo: " + userText + "\n(offline mock provider; no API key used)",
      };
    },
  };
}

function toolCall(id, name, args) {
  return {
    role: "assistant",
    content: "",
    tool_calls: [{
      id,
      type: "function",
      function: {
        name,
        arguments: JSON.stringify(args),
      },
    }],
  };
}

function lastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return String(messages[i].content || "");
  }
  return "";
}

function assistantToolNames(messages) {
  const names = [];
  for (const m of messages) {
    if (m.role !== "assistant" || !Array.isArray(m.tool_calls)) continue;
    for (const call of m.tool_calls) {
      const name = call.function && call.function.name;
      if (name) names.push(name);
    }
  }
  return names;
}

function shouldWriteHello(text) {
  const t = String(text).toLowerCase();
  return t.includes("hello") || t.includes("hello-world") || t.includes("hello world");
}

function shouldFixBrokenSum(text) {
  const t = String(text).toLowerCase();
  if (t.includes("broken-sum") || t.includes("broken_sum")) return true;
  return t.includes("fix") && t.includes("broken") && t.includes("sum");
}
