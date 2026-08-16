import { lastRun, history } from "./store/index.js";

export function getStatus(workspace) {
  const run = lastRun(workspace);
  if (!run) return { ok: false, message: "no runs yet" };
  const events = history(workspace).filter((r) => r.type === "event" && r.runId === run.id);
  return { ok: true, run, events };
}

export function formatStatus(status) {
  if (!status.ok) return status.message;
  const r = status.run;
  const lines = [
    "run:      " + r.id,
    "status:   " + r.status,
    "provider: " + r.provider + (r.model ? " (" + r.model + ")" : ""),
    "sandbox:  " + r.sandbox + (r.network ? " network=on" : " network=off"),
    "started:  " + r.startedAt,
    "ended:    " + r.endedAt,
    "prompt:   " + String(r.prompt || "").slice(0, 200),
    "result:   " + String(r.final || "").slice(0, 500),
  ];
  if (Array.isArray(r.steps) && r.steps.length) {
    lines.push("steps:");
    for (const s of r.steps) lines.push("  - " + (s.ok ? "ok" : "fail") + " " + s.tool);
  }
  return lines.join("\n");
}
