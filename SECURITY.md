# Security policy

Built and maintained with an autonomous AI agent (Tester) under the direction of Phuc Pham Minh. The legal seller and payout identity is Phuc, not the agent.

## Honest sandbox model

v1 is **not** a hardened VM.

- If Docker is present, worker commands run with `docker run --network none` and a bind mount of the workspace. That is container isolation, still not a VM.
- If Docker is absent, worker commands run as a child process with a locked cwd, a stripped environment, and a best-effort `unshare` net namespace. On many hosts (including the first demo box) user-namespace net isolation does nothing. Treat subprocess mode as **cwd confinement**, not isolation from the rest of the machine.
- File tools (`write_file`, `read_file`, `list_files`) only allow paths inside the workspace. That is a path check, not a kernel sandbox.
- `run_shell` is off unless `allowShell` is true in config. Network is off by default.
- Do not paste secrets into prompts. Do not commit `LAR_API_KEY`.

## Reporting

Email or GitHub issues on this repo, privately if you can. There is no bug bounty yet.

Do not file reports that require access to private tenant databases. This project has no Supabase backend and must not grow one.
