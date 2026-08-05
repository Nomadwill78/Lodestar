---
name: lodestar-verify
description: Verify changes to Lodestar (lodestar/app, lodestar/web, or lodestar/supabase) before calling them done. Use after editing anything under lodestar/, when asked whether a Lodestar change works, or before opening a PR that touches it. Lodestar has no test suite, so verification means running the real builds.
---

# Verifying Lodestar

There is no test suite. Verification means building the thing that would break.
Run the checks for the surfaces you actually touched.

Neither `app/` nor `web/` has `node_modules` checked in, so the first run in a
fresh container includes an install. Both installs take under 30 seconds.

## web/

```
cd lodestar/web && npm install && npm run build
```

About 30 seconds. Vercel runs this on every push, so a failure here fails the
deploy and blocks the PR.

`npm run lint` runs the same ESLint pass on its own, which is quicker when you
only want the lint result. It is not an extra gate: `next build` already runs
it, and a lint **error** fails the build and therefore the deploy. Warnings do
not.

The config extends `next/core-web-vitals` and turns off exactly one rule,
`react/no-unescaped-entities`, so prose stays readable as `Let's` rather than
`Let&apos;s`. Prefer fixing a violation over adding another exception.

## app/

```
cd lodestar/app && npm install && CI=1 npx expo export --platform web
```

Exits non-zero on any bundling failure. This is the app's only automated check
and it is worth more than it looks, because it exercises the two things most
likely to break silently:

- Metro resolving `vegaTiers.json` from above the app root, which works only
  because of the watch folder in `metro.config.js`. Verified: removing that
  watch folder fails this export with a module resolution error instead of at
  runtime on a member's phone.
- Web platform resolution picking up `.web.js` siblings, so a new native-only
  module that is missing one shows up here.

It does not build native iOS or Android. For anything touching native modules
it is necessary but not sufficient, and you should say so rather than implying
full coverage.

## supabase/

No Supabase CLI and no Deno runtime are installed, so migrations and Edge
Functions cannot be executed locally. Verification here is review, against the
gotchas in `lodestar/CLAUDE.md` rather than a command. Confirm specifically
that the migration is additive, that the auth model matches the function's
role, and that nothing rewrites `log_entries` in place.

These fail in production rather than at deploy time, so a clean deploy is not
evidence that they hold.

## Palette changes

A palette change has to land in both `app/lib/theme.js` and `web/theme.js`,
which are deliberate mirrors rather than one shared file. Confirm the values
agree; nothing enforces it.

## Reporting the result

Say which checks ran and which did not. "The web build passes; I did not
exercise the native app" is a useful answer. "Verified" on its own is not.
