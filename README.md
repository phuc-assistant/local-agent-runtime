# local-agent-runtime

Built and maintained with an autonomous AI agent (Tester) under the direction of Phuc Pham Minh. The legal seller and payout identity is Phuc, not the agent.

Do not send money to the bot. Polar checkout is **not live**. There is nothing to buy today.

## What v0.1 actually is

v0.1 is an OSS CLI + sandbox loop + stub and openai-compatible providers. Independent project; it does not impersonate xAI, Grok, or Cursor.

- **Stub provider:** an offline mock, **not a model**. It matches a few demo prompts (hello-world; fix the broken sum) and otherwise echoes. No API key. No weights. No inference.
- **openai-compatible adapter:** POSTs to `{baseUrl}/chat/completions` when you set a key. Not bundled with a hosted model.
- **Sandbox:** still **not a VM**. Default `subprocess` is cwd confinement. Optional Docker is a container, not Firecracker, gVisor, or a dedicated VM.
- **Pro extras are not built yet.** Avatar pack, private extras repo, and Convex control plane do not exist in this repo or as a download. Polar checkout is not live. Planned prices ($19 one-time / $9/month) are copy only; customers cannot buy those today. See [docs/polar.md](docs/polar.md). KYC, bank payout, and tax are human-only.

Sample hello-world (stub provider, no API key):

    running in /tmp/lar-demo
    run:      16a488d0-f43d-4c70-8c6b-b5e9187b2509
    status:   completed
    provider: stub
    sandbox:  subprocess
    tools:    write_file
    result:
    Hello-world complete (stub provider, offline, no API key).
    {"path":"hello.txt","bytes":13}

    Hello, world

Second stub path (still a mock, not a model): copy `fixtures/broken-sum.js` into the workspace, then `lar run "fix the broken sum"`. The loop **read_file** then **write_file**s a correct `sum`. Hello-world still works.

## Honest sandbox language

v0.1 is **not a hardened VM**. Do not market the subprocess path as a VM.

- Default `subprocess` mode is a Node.js child process with a strict workspace cwd, path-escape checks, network off by default, and optional Linux `unshare --net` when `/usr/bin/unshare` exists. A child process is not a microVM. On many hosts user-namespace net isolation does nothing. Treat it as cwd confinement.
- Optional `docker` mode uses `docker run --network=none` plus a bind mount when Docker is installed. A container is still not Firecracker, gVisor, or a dedicated VM.
- `auto` uses Docker when `docker info` succeeds, otherwise subprocess.
- File tools stay inside the workspace via path checks. `run_shell` is disabled unless `allowShell` is true. Do not enable it for untrusted prompts.

Details: [SECURITY.md](SECURITY.md).

## 15-minute quickstart (Linux, Node 18.18+)

No registry install. No API key. Zero runtime dependencies.

    git clone https://github.com/phuc-assistant/local-agent-runtime.git
    cd local-agent-runtime
    node --test tests/*.test.js
    node bin/lar.js init ./demo
    node bin/lar.js run --workspace ./demo --sandbox subprocess "Write a hello world file"
    node bin/lar.js status --workspace ./demo
    cat ./demo/hello.txt

Expected: `hello.txt` contains `Hello, world`, status `completed`, provider `stub`. The stub writes that file when the prompt looks like hello-world; other prompts echo offline unless they match the broken-sum demo.

Second path (optional):

    mkdir -p ./demo/fixtures
    cp fixtures/broken-sum.js ./demo/fixtures/broken-sum.js
    node bin/lar.js run --workspace ./demo --sandbox subprocess "fix the broken sum"

Expected: tools `read_file, write_file`; `fixtures/broken-sum.js` then exports `sum(2, 3) === 5`. The stub is still an offline mock.

Tests include a local mock OpenAI-compatible HTTP server (no API keys, no paid APIs). Docker is optional; when it is missing, `auto` uses subprocess. That is cwd confinement, not a VM.

Later: set `provider` to `openai-compatible` in `.lar/config.json` and export `LAR_API_KEY` (or `OPENAI_API_KEY`). Keys stay in the environment. Never commit them.

## Commands

| Command | What it does |
| --- | --- |
| `lar init [dir]` | Workspace plus `.lar/config.json` |
| `lar run "<prompt>"` | Sandboxed agent loop |
| `lar status` | Last run from JSONL (or SQL dump) |
| `lar help` | Usage |

Flags: `--workspace <dir>`, `--sandbox auto|docker|subprocess`, `--version`.

## Architecture

    CLI (init / run / status)
      -> provider (stub | openai-compatible base URL)
      -> agent loop (write_file, read_file, list_files, run_shell)
      -> sandbox (Docker if present, else subprocess)
      -> store (JSONL default, SQL dump, sqlite3 CLI if installed)

- `bin/lar.js` to `src/cli.js`
- Stub provider is an offline mock so hello-world and the broken-sum fixture work without keys. It is not a model.
- OpenAI-compatible adapter POSTs to `{baseUrl}/chat/completions`. Keys from `LAR_API_KEY` or `OPENAI_API_KEY` only
- Run log: `.lar/runs.jsonl`. Optional SQL from `schema/local.sql`. Not Prisma Cloud. Not Supabase.

## Free vs planned Pro

Apache-2.0 in this repo: CLI, sandbox runner, provider-agnostic loop, local run-log schema, demo fixtures, docs.

Planned Pro (Polar, **checkout not live**, **extras not built**): license key, commercial grant, avatar pack, private extras repo, future Convex control plane. Those files and benefits do not exist yet. Prices on [docs/polar.md](docs/polar.md) are draft copy, not an offer.

## Funding

Do not send money to the bot. Do not use GitHub Sponsors on `phuc-assistant`. Polar later, after the human completes org plus Stripe Express (Vietnam / VND). See `.github/FUNDING.yml`.

## License

Apache-2.0. Copyright 2026 Phuc Pham Minh. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

[CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [docs/polar.md](docs/polar.md)
