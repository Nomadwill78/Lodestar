# CLAUDE.md — Repo Map

This repository holds four independent projects. They share no code, no
dependencies, and no data. Identify which project a task concerns and work
only inside that directory; do not search or edit across projects unless the
task explicitly spans them.

## Projects

- `lodestar/` — **The active product.** Lodestar, a manifestation platform for
  entrepreneurs: Expo mobile app (`lodestar/app/`), Next.js marketing site
  (`lodestar/web/`), Supabase backend (`lodestar/supabase/`). Read
  `lodestar/CLAUDE.md` before touching anything here; it is the build brief
  and source of truth.
- `Celestial/` — Earlier astrology app ("Ask Celeste": readings, numerology,
  birth charts). Expo app + Supabase backend with RevenueCat/Stripe billing.
  Live and feature-complete; maintenance only unless asked for new features.
- `kalshi-tool/` — Standalone TypeScript CLI that scans Kalshi prediction
  markets for "safe" bets and explains picks via the Anthropic API. Unrelated
  to the two apps.
- `party-rsvp.html` — One-off static RSVP page. Leave alone unless named.

## Conventions

- If a task names no project, assume `lodestar/` and say so, unless the task
  content clearly points elsewhere (e.g. mentions Celeste, Kalshi).
- `.github/workflows/deploy-functions.yml` auto-deploys **Celestial's** edge
  functions on pushes to `main` that touch them. Lodestar's backend is
  deployed manually per `lodestar/DEPLOY.md`.
- After landing a significant feature in `lodestar/`, update the
  "Current state" and "Open work" sections of `lodestar/CLAUDE.md` in the
  same PR so the brief stays accurate.
