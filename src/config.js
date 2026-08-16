import fs from "node:fs";
import path from "node:path";
import { CONFIG_DIR, CONFIG_FILE, defaultConfig } from "./paths.js";

export function configDir(workspace) {
  return path.join(workspace, CONFIG_DIR);
}

export function configPath(workspace) {
  return path.join(configDir(workspace), CONFIG_FILE);
}

export function loadConfig(workspace) {
  const p = configPath(workspace);
  if (!fs.existsSync(p)) {
    throw new Error("no workspace config at " + p + " (run: lar init)");
  }
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  return { ...defaultConfig(), ...raw };
}

export function saveConfig(workspace, config) {
  const dir = configDir(workspace);
  fs.mkdirSync(dir, { recursive: true });
  const merged = { ...defaultConfig(), ...config };
  fs.writeFileSync(configPath(workspace), JSON.stringify(merged, null, 2) + "\n");
  return merged;
}

export function apiKeyFromEnv() {
  return process.env.LAR_API_KEY || process.env.OPENAI_API_KEY || "";
}
