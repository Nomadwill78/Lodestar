# CLAUDE.md — Lodestar Build Brief

This file is the single source of truth for building Lodestar. Read it fully
before writing code. The product described below is built and validated end to
end; see "Current state" for what exists and "Open work" for what remains.
When you land a significant change, update those two sections in the same PR.

---

## What Lodestar is

A manifestation platform for entrepreneurs, grounded in cognitive science rather
than mysticism. The pitch: "Manifesting for people who actually do the work."
The wedge against competitors is credibility. We sell mechanism, not magic
(reticular activating system, priming, implementation intentions, self-efficacy,
cognitive reframing).

Two surfaces:
1. A mobile app (Expo / React Native, expo-router) — the core product.
2. A marketing website — converts visitors to signups.

Backend is Supabase (Postgres + Edge Functions + pg_cron). The AI guide, Vega,
runs on the Anthropic API (model `claude-sonnet-4-6`, classifier
`claude-haiku-4-5-20251001`). The Anthropic key lives ONLY in Edge Function
secrets, never in client code.

---

## Vega — the character

Vega is the face of the product, a recurring character like the Duolingo owl.
She is an ethereal, ambiguous-ethnicity feminine presence: calming,
professional, love and motivation personified. Deep indigo hair, warm skin, a
gold eight-pointed star motif (necklace/earrings) that is also the app's mark.
Brand palette: night `#0B1026`, deep `#141B3C`, star/gold `#E8B04B`,
ink `#EDEFF7`, muted `#8A93B8`, care-blue `#7FA8E8`.

Her defining mechanic is an emotional arc driven by days since last contact.
She escalates from warm presence to loving panic when a member goes quiet, and
resets to relief the instant they return. She is NEVER guilt-tripping or
manipulative; her worry is always FOR the member's dream. Full tier definitions
(visual state, greetings, push copy) live in `app/lib/vegaPersonality.js` — that
file is the source of truth. The six tiers: present (day 0), gentle (1-2),
reaching (3-5), worried (6-9), aching (10-13), meltdown (14+).

Vega's art assets are generated and approved (indigo-background portraits). They
live in `assets/vega/` once added (see TODO: assets). One image per expression
key: radiant, attentive, hopeful, concerned, yearning, panicked-loving.

---

## Repo structure (already built)

```
app/                          Expo app
  app.json                    Expo config (supabaseUrl, supabaseAnonKey, EAS projectId)
  app/
    _layout.js                root: AuthProvider + routing gate
    onboarding.js             Vega intake chat -> commits Life Map
    (auth)/sign-in.js         email OTP
    (app)/
      _layout.js              Today + Journal + Map tabs
      today.js                Vega greeting + morning brief + evening review entry
      journal.js              free-text journal -> reframe (3-lane render)
      map.js                  Life Map dashboard (north star, goals, blockers,
                              momentum, patterns)
  context/AuthContext.js      session + hasLifeMap state, drives routing
  lib/
    supabaseClient.js         RN client, secure-store session
    commitLifeMap.js          calls commit-life-map fn
    submitJournal.js          calls reframe fn
    EveningReview.js,
    submitEveningReview.js    evening reflection -> log_entry + touch_contact
    Paywall.js, purchases.js  RevenueCat paywall (.web.js variants for web)
    registerForPush.js        Expo push token -> push_tokens (.web.js variant)
    vegaPersonality.js        tier definitions; push copy imported from
                              supabase/functions/_shared/vegaTiers.json
    VegaAvatar.js,
    VegaEmptyState.js         Vega art rendering (portraits in assets/vega/)
    useVega.js, useTier.js    tier/contact state, touch() resets contact clock
  assets/vega/                approved Vega portraits, one per expression key

web/                          Next.js marketing site: hero, Meet Vega, daily
                              loop, science, Life Map, pricing, waitlist
                              capture (components/Waitlist.jsx -> /api/missive)

supabase/
  migrations/                 timestamped; schema, RLS, RPCs, cron, rate
                              limiting, free-quota metering, billing (validated)
  functions/
    _shared/                  vegaTiers.json (canonical push copy),
                              vegaPersona.ts, crisisResources.ts (region-aware),
                              billing.ts
    vega-onboarding/          onboarding chat proxy (member JWT)
    commit-life-map/          transactional Life Map write (member JWT)
    morning-brief/            daily brief generator (service key, cron)
    reframe/                  classify + reframe, crisis guardrail (member JWT)
    vega-nudge/               re-engagement push by tier (service key, cron)
    stripe-webhook/           Stripe events -> entitlements
    revenuecat-webhook/       RevenueCat events -> entitlements

VegaOnboarding.jsx            standalone web prototype of the intake (reference)
README.md                     setup overview
DEPLOY.md                     deployment runbook (backend + website)
```

