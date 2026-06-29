# CLAUDE.md — Lodestar Build Brief

This file is the single source of truth for building Lodestar. Read it fully
before writing code. Everything already in this repo is built and validated;
your job is to wire it into running apps and build the pieces marked TODO.

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
  app.json                    Expo config (set supabaseUrl, supabaseAnonKey, EAS projectId)
  package.json                deps
  app/
    _layout.js                root: AuthProvider + routing gate
    onboarding.js             Vega intake chat -> commits Life Map
    (auth)/sign-in.js         email OTP
    (app)/
      _layout.js              Today + Journal tabs
      today.js                Vega greeting + morning brief
      journal.js              free-text journal -> reframe (3-lane render)
  context/AuthContext.js      session + hasLifeMap state, drives routing
  lib/
    supabaseClient.js         RN client, secure-store session
    commitLifeMap.js          calls commit-life-map fn
    submitJournal.js          calls reframe fn
    registerForPush.js        Expo push token -> push_tokens
    vegaPersonality.js        SOURCE OF TRUTH for tiers
    VegaAvatar.js             renders Vega at a tier (swap Star primitive for art)
    useVega.js                loads tier state, touch() resets contact clock

supabase/
  migrations/   001-010       schema, RLS, RPCs, cron jobs (all validated)
  functions/
    vega-onboarding/          onboarding chat proxy (member JWT)
    commit-life-map/          transactional Life Map write (member JWT)
    morning-brief/            daily brief generator (service key, cron)
    reframe/                  classify + reframe, crisis guardrail (member JWT)
    vega-nudge/               re-engagement push by tier (service key, cron)

VegaOnboarding.jsx            standalone web prototype of the intake (reference)
README.md                     setup + deploy order
```

### Data model (migrations 001-010)
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
  nudge sweep (*/15)

All member-facing functions run with the member's JWT so RLS applies. The two
cron-triggered functions use the service key and are gated by an Authorization
header check.

---

## TODO — what you (Claude Code) build

### 1. Get the app running
- `cd app && npm install`
- Set `expo.extra.supabaseUrl`, `expo.extra.supabaseAnonKey`, and the EAS
  `projectId` in `app.json`.
- Add `react-native-svg` (VegaAvatar uses it).
- `npx expo start`, fix any import/path issues, confirm the routing gate moves
  sign-in -> onboarding -> Today.

### 2. Vega's art (DONE in code, needs the PNGs)
`VegaAvatar.js` is already wired to load `assets/vega/tier-{expression}.png` and
render each portrait inside the glow/pulse animation, with an SVG-star fallback
if a file is missing. You only need to drop the approved PNGs into
`assets/vega/` using the names in `assets/vega/PLACE_IMAGES_HERE.txt`. No code
change required once the files are present.

### 3. Add contact reset on journal
`today.js` already calls `touch()`. Add the same to `journal.js` on successful
submit so journaling counts as contact.

### 4. Build the Life Map dashboard (third tab)
New screen `app/app/(app)/map.js` + a tab in `(app)/_layout.js`. All read, no new
AI. Show: north star (hero), active goals with progress, active blockers, a
momentum view from log_entries over time, and surfaced patterns. Use the brand
palette. Pull via supabase selects (RLS scopes to the member automatically).

### 5. Build the evening review
Mirror of the morning brief, member-initiated from Today. A short reflection
that writes a log_entry (source `evening_review`) and calls `touch_contact`.
Optionally a lightweight Vega response. Keep it 60 seconds of effort.

### 6. Build the marketing website
Separate target (Next.js recommended, or Expo web if you prefer one codebase).
Section flow, in order:
  1. Hero: "Manifesting for people who actually do the work." Sub: AI guide that
     turns goals into daily focus, rewires limiting beliefs, maps the path.
     Grounded in cognitive science. CTAs: Start free / Talk to Vega.
  2. Problem: read the books, nothing systematizes it, goals fade by week two.
  3. Meet Vega: the character, a real chat exchange, her art.
  4. The daily loop: morning intention -> midday reframe -> evening review.
  5. The science (the moat): RAS, priming, implementation intentions, plain
     English. This is what competitors can't credibly do.
  6. Life Map: the visual artifact, a screenshot/mock of the dashboard.
  7. Proof: founder testimonials, a follow-through metric.
  8. Pricing (transparent): Free $0 / Aligned $19mo / Founder $49mo. Annual ~2
     months free.
  9. Final CTA + founder's note ("Missive" newsletter capture).
Use Vega's splash/empty-state art. Match the app's indigo+gold aesthetic.

### 7. Production hardening
- Move tier push copy out of duplicated code into a shared source if it keeps
  drifting (currently in BOTH vegaPersonality.js and vega-nudge/index.ts —
  keep them in sync until then).
- Localize crisis resources by member region (currently US 988 / 741741 in
  reframe/index.ts).
- Replace migration 006 and 010 `<PROJECT_REF>` placeholders.

---

## Setup / deploy order (from README)
1. Run migrations 001-010 (`supabase db push`).
2. Enable extensions: pg_cron, pg_net (dashboard).
3. Secrets: `supabase secrets set ANTHROPIC_API_KEY=...`; store service role key
   in Vault as `service_role_key`.
4. Replace `<PROJECT_REF>` in migrations 006 and 010.
5. Deploy functions (morning-brief and vega-nudge with `--no-verify-jwt`).
6. Configure app.json extras + EAS projectId.
7. `cd app && npm install && npx expo start`.

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
