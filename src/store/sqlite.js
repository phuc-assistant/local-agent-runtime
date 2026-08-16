import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function sqlitePath(dir) { return path.join(dir, "runs.sqlite"); }
export function sqlDumpPath(dir) { return path.join(dir, "runs.sql"); }

function sqlQuote(value) {
  if (value == null) return "NULL";
  const q = String.fromCharCode(39);
  return q + String(value).split(q).join(q + q) + q;
}

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS Run (",
  "  id TEXT PRIMARY KEY,",
  "  prompt TEXT NOT NULL,",
  "  status TEXT NOT NULL,",
  "  provider TEXT NOT NULL,",
  "  model TEXT,",
  "  sandbox TEXT NOT NULL,",
  "  network INTEGER NOT NULL DEFAULT 0,",
  "  startedAt TEXT NOT NULL,",
  "  endedAt TEXT,",
  "  result TEXT",
  ");",
].join("\n");

const EVENT_SCHEMA = [
  "CREATE TABLE IF NOT EXISTS Event (",
  "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "  runId TEXT NOT NULL,",
  "  type TEXT NOT NULL,",
  "  payload TEXT NOT NULL,",
  "  createdAt TEXT NOT NULL",
  ");",
].join("\n");

function whichSqlite() {
  try {
    const r = spawnSync("which", ["sqlite3"], { encoding: "utf8" });
    if (r.status === 0) return r.stdout.trim();
  } catch {}
  return null;
}

function insertSql(run) {
  return "INSERT INTO Run (id, prompt, status, provider, model, sandbox, network, startedAt, endedAt, result) VALUES (" +
    [run.id, run.prompt, run.status, run.provider, run.model, run.sandbox, run.network ? 1 : 0, run.startedAt, run.endedAt, run.final]
      .map(sqlQuote).join(", ") + ");";
}

export function appendSqlite(dir, run) {
  fs.mkdirSync(dir, { recursive: true });
  const insert = insertSql(run);
  const dump = sqlDumpPath(dir);
  if (!fs.existsSync(dump)) {
    fs.writeFileSync(dump, SCHEMA + "\n" + EVENT_SCHEMA + "\n");
  }
  fs.appendFileSync(dump, insert + "\n");
  const bin = whichSqlite();
  if (!bin) return { mode: "sql-dump" };
  const db = sqlitePath(dir);
  spawnSync(bin, [db, SCHEMA], { encoding: "utf8" });
  spawnSync(bin, [db, EVENT_SCHEMA], { encoding: "utf8" });
  spawnSync(bin, [db, insert], { encoding: "utf8" });
  return { mode: "sqlite3" };
}

export function lastRunFromSqlite(dir) {
  const dump = sqlDumpPath(dir);
  if (!fs.existsSync(dump)) return null;
  const lines = fs.readFileSync(dump, "utf8").split("\n").filter((l) => l.startsWith("INSERT INTO Run"));
  if (!lines.length) return null;
  return { type: "run", source: "sql-dump", sql: lines[lines.length - 1] };
}
