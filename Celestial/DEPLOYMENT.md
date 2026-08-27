# Celestial — Deployment Guide

## Overview
Celestial is a React Native + Expo app deployed via EAS Build to Google Play and Apple App Store.
Backend: Supabase (auth + database + edge functions)
Payments: Stripe
AI: Anthropic Claude API

---

## 1. Supabase Setup

### Create project
1. Go to https://supabase.com → New Project
2. Note your **Project URL** and **anon key** (Settings → API)
3. Copy service role key (for edge functions)

### Run migration
```bash
cd Celestial
npx supabase db push  # or paste supabase/migrations/001_initial.sql into SQL editor
```

### Deploy Edge Functions
```bash
npx supabase functions deploy horoscope
npx supabase functions deploy advisor
npx supabase functions deploy stripe-checkout
npx supabase functions deploy stripe-webhook
```

### Set Edge Function secrets
```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase secrets set STRIPE_STARSEED_MONTHLY_PRICE_ID=price_...
npx supabase secrets set STRIPE_COSMIC_YEARLY_PRICE_ID=price_...
npx supabase secrets set APP_URL=celestial://
```

---

## 2. Stripe Setup

### Create account & products
1. Go to https://stripe.com → Dashboard
2. Create Products:
   - **Starseed Monthly**: $4.99/month recurring → copy Price ID
   - **Cosmic Annual**: $39.99/year recurring → copy Price ID

   > Note: prices shown in-app come from `lib/stripe.ts`; the actual charge is
   > the Stripe Price object referenced by the env vars below. When changing
   > prices, create **new** Price objects at the new amounts and repoint
   > `STRIPE_STARSEED_MONTHLY_PRICE_ID` / `STRIPE_COSMIC_YEARLY_PRICE_ID` — Stripe
   > Prices are immutable, so editing the number in code alone won't change what
   > customers are billed. The Starseed checkout now opens a 3-day free trial.

### Configure webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://[YOUR_PROJECT].supabase.co/functions/v1/stripe-webhook`
3. Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy webhook signing secret → set as `STRIPE_WEBHOOK_SECRET`

### Changing prices (runbook)

Stripe Price objects are immutable, so a price change is: create new Prices,
repoint the secrets, redeploy. The in-app numbers in `lib/stripe.ts` are display
only — the real charge is whatever Price the secrets point at.

Project ref: `rjucvqthsseegxlwryru` (find it in Supabase → Project Settings → General).

1. **Update the display prices** in `lib/stripe.ts` (and any copy like "Save 33%")
   so the app matches what you'll charge.
2. **Create new Price objects** in the Stripe dashboard at the new amounts
   (recurring, no trial baked in — the 3-day Starseed trial is applied at
   checkout by the function, not the Price). Copy the two `price_...` IDs.
3. **Link the CLI** (one time per machine), then point the secrets at the new IDs:
   ```bash
   supabase login
   cd Celestial
   supabase link --project-ref rjucvqthsseegxlwryru
   supabase secrets set STRIPE_STARSEED_MONTHLY_PRICE_ID=price_xxx
   supabase secrets set STRIPE_COSMIC_YEARLY_PRICE_ID=price_yyy
   supabase secrets list   # confirm the keys are set (values are hidden)
   ```
4. **Redeploy** so the functions pick up the new secrets — this is the step that
   actually makes the change live:
   ```bash
   supabase functions deploy stripe-checkout
   supabase functions deploy advisor
   ```
5. **Verify:** in the app, Starseed checkout shows the new monthly price and the
   button reads "Start 3-Day Free Trial"; Cosmic shows the new annual price.

> Order matters: set secrets **before** redeploying, or the deploy won't have the
> new values. Existing subscribers keep their original price until they
> resubscribe — Stripe does not migrate active subscriptions to a new Price.

---

## 3. Anthropic (Claude) API

1. Go to https://console.anthropic.com → API Keys
2. Create new key → set as `ANTHROPIC_API_KEY` in Supabase secrets
3. The app uses `claude-haiku-4-5-20251001` for cost efficiency

---

## 4. Local Development

```bash
cd Celestial

# Copy env file
cp .env.example .env.local

# Fill in your keys:
# EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Install dependencies
npm install

# Start dev server
npx expo start
```

---

## 5. Font Setup

Download fonts and place in `assets/fonts/`:
- **Playfair Display**: https://fonts.google.com/specimen/Playfair+Display
  - PlayfairDisplay-Regular.ttf, PlayfairDisplay-Bold.ttf, PlayfairDisplay-Italic.ttf
- **Inter**: https://fonts.google.com/specimen/Inter
  - Inter-Regular.ttf, Inter-Medium.ttf, Inter-SemiBold.ttf, Inter-Bold.ttf

---

## 6. EAS Build Setup

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Initialize EAS project
```bash
cd Celestial
eas build:configure
```

This will:
- Create your project on expo.dev
- Update `app.json` with your project ID

### Build for testing (Preview)
```bash
# Android APK (no Play Store account needed)
eas build --platform android --profile preview

# iOS Simulator build
eas build --platform ios --profile preview
```

### Build for App Stores (Production)
```bash
eas build --platform all --profile production
```

---

## 7. Google Play Store Submission

### Prerequisites
1. Google Play Developer account ($25 one-time): https://play.google.com/console
2. Create app in Play Console
3. Complete store listing (screenshots, description, icon)

### Build & Submit
```bash
# Build production AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

Required assets:
- App icon: 512×512 PNG
- Feature graphic: 1024×500 PNG
- Screenshots: Minimum 2, phone screenshots

---

## 8. Apple App Store Submission

### Prerequisites
1. Apple Developer account ($99/year): https://developer.apple.com
2. Create app in App Store Connect
3. App Review Info

### Build & Submit
```bash
# Build production IPA
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

Required assets:
- App icon: 1024×1024 PNG (no transparency)
- Screenshots: 6.7" iPhone, 12.9" iPad Pro

---

## 9. Automated CI/CD

The `.github/workflows/eas-build.yml` workflow automatically builds on push to `main`.

Add secrets to GitHub:
- `EXPO_TOKEN`: Your Expo access token (expo.dev → Account → Access Tokens)

---

## 10. Production Checklist

- [ ] Supabase project created and migration run
- [ ] All edge functions deployed with secrets set
- [ ] Stripe products and webhook configured
- [ ] Fonts downloaded and placed in assets/fonts/
- [ ] .env.local filled with production keys
- [ ] EAS project initialized (`eas.json` updated with real project ID)
- [ ] App icon and splash screen created
- [ ] Google Play Console app created
- [ ] Apple App Store Connect app created
- [ ] Production builds tested on real devices
- [ ] App store listings completed with screenshots

---

## Support
Questions: hello@celestial.app
