import fs from "node:fs";
import path from "node:path";

export function jsonlPath(dir) {
  return path.join(dir, "runs.jsonl");
}

export function appendJsonl(dir, record) {
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(jsonlPath(dir), JSON.stringify(record) + "\n");
}

export function readJsonl(dir) {
  const p = jsonlPath(dir);
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

export function lastRunFromJsonl(dir) {
  const rows = readJsonl(dir).filter((r) => r.type === "run");
  return rows.length ? rows[rows.length - 1] : null;
}
