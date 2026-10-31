# Assessment repair implementation plan

Goal: implement the accepted review in the current app and add distinct, correctly categorised practice papers.

Architecture: keep React/Vite. Isolate validated persistence and paper construction from UI components. Store immutable attempt snapshots and resumable drafts. Work on independent UI and content files concurrently, then integrate and verify the production build.

Spec: `spec.md` in this folder. Authority: the user's explicit instruction to implement the review and add proper tests/sub-sections.

## Tasks

- [x] Builder-check the specification; resolve routine interface questions from the code and report.
- [x] Write red tests for draft recovery/deadlines, immutable results, failed writes, malformed question imports, bank uniqueness/quotas and ancient-only selection.
- [x] Implement the persistence engine with legacy migration, schema validation, full backups and immutable snapshots.
- [x] Implement latest-state, absolute-deadline automatic submission and persisted navigation.
- [x] Expand school/CTET and NET banks with explicit topic/unit metadata and actual comprehension passages.
- [x] Build a deterministic catalog with distinct questions per paper, balanced options, honest overlap and useful subject/unit sub-sections.
- [x] Repair mobile exam/results, scrolling forms, modal keyboard behaviour, legends and labels.
- [x] Wire hub resume/history/backup/import and honest account state; retain no-retest behavior.
- [x] Refresh package lock, source/coverage docs, asset notices and actual assessment browser checks.
- [x] Verify all tests, production build, phone/desktop flows, content audit and preserved legacy data.
- [ ] Capture any resolved new reusable style; upload verified changes with a branch-head lease and republish the existing app if account access permits.

Review focus: legacy records missing snapshots; quota/storage failure; a deadline expiring during reload/import; same question with a different label; low-content pools that cannot meet a full blueprint; sign-out/late writes from another account; mobile form keyboard and focus; preserving the user's current work during publication.
