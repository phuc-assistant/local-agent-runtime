export function createStubProvider() {
  return {
    id: "stub",
    model: "stub-echo",
    async complete({ messages }) {
      const toolResults = messages.filter((m) => m.role === "tool");
      if (toolResults.length > 0) {
        const summary = toolResults.map((m) => m.content).join("\n").slice(0, 2000);
        return {
          role: "assistant",
          content: "Hello-world complete (stub provider, offline, no API key).\n" + summary,
        };
      }
      const userText = lastUserText(messages);
      if (shouldWriteHello(userText)) {
        return {
          role: "assistant",
          content: "",
          tool_calls: [{
            id: "call_hello_txt",
            type: "function",
            function: {
              name: "write_file",
              arguments: JSON.stringify({ path: "hello.txt", content: "Hello, world\n" }),
            },
          }],
        };
      }
      return {
        role: "assistant",
        content: "stub-echo: " + userText + "\n(offline mock provider; no API key used)",
      };
    },
  };
}

function lastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return String(messages[i].content || "");
  }
  return "";
}

function shouldWriteHello(text) {
  const t = String(text).toLowerCase();
  return t.includes("hello") || t.includes("hello-world") || t.includes("hello world");
}
