# Lodestar deployment runbook

Project ref: **rjucvqthsseegxlwryru** (the Supabase project linked to this repo).
Run all commands from the `lodestar/` directory unless noted.

Docker is NOT required for any of the remote steps below.

---

## 0. One-time prerequisites

```bash
# Install the Supabase CLI (pick one)
brew install supabase/tap/supabase      # macOS / Linux (Homebrew)
# or:  npm install -g supabase
# or:  scoop install supabase            # Windows

supabase login                           # opens a browser to authorize
cd lodestar
supabase link --project-ref rjucvqthsseegxlwryru
```

Get your keys from the dashboard: **Project Settings > API**
- `anon` public key (for the app and website)
- `service_role` secret key (used below; keep it private)

---

## 1. Enable extensions (do this BEFORE migrations)

Dashboard > **Database > Extensions**, enable:
- `pg_cron`  (schedules the morning, nudge, and cleanup sweeps)
- `pg_net`   (lets cron call the edge functions over HTTP)

`pgcrypto` and `vault` are on by default. The migrations that schedule cron
(006, 010, 017) will fail if `pg_cron` is not enabled first.

---

## 2. Push the database (migrations 001-017)

```bash
supabase db push
```

This applies the full schema, RLS, RPCs, cron jobs, and billing tables to the
linked project. Verify:

```sql
-- in the dashboard SQL editor
select count(*) from pg_tables where schemaname = 'public';   -- tables exist
select jobname, schedule from cron.job;                        -- 4 cron jobs
```

You should see cron jobs for: nightly pattern scan, morning-brief sweep,
vega-nudge sweep, and pending-entitlements cleanup.

---

## 3. Set secrets

Edge functions automatically receive `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` from the platform. You only set the rest:

```bash
# Required for Vega (AI)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Billing webhooks (only when you turn on paid tiers)
supabase secrets set REVENUECAT_WEBHOOK_AUTH=choose-a-long-random-string
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...     # from the Stripe webhook you create in step 6
```

The cron sweeps read the **service role key from Vault** (not from secrets).
Add it once, in the dashboard SQL editor:

```sql
select vault.create_secret(
  'PASTE_YOUR_SERVICE_ROLE_KEY_HERE',
  'service_role_key'
);
```

---

## 4. Deploy the edge functions

```bash
supabase functions deploy vega-onboarding
supabase functions deploy commit-life-map
supabase functions deploy reframe
supabase functions deploy morning-brief     --no-verify-jwt
supabase functions deploy vega-nudge        --no-verify-jwt
supabase functions deploy revenuecat-webhook --no-verify-jwt   # billing (optional)
supabase functions deploy stripe-webhook     --no-verify-jwt   # billing (optional)
```

`--no-verify-jwt` is used by the cron sweeps and store webhooks because they
authenticate with a service key or a signing secret in the header, not a member
JWT. The `_shared/` folder is bundled automatically with the functions that
import it.

---

## 5. Configure the app, then smoke-test the AI

In `app/app.json` under `expo.extra`, set:
- `supabaseUrl`: `https://rjucvqthsseegxlwryru.supabase.co`
- `supabaseAnonKey`: your anon key
- `eas.projectId`: your EAS project id (for push)

Then run the app (`cd app && npm install && npx expo start`), sign in, finish
onboarding, and submit a journal entry. Watch the function logs:

```bash
supabase functions logs vega-onboarding
supabase functions logs reframe
```

Verify the cron path without waiting for the clock:

```sql
select trigger_morning_sweep();   -- generates briefs for anyone due now
select trigger_nudge_sweep();     -- sends nudges for anyone due now
```

Check `supabase functions logs morning-brief` and the `daily_briefs` table.

---

## 6. Verify the billing webhooks with test events

Only needed when you enable paid tiers. First map your real product / price
identifiers to tiers in `supabase/functions/_shared/billing.ts`, then redeploy
the two webhook functions.

### Stripe

1. Dashboard > **Developers > Webhooks > Add endpoint**:
   `https://rjucvqthsseegxlwryru.functions.supabase.co/stripe-webhook`
   Select events: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
2. Copy the endpoint's **Signing secret** (`whsec_...`) and set it:
   `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`, then redeploy
   `stripe-webhook`.
3. Fill the Stripe env vars in `web/.env.example` (real price ids + secret key)
   in your Vercel project, and set `NEXT_PUBLIC_SITE_URL`.
4. End-to-end test (best): on the live/test site pricing, choose a paid plan and
   pay with the Stripe test card `4242 4242 4242 4242`, any future expiry, any
   CVC.
   - Use the **email of an existing member** to confirm an immediate tier flip.
   - Use a **brand-new email**, then sign up in the app with that same email, to
     confirm web-first reconciliation (the pending row applies at signup).
