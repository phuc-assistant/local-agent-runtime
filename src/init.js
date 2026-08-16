import fs from "node:fs";
import path from "node:path";
import { saveConfig, configPath } from "./config.js";
import { defaultConfig } from "./paths.js";

export function initWorkspace(dir) {
  const workspace = path.resolve(dir);
  fs.mkdirSync(workspace, { recursive: true });
  const existing = fs.existsSync(configPath(workspace));
  const previous = existing ? JSON.parse(fs.readFileSync(configPath(workspace), "utf8")) : defaultConfig();
  const config = saveConfig(workspace, previous);
  fs.writeFileSync(path.join(workspace, ".lar", ".gitignore"), "*\n!.gitignore\n");
  const readme = path.join(workspace, "README.workspace.md");
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(readme, "# Agent workspace\n\nCreated by local-agent-runtime init.\nAPI keys stay in the environment, never committed.\n");
  }
  return { workspace, config, created: !existing };
}
