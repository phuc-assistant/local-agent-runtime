import path from "node:path";
import { CONFIG_DIR } from "../paths.js";
import { appendJsonl, lastRunFromJsonl, readJsonl } from "./jsonl.js";
import { appendSqlite, lastRunFromSqlite } from "./sqlite.js";

export function storeDir(workspace) {
  return path.join(workspace, CONFIG_DIR);
}

export function recordRun(workspace, run) {
  const dir = storeDir(workspace);
  appendJsonl(dir, { type: "run", ...run });
  appendSqlite(dir, run);
}

export function recordEvent(workspace, event) {
  appendJsonl(storeDir(workspace), { type: "event", ...event });
}

export function lastRun(workspace) {
  return lastRunFromJsonl(storeDir(workspace)) || lastRunFromSqlite(storeDir(workspace));
}

export function history(workspace) {
  return readJsonl(storeDir(workspace));
}
