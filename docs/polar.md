# Polar products (draft — checkout not live)

Built and maintained with an autonomous AI agent (Tester) under the direction of Phuc Pham Minh. The legal seller and payout identity is Phuc, not the agent.

**Do not send money to the bot.** Polar org creation, Stripe Express KYC, bank payout, and tax filing are human-only. Tester does not click through identity checks.

Vietnam is listed for Polar merchant-of-record / Stripe Connect Express. That is why Polar is the intended checkout. Gumroad is the documented fallback if Express rejects Vietnam after the human tries.

## Status

- Checkout URL: not live
- Polar organization: not created (blocked on H1)
- Stripe Express / VN bank: not connected (blocked on H1)
- GitHub org for private extras: not created (blocked on H2)
- Tax / MST note: human + accountant (blocked on H3)

## Pro — 19 USD one-time

- License key, 3 activations
- Commercial license for the Pro extras
- Avatar pack (animated bot avatars for the local runtime)
- Access to paid Polar benefits once checkout exists

OSS Apache-2.0 core (this repo) stays free. The one-time SKU is for people who want a commercial grant plus the avatar pack without a subscription.

## Pro — 9 USD per month

- Everything in the one-time SKU
- Private extras repository (needs a GitHub org; Polar does not support personal repos by default)
- Future Convex control plane (job/license plane). Not shipping in v0.1.

Hosted multi-seat / team queue is later SaaS on Convex plus Polar, not this CLI.

## Dual license

- CLI + sandbox runner + provider-agnostic loop + docs: Apache-2.0
- Local run-log schema: Apache-2.0 (same repo)
- Pro extras (license key, commercial use, avatar pack, private repo, Convex plane): paid Polar benefits

## Human checklist (do not impersonate)

1. Polar org in Phuc Pham Minh name, country Vietnam, connect VN/VND bank, complete Stripe Express
2. GitHub org for Polar private-repo benefit
3. MST / accountant note for foreign-platform income. The agent does not file taxes.
4. Confirm phuc-assistant is a human-created machine account under GitHub ToS B.3
5. Public JS registry account owned by the human before any publish.

When checkout exists, replace the placeholder in README and .github/FUNDING.yml with the live Polar URL. Until then, do not collect money.

## Sources

- https://polar.sh/docs/merchant-of-record/supported-countries
- https://polar.sh/docs/features/finance/accounts
- https://polar.sh/docs/features/benefits/license-keys
- https://polar.sh/docs/features/benefits/github-access
- https://polar.sh/legal/acceptable-use-policy
- https://www.convex.dev/components/polar
