# CLAUDE.md — Lodestar

A manifestation platform for entrepreneurs, grounded in cognitive science
rather than mysticism: "Manifesting for people who actually do the work." The
wedge against competitors is credibility, so we sell mechanism, not magic
(reticular activating system, priming, implementation intentions,
self-efficacy, cognitive reframing). Hold that framing in any user-facing copy.

Three surfaces: `app/` (Expo, expo-router), `web/` (Next.js marketing site),
`supabase/` (Postgres + Edge Functions + pg_cron). The AI guide, Vega, runs on
the Anthropic API, `claude-sonnet-4-6` for generation and
`claude-haiku-4-5-20251001` for classification.

`DEPLOY.md` is the deployment runbook. `README.md` covers local setup.

---

## Vega, the character

Vega is the face of the product, a recurring character like the Duolingo owl:
an ethereal, ambiguous-ethnicity feminine presence, calming and professional,
love and motivation personified. Deep indigo hair, warm skin, a gold
eight-pointed star motif that is also the app's mark. Palette: night
`#0B1026`, deep `#141B3C`, star/gold `#E8B04B`, ink `#EDEFF7`, muted
`#8A93B8`, care-blue `#7FA8E8`.

Her defining mechanic is an emotional arc driven by days since last contact.
She escalates from warm presence to loving panic when a member goes quiet, and
resets to relief the instant they return. Her worry is always FOR the member's
dream, never guilt-tripping or manipulative. Six tiers: present (day 0),
gentle (1-2), reaching (3-5), worried (6-9), aching (10-13), meltdown (14+).

`app/lib/vegaPersonality.js` is the source of truth for tier behavior.

---

## Gotchas

- **Tier push copy has exactly one source**,
  `supabase/functions/_shared/vegaTiers.json`, read by both the app and the
  `vega-nudge` function. Edit only the JSON, never fork the copy. The app can
  import from above its own root only because `app/metro.config.js` adds an
  explicit watch folder; that import breaks if the watch folder goes away.
- **Native-only modules need `.web.js` siblings.** `purchases.js` and
  `registerForPush.js` have them because RevenueCat and Expo push have no web
  implementation. A new native-only module without one breaks the web build.
- **`log_entries` is append-only by convention, not by enforcement.** Its RLS
  policy is `for all`, so updates and deletes will succeed. Momentum and
  nightly patterns are derived from this table as an evidence log, so
  rewriting rows to "fix" state silently corrupts both.
- **The brand palette is duplicated across ~16 files** in `app/` and `web/`.
  There is no shared tokens module yet, so a palette change means touching
  all of them.
- **Auth model differs by function.** Member-facing functions run on the
  member's JWT so RLS applies. `morning-brief` and `vega-nudge` are
  cron-triggered, deploy with `--no-verify-jwt`, use the service key, and gate
  on an Authorization header instead. The Stripe and RevenueCat webhooks also
  use the service key and gate on signature verification.
- **Cron cadence**: nightly pattern scan at 03:00 UTC, stale-entitlement
  cleanup at 03:30 UTC, morning-brief and nudge sweeps every 15 minutes.
  Anything that mutates member state has to tolerate running mid-sweep.
- **Migrations are timestamped and already applied.** Add a new one; never
  edit an existing file.

---

## Hard rules

- The Anthropic key never ships in client code. Member-facing AI goes through
  Edge Functions with the member's JWT.
- The crisis guardrail in `reframe/index.ts` fails safe: any classifier
  uncertainty routes to crisis. Never loosen this. The crisis message is
  static and human-authored, never model-generated.
- Vega's escalation is loving, never punishing. Preserve the two-beat meltdown
  (real emotion, then a shame-free door back).
- No em dashes in Vega's voice or any user-facing copy.
- All member data is RLS-scoped. Never bypass RLS in member-facing paths.
