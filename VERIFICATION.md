# Verification record

Checked on 28 October 2026. This record describes local checks, not a live deployed Firebase test.

## Content fidelity

The bundled `src/data/syllabus.json` unit objects were compared directly with the revised master checklist export. All 34 units match, including topic titles, subtopic wording, IDs, source keys and scope notes. There are 204 main topics and 1,602 unique subtopics. History is one combined checklist across 11 units, including the ten NET units and school world-history additions.

## Automated logic checks

Node's test runner: **14 passed, 0 failed, 0 skipped**.

- Exact counts and uniqueness of the full dataset.
- Exact-ID, concept and Hindi search with the correct parent topic.
- Completion/revision totals ignore unknown IDs.
- Completion timestamps survive note/revision changes, clear on uncompletion and renew on recompletion.
- A notes dialog patches only the fields changed by its user.
- Inclusive Asia/Kolkata date boundaries, invalid/inverted ranges and exclusion of unchecked/future items.
- Research prompts include the selected IDs and official reference URLs.
- Weekend prompts include only eligible completed IDs.
- Unicode backup round trip and rejection of incompatible IDs, dates, types or oversized notes before import.
- Account-session invalidation, stale snapshot rejection and write refusal during loading, offline, error and signed-out phases.

## Browser checks

The production build was served through the included Node server. The downloaded single HTML was also opened directly. Both completed the browser check with no page errors.

Checked at desktop width 1,440px and phone widths 390px and 320px:

- Overview, syllabus, topic, weekend review and sources/settings routes.
- Exact searches for H004.04 and HI002.01; correctly rendered Hindi notes/text.
- Checking a subtopic, saving notes/revision state and retaining them after reload.
- Exact research and weekend prompt scopes; unchecked neighbouring IDs excluded.
- Invalid date range message and disabled assessment action.
- JSON backup download, invalid import rejection, valid import merge and preserved completion date.
- Honest setup notice from unconfigured Google sign-in.
- Independent empty preview in another browser context.
- Mobile navigation and Escape, native modal operation, search keyboard shortcut, visible focus and no horizontal page overflow.

Desktop overview, desktop topic, desktop settings, phone overview and phone topic/notes screenshots were produced and representative screens inspected. Browser checks used synthetic notes in isolated test contexts. These notes and test progress are not included in the app's initial data or source package.

## Build and assets

The Vite production build and self-contained HTML packaging succeed. The build reports a large-script advisory because it contains the complete checklist and Firebase SDK. The standalone HTML is approximately 2.3 MB including local fonts, syllabus, code and licence notices. Font hashes were checked before copying; OFL and dependency notices are retained. The shared-library style capture succeeded with passed recorded colour-pair contrast checks (`captured-slate-study-workspace-e9cf883cd992`). That contrast result covers the recorded token pairs, not every possible UI state.

## Owner setup and checks still required

- Supply a Firebase project's public web configuration; enable Google sign-in and Firestore.
- Publish the supplied Firestore rules. The rules were reviewed locally; no emulator-backed rules test was run because a Java runtime was not available in the working environment.
- Authorise the exact preview/published hostnames.
- Test real Google sign-in and sign-out, same-account sync on two devices, account switching and denied access to another account's records.
- Publish from the owner's Google AI Studio account and check any hosting/Firebase billing choice there.

No Firebase project, deployed database, external hosting site, paid service or model API connection was created during this task.
