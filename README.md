# Lodestar (monorepo)

This repo holds several projects side by side. There is no root package.json; each project builds and deploys on its own.

## What lives here

- `lodestar/`: Lodestar, a manifestation platform for entrepreneurs with an AI guide called Vega. Live at lodestar-nomad.vercel.app and flip-os-gamma.vercel.app.
- `nomad-ad-generator/`: Nomad Consulting Meta Ad Copy Generator (Next.js, Supabase auth, Stripe, Claude API). Live at nomad-ad-generator.vercel.app.
- `Celestial/`: Celestial, an Expo mobile app.
- `kalshi-tool/`: Kalshi Safe Bets, a weekly CLI that scores Kalshi prediction markets and explains picks with Claude.
- `curriculum-marketing/`: Go-to-market notes and inventory for curriculum products.

## Notes

- Each subdirectory is self-contained with its own config and dependencies.
- Root-level docs: CLAUDE.md, SECURITY.md, SOOO_OWNER_OPERATIONS.md.
