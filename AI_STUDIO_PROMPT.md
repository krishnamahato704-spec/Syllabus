# Maintain the existing assessment application

Use the existing React/Vite project and existing published URL. Do not rebuild the old tracker or restore PG History. Do not regenerate questions by adding mock numbers to identical stems. Keep src/data/legacy-tests-data.js and old banks unchanged: they reconstruct the available historical paper for pre-snapshot results.

Before republishing, run npm ci, npm test and npm run build with Node 24. Run the assessment browser tests against the production build. Preserve src/firebase-config.js and keep cloud status honest; null means browser-local with downloadable backups. No model API is required.

The active catalog is src/data/tests-data.js. Authored banks are school-questions.js and net-questions.js. Each question has a stable ID, four different choices, keyed index, explanation, section, unit, topic, type and topic-reference URL. Questions may repeat across forms, never within a paper. Keep real passages with their questions and obey the CTET two-passage compositions. NET History equal-unit quotas are app practice choices.

Completed attempts preserve their own question/option snapshot. Keep the original deadline for drafts. Do not reset or silently clear old browser data. Use new IDs for revised papers; preserve locked results. See specs/assessment-repair and VERIFICATION.md for scope and limitations.
