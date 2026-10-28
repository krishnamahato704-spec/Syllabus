# Study Atlas specification

Date: 28 October 2026

## Intended result

Turn the user's revised Social Science checklist into a working website that can be imported into Google AI Studio and published by the user. Preserve the 204 main topics, 1,602 subtopics, exact IDs, four-part structure and combined History course. The user explicitly chose sign-in and progress synchronisation between phone and computer.

## Project principles

- The existing checklist is the content authority. Do not regenerate, shorten or renumber it.
- Completion means the learner has studied and checked a subtopic. Supplying notes or an AI prompt never automatically completes it.
- Keep account data private to its owner. Do not display one account's progress in another account or in preview mode.
- Never describe an unconfigured or failed cloud connection as saved/synchronised.
- Provide a readable desktop/mobile interface, keyboard access and usable Hindi text.
- No paid AI calls or embedded model credentials are necessary for the requested workflow.

## Approaches considered

1. Browser-only storage: portable, but does not satisfy the user's chosen cross-device requirement.
2. Google sign-in with Firebase Authentication and Firestore: fits the user's Google AI Studio publishing destination and provides real account-bound live updates. Selected implementation approach.
3. An independent hosted backend: possible, but introduces another service without a task-specific benefit.

The user selected cross-device sign-in. Firebase and the interface details are implementation choices, not claims of user-approved branding or an already provisioned cloud project.

## User journeys and acceptance criteria

1. Browse the four parts and subjects. History appears once, with all ten NET units and school world-history additions.
2. Search a title, concept or exact subtopic ID. A matching subtopic retains its parent topic/unit context.
3. Open a topic, read its individual subtopics and mark an item studying or complete. Progress totals derive from the actual records.
4. Add a note or a revision flag to an individual subtopic. Revision does not silently erase its previous completion record.
5. Sign in with Google on a configured deployment. Changes to one subtopic appear in another authenticated session for the same user.
6. Sign out/switch accounts without exposing previous-user data. Reject cross-user database access.
7. Copy research/review prompts for an exact topic or subtopic. Include its stable IDs, text and source links.
8. Build a weekend assessment prompt from completed items in an explicit India-time date range, with an optional earlier-completed revision pool. Never include unchecked items automatically.
9. Export a versioned JSON progress backup and the completed Markdown checklist. Validate schema, IDs, dates, types and note lengths before an import is applied.
10. Provide official source links, current exam distinctions and the source verification date.
11. Run without Firebase configuration as clearly labelled preview mode. Google sign-in must explain that setup is required rather than simulate authentication.
12. Deliver a source ZIP, a directly viewable HTML preview and instructions for Firebase setup, GitHub import into AI Studio and publishing.

## Data and boundaries

Syllabus: immutable bundled units/topics/items and source metadata.

Progress per subtopic: status (not-started, studying, complete), needsRevision (boolean), notes (up to 4,000 characters), completedAt (ISO timestamp or null), updatedAt (server timestamp in Firestore).

Firestore path: users/{uid}/items/{subtopicId}. Only that authenticated UID may read/write. Client imports additionally whitelist the exact 1,602 IDs.

Concurrent changes to different fields of a subtopic merge using a Firestore transaction. Writes require a loaded, online cloud session; failed writes restore the confirmed state. No claim of offline cloud saving is made. Per-user snapshots and asynchronous callbacks are isolated by a session generation token.

Preview data is stored under a separate browser key. Signing in does not silently import preview data into an account. A downloaded backup may be explicitly imported.

Imports merge into the current account; they never replace the whole account. Validate the complete file before the first write. Capture the UID/session generation for the entire import, stop remaining writes on an account change, and report the number successfully saved if a cloud failure interrupts the import. Retrying the same backup is safe. Imports are not described as atomic across documents.

Completion dates are set on a transition to complete, preserved for notes/revision edits, cleared on uncompletion and renewed on recompletion. Imports preserve validated completion dates. Sign-out, account loading and sync errors disable mutations immediately.

Rules require the exact allowed fields, a recognised status, boolean revision flag, bounded notes, completion date string/null and server update timestamp; all other database paths are denied by default. The downloadable single HTML is a preview; live Google authentication requires the configured project on an authorised HTTP(S) origin.

## Publication boundary

The request is to prepare files the user can upload and publish. Do not create a paid account, provision billing, publish externally or invent Firebase configuration. Supply complete integration code and setup instructions; distinguish local/emulated verification from a real deployed Google account test.

## Design

Use the shared Slate interface palette as a starting point, Source Sans 3 for controls/body, Source Serif 4 for restrained page headings and Noto Sans Devanagari for Hindi. Use a left navigation rail, clear topic lists and a focused topic workspace. Real zero-progress data is the initial state. No invented achievements, example completions or testimonials.

## Verification

Compare all IDs/text with the source export; test meaningful date, import, completion and prompt-scope cases; build production output; exercise desktop/mobile browser flows, storage, search, notes, prompts, backups and error states. Test Firestore rules in an emulator if a Java runtime is available. A real Firebase sign-in/sync test requires the user's project configuration and is otherwise an explicit handoff item.