5. Watch it land:
   ```bash
   supabase functions logs stripe-webhook    # expect "ok" or "pending stored"
   ```
   ```sql
   select email, tier, subscription_status from members order by updated_at desc limit 5;
   select * from pending_entitlements;       -- before signup, the unclaimed buy sits here
   ```
   A `400 invalid signature` in the logs means `STRIPE_WEBHOOK_SECRET` does not
   match the endpoint.

Optional local-style test with the Stripe CLI:
```bash
stripe login
stripe trigger checkout.session.completed
```
(Test triggers carry no member mapping, so they exercise the signature path and
the pending branch, not a real tier flip.)

### RevenueCat

1. RevenueCat dashboard > **Project > Integrations > Webhooks**: set the URL to
   `https://rjucvqthsseegxlwryru.functions.supabase.co/revenuecat-webhook` and
   set the **Authorization header** to the same value as
   `REVENUECAT_WEBHOOK_AUTH`.
2. Create entitlements `aligned` and `founder`, attach your store products, and
   put the public SDK keys in `app/app.json` (`revenueCatIosKey`,
   `revenueCatAndroidKey`).
3. Use **Send test event** in the RC webhook settings to confirm the function
   accepts it (a test event has no real member, so it is a no-op map). For a real
   flip, make a sandbox purchase in a dev build (the app sets `app_user_id` to
   the member id) and check:
   ```bash
   supabase functions logs revenuecat-webhook
   ```
   ```sql
   select email, tier, subscription_provider from members order by updated_at desc limit 5;
   ```

---

## 7. Deploy the marketing website (Vercel)

The site lives in `lodestar/web` (Next.js App Router). Vercel is the simplest
host; the steps below assume it.

### Import the project

1. Push this repo to GitHub (already done for the working branch).
2. Vercel > **Add New > Project** > import the repo.
3. Set **Root Directory** to `lodestar/web`. Vercel auto-detects Next.js;
   leave the build command (`next build`) and output as defaults.

Alternatively, from the CLI:
```bash
npm i -g vercel
cd lodestar/web
vercel            # first run links/creates the project
vercel --prod     # production deploy
```

### Environment variables

Vercel > Project > **Settings > Environment Variables** (set for Production and
Preview). Mirror `web/.env.example`:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rjucvqthsseegxlwryru.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key (Project Settings > API) |
| `NEXT_PUBLIC_SITE_URL` | your public URL, e.g. `https://lodestar.app` |
| `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...` while testing) |
| `STRIPE_PRICE_ALIGNED_MONTHLY` | the Stripe price id |
| `STRIPE_PRICE_ALIGNED_ANNUAL` | the Stripe price id |
| `STRIPE_PRICE_FOUNDER_MONTHLY` | the Stripe price id |
| `STRIPE_PRICE_FOUNDER_ANNUAL` | the Stripe price id |

Notes:
- The `NEXT_PUBLIC_*` vars are read only in server route handlers here, but the
  prefix is harmless. The anon key is safe to expose; the Missive table is RLS
  insert-only.
- `STRIPE_SECRET_KEY` and the price ids are server-only (no `NEXT_PUBLIC_`
  prefix), so they never reach the browser.
- The Stripe webhook secret is NOT set here. It lives on the Supabase
  `stripe-webhook` function (step 3), because that function, not the website,
  receives Stripe events.
- Redeploy after changing env vars so they take effect.

### Custom domain

1. Vercel > Project > **Settings > Domains** > add your domain.
2. Point DNS as Vercel instructs (usually an `A`/`ALIAS` for the apex and a
   `CNAME` for `www`). HTTPS is provisioned automatically.
3. Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy, so Stripe
   success/cancel redirects land on the right host.

### Verify the site

- Open the domain: all nine sections render; `/privacy`, `/terms`,
  `/disclaimer` load.
- **Missive**: submit an email in the footer form; confirm a row appears in
  Supabase `missive_subscribers`.
- **Checkout** (once Stripe env + prices are set): click a paid plan; you should
  be redirected to Stripe Checkout. Complete it with test card
  `4242 4242 4242 4242` and confirm the tier flip per step 6.
- Check server logs under Vercel > Project > **Logs** if `/api/missive` or
  `/api/checkout` returns an error (a `not_configured` response means an env
  var is missing).

---

## Quick reference

| What | Where |
|------|-------|
| Anon / service keys | Project Settings > API |
| Function logs | `supabase functions logs <name>` or dashboard > Edge Functions |
| Cron jobs | `select * from cron.job;` |
| Vault secret for cron | `select vault.create_secret('KEY','service_role_key');` |
| Free reframe quota | `FREE_WEEKLY_REFRAMES` in `supabase/functions/reframe/index.ts` |
| Tier mapping | `supabase/functions/_shared/billing.ts` |
