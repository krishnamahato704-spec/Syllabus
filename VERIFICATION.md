# Assessment repair verification

Verified 31 October 2026, India time. Working source is the assessment repair, based on remote main commit 266062946096c9b4c18ce2a9d8718b0462f34754.

## Evidence

- Node 24.22.1; clean npm dependency installation succeeded and package-lock.json is included.
- Full Node test suite: **74 passed, 0 failed, 0 skipped**.
- Production build: exit 0. dist/ and the self-contained release/Study-Atlas.html were generated with font/dependency notices.
- Production-browser expiry regression: a saved correct response remained correct at automatic timeout.
- Production-browser workflow: refresh/resume retained the deadline, navigation, answers, flags and option order; manual submission saved the snapshot; completed papers remained read-only after reload; invalid JSON keys were rejected before mutation; a full backup restored a saved sitting in a fresh context.
- Browser layout checks at 320 and 390 pixels: no page-level overflow, full question width with the navigator closed, working drawer and Escape. Desktop checks at 1440 pixels passed.
- Component browser checks: named dialogs, focus containment and return, Escape, labelled form fields, reachable mobile footer, independent correct keys after deleting/adding questions, legacy/source labels and readable result layouts.
- Content audit: **73 papers, 570 bank questions, 570 distinct normalized stems, 570 reachable questions**. 15 NCERT, 24 CTET, 34 NET. Every paper validates, has unique question IDs/stems and four distinct options. Correct-option positions are balanced and shuffled without a repeating A/B/C/D cycle.
- CTET full forms: 30/30/30/60 sections, 15/15 language splits, exact two-passage compositions, 15/5/10 CDP split and 40/20 SST split. NET: all ten units, with the app's History weighting disclosed. Ancient drills contain units 1–2 only.
- Original syllabus retained: 204 topics, 1,602 distinct subtopics.
- Project-specific style capture succeeded: captured-study-atlas-assessment-workspace-e87641ac03fe, separate from the general Slate theme; recorded contrast checks passed.

## Reproduce

Run npm ci, npm test and npm run build with Node 24. Serve dist using npm start. Set TEST_URL to that server and run:

    node tests/assessment-browser.cjs
    node tests/assessment-flow-browser.cjs
    node tests/ui-check.cjs
    node scripts/assessment-audit.mjs

Browser scripts accept PLAYWRIGHT_MODULE and CHROME_PATH for an existing local Playwright/Chromium installation. Tests use isolated browser contexts. The source scripts live in tests/; screenshots and machine audit output are generated under ignored verification/. No live user attempts were modified during testing.

## Limits

The Firebase web configuration remains null. Null-config behavior, record validation, UID generation guards, immutable attempt planning, stale draft protection and conflict rejection pass automated checks. **Live sign-in, real multi-device sync and Firestore rules in an emulator have not been verified**, because no project configuration/emulator was supplied. Cloud status therefore remains honest. Backups can transfer browser-local progress.

Legacy attempts predate question snapshots. Their stored score is preserved, fake percentiles are removed, and the available historical paper is shown with an explicit warning. It cannot prove the original option order.

Question keys received editorial review and sampled independent checks, not external examiner certification. Difficulty is not calibrated. Topic-source links may point to broad reading; source-note files document inaccessible/time-limited references. The bank samples the syllabus and forms share questions.

The build reports a large-bundle warning and harmless lucide module-directive notices. The standalone artifact includes fonts, syllabus data, legacy reconstruction and the Firebase browser SDK (about 2.8 MB before compression). No performance claim on low-bandwidth phones or assistive-technology certification is made. The no-retest lock and timer are client-side practice controls, not proctoring.

## Publication

The tested source is intended for the existing repository and existing syllabus-1.ai.studio deployment. Publication is verified separately by checking the new build identifier, question/paper counts and live page after AI Studio Republish. Repository/hosting success must not be inferred from the local checks above.

