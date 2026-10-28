# Study Atlas implementation plan

Goal: deliver the user's complete checklist as a usable, publishable study tracker with account-bound Firebase sync.

Architecture: React frontend built with Vite. A pure study-data module owns indexing, validation, progress calculations, India-time week selection and prompt generation. A Firebase adapter owns authentication, live snapshots and transactional writes. A small Node server serves the production build for Google AI Studio/Cloud Run. A packaging script also creates a single HTML preview.

Tech stack: React, Vite, Firebase modular JavaScript SDK; Node's built-in test runner; Playwright for browser checks. Use pinned versions after checking the package registry and include a lockfile.

Spec: `spec.md` in this folder.

## Global constraints

- Exactly 204 topics and 1,602 immutable subtopic IDs/text from the revised checklist.
- History has one combined course, not separate CTET/NET content lists.
- Private records at users/{uid}/items/{id}; per-subtopic transactions preserve independent field edits.
- Completion/research/review remain distinct; no fake cloud or AI responses.
- Date ranges use Asia/Kolkata calendar days.
- No model API integration, billing or deployment in this task.

## Implementation tasks

1. Export the checked syllabus/source metadata to `src/data/syllabus.json` and verify counts/text.
2. Write failing behavioural tests in `tests/study.test.mjs` for filtering, progress, date ranges, import validation and prompt scope; implement `src/study.js`.
3. Implement `src/cloud.js`, `src/firebase-config.js` and `firestore.rules`. Keep remote snapshots/account changes separate from preview data. Exercise rules with an emulator when available.
4. Implement `src/App.jsx`, `src/components.jsx`, `src/styles.css` and `src/main.jsx`: overview, syllabus search, topic workspace, weekly review, sources/settings and accessible dialogs.
5. Add the production server, Vite build, single-file packaging, project metadata and licensed fonts.
6. Write `START_HERE.md`, `AI_STUDIO_PROMPT.md` and Firebase/publishing instructions with verified official URLs.
7. Run domain/browser/build checks. Verify data fidelity, reload/backup behaviour, validation failures, keyboard/mobile layout and honest unconfigured-auth states.
8. Package the final source without node_modules or personal progress and open a local preview.

## Review focus

- Wrong-account snapshots or delayed writes must not affect a newly selected account.
- A broken import must not partially alter valid existing progress.
- Unknown IDs, invalid status/date types and oversized notes must be rejected.
- Date-range assessment scopes must exclude unchecked entries and handle India-time boundaries.
- Clipboard/storage/network/auth failures need readable, recoverable states.
- Honest limitation: live Google sign-in and two-device sync require the owner's Firebase configuration.
