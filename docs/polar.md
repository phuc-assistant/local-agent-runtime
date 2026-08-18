# Polar products (draft — checkout not live — extras not built)

Built and maintained with an autonomous AI agent (Tester) under the direction of Phuc Pham Minh. The legal seller and payout identity is Phuc, not the agent.

**Do not send money to the bot.** Polar org creation, Stripe Express KYC, bank payout, and tax filing are human-only. Tester does not click through identity checks.

Vietnam is listed for Polar merchant-of-record / Stripe Connect Express. That is why Polar is the intended checkout. Gumroad is the documented fallback if Express rejects Vietnam after the human tries.

## Status (honest)

- Checkout URL: **not live**. Customers cannot buy Pro today. There is no offer.
- Polar organization: not created (blocked on H1)
- Stripe Express / VN bank: not connected (blocked on H1)
- GitHub org for private extras: not created (blocked on H2)
- Tax / MST note: human + accountant (blocked on H3)
- **Avatar pack: not built.** No files, no zip, no Polar benefit, no download.
- **Private extras repository: not created.** Nothing to invite buyers into.
- **Convex control plane: not built.** Not a v0.1 feature and not a purchasable add-on today.

v0.1 in the public repo is an OSS CLI + sandbox loop + stub (offline mock, not a model) and openai-compatible providers. The sandbox is still not a VM. Do not imply that paying $19 (or $9/month) would deliver avatars, a private extras repo, or a Convex plane — those products do not exist yet.

## Planned Pro — 19 USD one-time (not for sale)

Draft copy only. Not an offer. Not wired to Polar.

Intended later, **after the extras exist and checkout is live**:

- License key, 3 activations
- Commercial license for the Pro extras
- Avatar pack (animated bot avatars for the local runtime) — **not built**
- Access to paid Polar benefits once checkout exists

OSS Apache-2.0 core (this repo) stays free. The one-time SKU is a plan for people who would want a commercial grant plus an avatar pack without a subscription. None of that can be purchased today.

## Planned Pro — 9 USD per month (not for sale)

Draft copy only. Not an offer.

Intended later, **after the extras exist and checkout is live**:

- Everything in the one-time SKU
- Private extras repository (needs a GitHub org; Polar does not support personal repos by default) — **not created**
- Future Convex control plane (job/license plane). Not shipping in v0.1. **Not built.**

Hosted multi-seat / team queue is later SaaS on Convex plus Polar, not this CLI.

## Dual license (current vs planned)

- CLI + sandbox runner + provider-agnostic loop + docs + demo fixtures: Apache-2.0 (this repo, available now)
- Local run-log schema: Apache-2.0 (same repo)
- Planned Pro extras (license key, commercial use, avatar pack, private repo, Convex plane): **not built; Polar checkout not live; do not collect money**

## Human checklist (do not impersonate)

1. Polar org in Phuc Pham Minh name, country Vietnam, connect VN/VND bank, complete Stripe Express
2. GitHub org for Polar private-repo benefit
3. MST / accountant note for foreign-platform income. The agent does not file taxes.
4. Confirm phuc-assistant is a human-created machine account under GitHub ToS B.3
5. Public JS registry account owned by the human before any publish.
6. **Build the extras before listing them.** Do not sell an avatar pack or private repo that does not exist.

When checkout exists **and** the extras exist, replace the placeholder in README and .github/FUNDING.yml with the live Polar URL. Until then, do not collect money and do not describe Pro as purchasable.

## Sources

- https://polar.sh/docs/merchant-of-record/supported-countries
- https://polar.sh/docs/features/finance/accounts
- https://polar.sh/docs/features/benefits/license-keys
- https://polar.sh/docs/features/benefits/github-access
- https://polar.sh/legal/acceptable-use-policy
- https://www.convex.dev/components/polar
