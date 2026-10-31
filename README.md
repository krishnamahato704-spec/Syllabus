# Study Atlas Assessment

Practice papers and topic drills for NCERT Social Science, CTET Paper II (English I, Hindi II, Social Science) and UGC NET History. The original 204-topic / 1,602-subtopic syllabus remains in the downloadable backup. PG History is excluded from the active catalog.

The repaired catalog has **570 distinct authored questions and 73 papers**: 15 NCERT, 24 CTET and 34 NET. Each paper avoids repeated normalized stems; forms intentionally share a finite pool. Counts are checked by tests. Questions sample the syllabus and do not establish complete coverage or an official difficulty standard.

## Run

Use Node 24 (minimum 22.12). Run `npm ci`, `npm test`, `npm run build` and `npm start`. Development: `npm run dev`. The server uses PORT, default 3000; the Docker image uses 8080. The build produces dist/ and release/Study-Atlas.html, a self-contained local preview with bundled fonts and notices.

## What changed

- Absolute deadlines and the latest saved answers fix automatic submission. Refresh and Save & Exit retain navigation, review flags, questions and option order.
- A completed sitting keeps its exact paper snapshot. It stays read-only; later bank edits cannot change its review. Legacy marks remain unchanged with an explicit snapshot limitation.
- Progress export/restore includes custom papers, drafts and completed attempts. Imports validate the whole batch before writing. Storage failures remain visible and allow response/recovery downloads.
- Real reading passages, CTET content/pedagogy quotas, NET unit drills and correctly routed ancient questions replace padded mock generators. Answer positions are balanced and shuffled per sitting.
- Phone layouts use a question drawer, readable results and scrollable forms. Dialogs have names, focus containment, Escape and focus return.
- Percentiles and readiness predictions are removed. The app reports marks, attempted-question accuracy and section results.

See [coverage and source notes](specs/assessment-repair/coverage.md), [verification](VERIFICATION.md) and [setup](START_HERE.md).

## Sign-in and storage

`src/firebase-config.js` is **null**. This deployment is honestly browser-local until the owner connects a Firebase project. The optional assessment adapter and owner-only rules are included; live sign-in, cross-device transactions and rule-emulator behavior have not been verified without that project. Backups work without an account. The app uses no model API key.

Account data is scoped by UID. Guest data is never uploaded automatically. The adapter validates records, keeps first completed results immutable, stops old-account callbacks and rejects conflicting sittings. Concurrent use of the same paper on two devices should be avoided. Use a backup before transferring work; client-side storage is not a proctoring or tamper-proof system.

## Tests

`npm test` runs data, marking, draft, migration, backup, catalog, account-generation and cloud-planning regressions. Browser checks use Playwright with an installed Chromium:

```sh
node tests/assessment-browser.cjs
node tests/assessment-flow-browser.cjs
node tests/ui-check.cjs
```

Optional environment variables: PLAYWRIGHT_MODULE (module path), CHROME_PATH (browser binary), TEST_URL (served app, default http://127.0.0.1:4400). The UI harness starts its own Vite server. All browser tests use isolated test contexts and never edit live user progress.

Existing tracker files are retained as historical source and support the syllabus backup; the active application is the assessment workspace. Font and dependency notices are in licenses/ and ASSET_CREDITS.md.

