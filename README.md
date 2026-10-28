# Study Atlas

A Social Science study checklist with 204 main topics, 1,602 subtopics, notes, revision flags and prompts for research and weekend assessment. Start with [START_HERE.md](START_HERE.md) for Google AI Studio import and Firebase setup.

## Run

Node 24 recommended; Node >=22.12.0 supported by the build tool.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm start
```

Development listens on port 3000. The production server uses `PORT`, default 3000, and serves only `dist`. The build also writes `release/Study-Atlas.html`, a self-contained preview that works without an account. Fonts and the syllabus are bundled locally. The larger script contains the full syllabus and Firebase browser SDK.

## Configuration

`src/firebase-config.js` exports null by default. Replace it with your actual Firebase public web-app configuration; enable Google sign-in and Firestore, publish `firestore.rules`, and authorise the hosted domain. No server secret, Gemini key or service account is used. Use project-level Firebase configuration and Google Cloud usage controls appropriate to your hosting plan.

Account records: `users/{uid}/items/{id}`. Firestore rules validate ownership and record shape. The client additionally accepts only the exact bundled syllabus IDs. Progress is counted per subtopic; percentages are rounded. Dates and assessment boundaries use Asia/Kolkata. Completion dates survive notes/revision changes, clear when unchecked, and restart on a new completion. Imported valid completion dates are retained.

Transactions merge only changed fields against the latest remote record, so an unrelated note edit does not overwrite a concurrent completion change. Same-field edits use the last successful transaction. Cloud editing waits for a server snapshot and pauses offline. Failed changes roll back to confirmed data. The account generation guard rejects stale subscriptions and pending imports after an account changes. A local preview and each account remain separate; backups provide an explicit transfer path.

## Checks

`npm test` runs the pure data, progress, prompt, date, import and session tests. `tests/browser-check.cjs` is an optional end-to-end browser check. Install Playwright separately if not already available (`npm install --no-save playwright` and `npx playwright install chromium`), then run it against `npm start` with `node tests/browser-check.cjs`. `TEST_URL` can instead point to the single HTML using a file URL. Browser checks create screenshots under `verification`. Test previews use synthetic notes and do not sign in to an account.

Real Google sign-in and Firestore rules need project-backed testing after configuration. See [VERIFICATION.md](VERIFICATION.md). No project-backed test is implied by a successful build or session test.

## Content and assets

The topic wording and stable IDs are preserved from the revised Social Science Master Checklist v2. The full source registry and exam-boundary notes are in `src/data/syllabus.json` and visible in Sources & settings. NCERT/CTET/NET reference URLs are study references, not a claim that this expanded checklist is an official syllabus. The syllabus version is `2026-10-28-v2`; review the official sources when an exam cycle changes.

See [ASSET_CREDITS.md](ASSET_CREDITS.md) and `licenses` for font and style notices. Source components and icons were authored for this project. There is no tracking or advertising code.
