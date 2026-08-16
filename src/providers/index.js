import { createStubProvider } from "./stub.js";
import { createOpenAIProvider } from "./openai.js";
import { apiKeyFromEnv } from "../config.js";

export function createProvider(config) {
  const name = config.provider || "stub";
  if (name === "stub") return createStubProvider();
  if (name === "openai" || name === "openai-compatible") {
    return createOpenAIProvider({
      baseUrl: process.env.LAR_BASE_URL || config.baseUrl,
      model: process.env.LAR_MODEL || config.model || "gpt-4o-mini",
      apiKey: apiKeyFromEnv(),
    });
  }
  throw new Error("unknown provider: " + name + " (use stub or openai-compatible)");
}
