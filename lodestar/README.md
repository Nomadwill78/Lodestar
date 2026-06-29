# Lodestar

A neuroscience-grounded manifestation platform for entrepreneurs. Vega, the AI
guide, runs three touchpoints: onboarding (writes the Life Map), the morning
brief (daily habit engine), and the reframe (setback support with a crisis
guardrail).

## Architecture

```
Expo app (client)                Supabase
-----------------                --------
sign-in (email OTP)  ───────────▶ auth.users ──trigger──▶ members
onboarding chat      ──invoke──▶ vega-onboarding (fn)  ──▶ Anthropic
   extract <lifemap> ──invoke──▶ commit-life-map (fn)  ──▶ commit_life_map() ─▶ life_maps/goals/blockers/log_entries
today (brief view)   ──select──▶ daily_briefs
journal              ──invoke──▶ reframe (fn) ─classify─▶ log + reframe/crisis/neutral

pg_cron every 15m ─▶ trigger_morning_sweep() ─http─▶ morning-brief (fn) ─▶ Anthropic ─▶ daily_briefs ─▶ Expo push
pg_cron nightly   ─▶ run_nightly_pattern_scan() ─▶ patterns
```

The Anthropic API key lives only in Edge Function secrets, never in the app.
All member-facing functions run with the member's JWT so RLS applies. The two
background functions (morning-brief) use the service key and are gated by an
Authorization check.

## Setup order

1. **Run migrations** 001 through 008 in order (`supabase db push`).
2. **Enable extensions** in the dashboard: `pg_cron`, `pg_net`. (`pgcrypto`,
   `vault` are enabled by the migrations or on by default.)
3. **Store secrets**
   - `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
   - Put the service role key in Vault as `service_role_key` (used by the
     morning sweep). Dashboard: Project Settings > Vault.
4. **Edit migration 006**: replace `<PROJECT_REF>` with your project ref.
5. **Deploy functions**
   - `supabase functions deploy vega-onboarding`
   - `supabase functions deploy commit-life-map`
   - `supabase functions deploy morning-brief --no-verify-jwt`
   - `supabase functions deploy reframe`
   (morning-brief uses `--no-verify-jwt` because the cron sweep authenticates
   with the service key in the header, not a user JWT.)
6. **Configure the app**: set `supabaseUrl` and `supabaseAnonKey` in
   `app/app.json` under `expo.extra`. Add your EAS `projectId` for push.
7. **Run**: `cd app && npm install && npx expo start`.

## Routing logic

`app/_layout.js` gates on two signals from `AuthContext`:
- no session → sign-in
- session, no active life_map → onboarding
- session + active life_map → the app (Today / Journal tabs)

## What's not built yet

- The Life Map dashboard (a third tab, all read). Slots into `(app)/`.
- Evening review flow (mirror of the morning brief, member-initiated).
- Localizing crisis resources by member region (currently US 988 / 741741).
