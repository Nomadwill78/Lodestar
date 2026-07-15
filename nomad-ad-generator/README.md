# Nomad Consulting — Meta Ad Copy Generator

AI-powered Meta (Facebook/Instagram) ad copy generator. Next.js App Router +
Supabase auth + Stripe subscriptions + the Claude API.

Live at: https://nomad-ad-generator.vercel.app

## Why this code lives here

The original app was deployed to Vercel straight from a local machine with the
Vercel CLI — its source never reached GitHub, and the Vercel project is linked
to this repository, so every push to `main` triggered a failing build. This
directory restores the app in source control:

- **Landing, signup, and login pages** are recovered 1:1 from the production
  deployment (server-rendered HTML + client bundles).
- **Dashboard and API routes** (generate / checkout / webhook / auth callback)
  are rebuilt, since server code can't be recovered from client bundles.
- **The signup-breaking bug is fixed**: the deployed build had a UTF-8 BOM
  (`U+FEFF`) baked into `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, so every Supabase request failed with
  *"String contains non ISO-8859-1 code point"*. All env access now goes
  through `lib/env.ts`, which strips BOM/zero-width characters defensively.

## Setup

1. **Supabase** — run `supabase/schema.sql` in the SQL editor (idempotent; it
   creates `profiles`, `generations`, RLS policies, and the signup trigger).
   In Auth settings, add `<site>/api/auth/callback` to the redirect allowlist.
2. **Environment variables** — copy `.env.example` and fill in every value.
   Re-enter the two Supabase values fresh from the Supabase dashboard; do not
   reuse the previously stored (BOM-contaminated) values.
3. **Stripe** — create three recurring prices ($29/$67/$97) and set the
   `STRIPE_PRICE_*` vars. Point a webhook at `<site>/api/stripe-webhook` with
   events `checkout.session.completed` and `customer.subscription.deleted`.
4. **Vercel** — in the `nomad-ad-generator` project settings, set
   **Root Directory** to `nomad-ad-generator` so git deploys build this app.

## Plans

| Plan    | Price  | Generations/mo |
|---------|--------|----------------|
| Free    | $0     | 5              |
| Starter | $29/mo | 50             |
| Pro     | $67/mo | 200            |
| Agency  | $97/mo | Unlimited      |

Limits are enforced server-side in `app/api/generate/route.ts` by counting the
user's `generations` rows for the current calendar month.

## Development

```bash
npm install
npm run dev
```
