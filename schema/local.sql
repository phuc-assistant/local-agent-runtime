-- Prisma-equivalent local schema for on-device run history (Apache-2.0).
-- JSONL is the default store. This SQL is mirrored to .lar/runs.sql
-- and applied to .lar/runs.sqlite when the sqlite3 CLI is installed.

CREATE TABLE IF NOT EXISTS Run (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  sandbox TEXT NOT NULL,
  network INTEGER NOT NULL DEFAULT 0,
  startedAt TEXT NOT NULL,
  endedAt TEXT,
  result TEXT
);

CREATE TABLE IF NOT EXISTS Event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  runId TEXT NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (runId) REFERENCES Run(id)
);
