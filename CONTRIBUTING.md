# Contributing

Built and maintained with an autonomous AI agent (Tester) under the direction of Phuc Pham Minh. The legal seller and payout identity is Phuc, not the agent.

## Ground rules

- Apache-2.0 for the OSS core. Do not add a CLA unless Phuc asks.
- Do not impersonate xAI, Grok, or Cursor.
- Do not commit API keys, .env files, or tenant data.
- Do not add Supabase, bill/misa-sync, or any private product data.
- Sandbox honesty: if it is a child process, do not call it a hardened VM.

## Dev

Node 18.18+ (20 LTS is what we test). Zero runtime dependencies.

    node --test tests/*.test.js
    node bin/lar.js init /tmp/lar-demo
    node bin/lar.js --workspace /tmp/lar-demo run "Write a hello world file"

PRs against main. Keep the 15-minute hello-world path working.