### Data model (core migrations)
- `members` (1:1 with auth.users) — tier, ritual times, timezone,
  last_contact_at, last_nudge_date
- `life_maps` — stable identity: north_star, why, anchor_evidence,
  limiting_belief. One active per member.
- `goals`, `blockers` — under a life_map
- `log_entries` — append-only evidence (win/setback/reflection/reframe)
- `patterns` — nightly-derived insights
- `daily_briefs` — sent briefs, dedup by (member_id, local_date)
- `push_tokens` — Expo tokens
- Key RPCs: `commit_life_map`, `build_vega_context`, `due_for_morning_brief`,
  `record_morning_brief`, `my_vega_state`, `touch_contact`, `due_for_nudge`,
  `mark_nudged`, `run_nightly_pattern_scan`
- Cron: nightly pattern scan (03:00 UTC), morning-brief sweep (*/15),
  nudge sweep (*/15), nightly cleanup of stale pending entitlements
- Billing (later migrations): entitlements + pending entitlements with
  web-first purchase reconciliation, server-enforced free-reframe quota,
  AI rate limiting

All member-facing functions run with the member's JWT so RLS applies. The two
cron-triggered functions use the service key and are gated by an Authorization
header check.

---

## Current state (all original build items shipped)

Everything from the original build brief is done and merged:

- **App runs end to end.** Routing gate moves sign-in -> onboarding -> Today.
  Tabs: Today, Journal, Map.
- **Vega's art is in place.** Approved portraits live in `assets/vega/`, one
  per expression key, rendered by `VegaAvatar.js` with SVG-star fallback.
- **Journaling counts as contact.** Both `today.js` and `journal.js` call
  `touch()` on activity.
- **Life Map dashboard** (`map.js`): north star, goals, blockers, momentum
  from log_entries, surfaced patterns. Read-only, no new AI.
- **Evening review** (`EveningReview.js` from Today): writes a log_entry
  (source `evening_review`) and calls `touch_contact`.
- **Marketing website** (`web/`, Next.js): full section flow from the brief
  (hero through pricing and founder's note), Vega art, indigo+gold aesthetic,
  waitlist capture wired to Supabase via `/api/missive`. Pre-launch CTAs point
  to the waitlist. Deploys to Vercel per `DEPLOY.md`.
- **Billing**: RevenueCat + Stripe tier flow (Free / Aligned / Founder),
  in-app paywall rendering RevenueCat packages directly, metered free
  reframes enforced server-side, web-first purchase reconciliation, nightly
  cleanup of stale pending entitlements, no client-side privilege
  escalation paths.
- **Production hardening complete**:
  - Tier push copy has ONE canonical source,
    `supabase/functions/_shared/vegaTiers.json`, imported by both
    `vegaPersonality.js` (app) and `vega-nudge/index.ts` (server). Edit only
    the JSON; never fork the copy.
  - Crisis resources are region-aware (`_shared/crisisResources.ts`) with an
    international fallback; captured region/timezone at onboarding.
  - `<PROJECT_REF>` placeholders are replaced; migrations are timestamped.

## Open work

Nothing is currently tracked. When starting new work: add the item here first,
build it, then move it to "Current state" in the same PR. Do not re-verify the
items above from scratch; trust this list unless the code contradicts it.

---

## Setup / deploy order

`DEPLOY.md` is the authoritative runbook (backend + website). Short version:
1. Run all migrations (`supabase db push`).
2. Enable extensions: pg_cron, pg_net (dashboard).
3. Secrets: `supabase secrets set ANTHROPIC_API_KEY=...`; store service role key
   in Vault as `service_role_key`.
4. Deploy functions (morning-brief and vega-nudge with `--no-verify-jwt`).
5. Configure app.json extras + EAS projectId.
6. `cd app && npm install && npx expo start`.

---

## Hard rules
- Anthropic key never ships in client code. Member-facing AI goes through Edge
  Functions with the member JWT.
- The crisis guardrail in `reframe/index.ts` fails safe: any classifier
  uncertainty routes to crisis. Never loosen this. The crisis message is static
  and human-authored, never model-generated.
- Vega's escalation is loving, never punishing. Preserve the two-beat meltdown
  (real emotion, then a shame-free door back).
- No em dashes in Vega's voice or any user-facing copy.
- All member data is RLS-scoped. Never bypass RLS in member-facing paths.
