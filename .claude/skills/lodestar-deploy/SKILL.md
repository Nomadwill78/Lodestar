---
name: lodestar-deploy
description: Deploy or configure Lodestar's Supabase backend (migrations, Edge Functions, secrets, cron) and its Vercel front ends. Use when deploying Lodestar, setting up a fresh Supabase project, adding or rotating a secret, wiring the Stripe or RevenueCat webhooks, or debugging why a deployed function or cron sweep is not running.
---

# Deploying Lodestar

`lodestar/DEPLOY.md` is the runbook and the authority on the steps. Read it
when doing any of this; do not work from memory and do not restate its steps
elsewhere.

This file exists for the parts that are ordering-sensitive or easy to get
subtly wrong, where the failure is silent or shows up somewhere unrelated.

## Ordering

Extensions before migrations. `pg_cron` and `pg_net` must be enabled in the
dashboard before `supabase db push` runs, because the automation migration
schedules cron jobs and will fail against a database that cannot schedule.

## Two different secret stores

This is the most common source of confusion:

- Most secrets go to Edge Function secrets via `supabase secrets set`.
- The **service role key for the cron sweeps lives in Vault**, created with
  `select vault.create_secret(...)` under the name `service_role_key`. It is
  not read from Edge Function secrets.

A cron sweep that silently stops running is usually this, not a code problem.

## Functions that skip JWT verification

`morning-brief`, `vega-nudge`, `revenuecat-webhook`, and `stripe-webhook`
deploy with `--no-verify-jwt`. They authenticate on a service key or a signing
secret in the header instead of a member JWT. Every other function must keep
JWT verification on, because that is what makes RLS apply to member data.
Deploying a member-facing function with `--no-verify-jwt` is a data exposure,
not a convenience.

## Front ends

Two separate Vercel projects build from this repo: the marketing site at root
directory `lodestar/web`, and the Expo web build of the app. They have
different environment variables.

The Stripe webhook signing secret belongs on Supabase, never in Vercel's
environment. If it is set in Vercel, it is both useless and leaked to the
build.

## After deploying

The runbook's smoke tests are the point of the exercise, not an optional last
step. A deploy that has not had a real reading generated against it and a
forged webhook rejected has not been verified.
