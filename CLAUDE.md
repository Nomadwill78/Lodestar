# CLAUDE.md — Repo Map

This repository holds five independent projects. They share no code, no
dependencies, and no data. Identify which project a task concerns and work
only inside that directory; do not search or edit across projects unless the
task explicitly spans them.

## Projects

- `lodestar/` — **The active product.** Lodestar, a manifestation platform for
  entrepreneurs: Expo mobile app (`lodestar/app/`), Next.js marketing site
  (`lodestar/web/`), Supabase backend (`lodestar/supabase/`). Read
  `lodestar/CLAUDE.md` before touching anything here.
- `Celestial/` — Earlier astrology app ("Ask Celeste": readings, numerology,
  birth charts). Expo app + Supabase backend with RevenueCat/Stripe billing.
  Live and feature-complete; maintenance only unless asked for new features.
- `nomad-ad-generator/` — Live Meta ad copy generator (Next.js + Supabase +
  Stripe + Claude API), restored into source control after being deployed
  from a local machine. See its README for what is recovered vs. rebuilt.
- `kalshi-tool/` — Standalone TypeScript CLI that scans Kalshi prediction
  markets for "safe" bets and explains picks via the Anthropic API.
- `party-rsvp.html` — One-off static RSVP page. Leave alone unless named.

## Conventions

- If a task names no project, assume `lodestar/` and say so, unless the task
  content clearly points elsewhere (e.g. mentions Celeste, Kalshi).
- Two Vercel projects are linked to this repo and build on every push:
  `lodestar/web` and `nomad-ad-generator`. A break in either one fails the
  deploy even when the task had nothing to do with it.
- `.github/workflows/deploy-functions.yml` auto-deploys **Celestial's** edge
  functions on pushes to `main` that touch them. Lodestar's backend is
  deployed manually per `lodestar/DEPLOY.md`.
