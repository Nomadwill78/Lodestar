# Solo Owner Operations Guide

## Ownership

- **Product owner:** @Nomadwill78
- **Technical change owner:** The person who opens the pull request
- **Release approver:** @Nomadwill78, or a named backup approved by @Nomadwill78

## Rules for changes

1. Make every change through a small pull request after branch protection is enabled.
2. Do not commit passwords, private keys, `.env.local`, or production credentials.
3. Test changes in staging or a safe preview environment before production.
4. Do not alter production payment, identity, database, or deployment settings without written owner approval.
5. Keep each release reversible. Record the last known good release and rollback step.

## Mobile development and build safety

1. Start Expo development servers with `npm run start:private`. This keeps the local development server on the computer running it; do not expose Metro or Expo development servers to the public internet.
2. Use `npm run start:lan` only for a short test on a trusted private network. Stop the server when testing is complete; do not use a café, shared office, or other untrusted network.
3. Add application images and other build inputs through a reviewed pull request or from a trusted source. Do not build a branch containing unreviewed image files from an unknown sender.
4. Run `npm run audit:prod` before a mobile release and review critical findings first. Do not use `npm audit fix --force`, or downgrade Expo or React Native to make an audit count look smaller.
5. Recheck the Expo/Metro dependency chain at least monthly and after any supported Expo SDK maintenance update. Treat the current Metro image-parser and Expo configuration-tool findings as monitored build-tool exceptions until a supported upstream fix is available.

## Weekly owner check-in

Once a week, review these five questions:

1. Are there any critical or high security updates waiting?
2. Did any live service fail or send an error alert?
3. What changed in production, and was it tested first?
4. Who currently has access to this repository and its production services?
5. What decision is blocking the next safe improvement?

## Before any production release

Confirm all of the following:

- The change was reviewed in a pull request.
- Required automated checks passed.
- The key user journey was tested outside production.
- A rollback instruction exists.
- The owner approved the release.

## If something goes wrong

1. Stop further releases.
2. Roll back to the last known good release.
3. Preserve error information without sharing secrets publicly.
4. Tell the owner what happened, who is affected, and what is being done.
5. Record the fix and one action that will prevent a repeat.
