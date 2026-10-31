# Assessment repair and expanded practice bank

Authority: the user asked to implement the critical review, add tests properly and add useful sub-sections. The accepted review is `output/reviews/syllabus-2026-10-30/Assessment-App-Critical-Review-2026-10-30.md`. This specification makes those repair decisions executable; it does not reopen the rejected old checklist design.

## Outcome

Keep the React/Vite assessment app and its NCERT, CTET and NET History streams. Repair answer loss, refresh recovery, import validation, immutable attempt history, mobile layouts, clipped forms, misleading statistics and packaging. Expand authored practice questions, build papers without within-paper repeats, add subject/unit filters, and state paper overlap and coverage honestly.

Preserve stored attempts and custom papers where recoverable. Retain the user's no-retest policy for scored sittings, with read-only solutions. Do not restore PG History. Use Study Atlas as the app identity. Preserve the familiar blue desktop exam layout, local Source Sans/Source Serif/Noto fonts and their notices; mobile questions must occupy the available width.

## Observable acceptance

- A correct answer selected before deadline is scored correctly on automatic submission, exactly once.
- Answers, review flags, section, navigation and absolute deadline survive refresh; resuming after expiry submits the stored responses.
- A submission cannot be labelled saved if persistence fails. An immutable paper snapshot and option order accompany each new attempt.
- Versioned JSON backup/restore includes custom papers, drafts and attempts; malformed imports are validated fully before mutation.
- Existing browser-only history remains readable. Legacy records without a known historical paper version are labelled honestly.
- Each active paper has unique canonical question IDs and unique normalized stems, valid four-choice keys and consistent marks/sections. Options are deterministically shuffled and stored with each sitting.
- There are more useful papers than the current 53, without padding small pools into large repeated tests. A paper's actual question count is displayed. Cross-paper reuse is disclosed.
- CTET full papers contain CDP 30, English 30, Hindi 30 and SST 60. Languages contain 15 comprehension and 15 pedagogy items with actual original passage sets. SST balances content 40/pedagogy 20 where sufficient tagged material exists. No incomplete paper is advertised as a full mock.
- NET Paper I practice covers ten units with five questions per unit in full papers. History papers balance the ten syllabus units as an app practice choice, not an official fixed quota. Ancient papers contain ancient questions only.
- NCERT has History, Geography, Civics and Economics sub-sections; CTET has CDP, English, Hindi, SST and useful topic drills; NET has Paper I units and History units/domains.
- Records label authored practice and topic references honestly. Remove invented percentiles, unsupported official-key verification claims and third-party branding.
- At 390px and 320px widths the exam question remains readable, the palette is a closed-by-default drawer, results stack, and all modal controls are reachable by scrolling and keyboard.
- Package lock, build/serve instructions, runtime tests and browser tests describe the active assessment app.
- Publish the verified changes to the existing repository/site within the user's authorization. Do not create paid resources. Cross-device sync needs the owner's actual Firebase configuration; never simulate an account connection.

## Architecture and interfaces

Keep existing component boundaries. Root implementer owns `src/test-engine.js`, `src/App.jsx`, `src/components/TestbookExamInterface.jsx`, the paper catalog/generator and account adapter. UI worker owns `src/styles.css`, `src/components/AddTestModal.jsx`, `src/components/TestAnalysisView.jsx` and accessible modal helper. Content workers own new school and NET bank files respectively.

Question contract for new canonical banks: `{id, section, domain, unit, topic, kind, question, options:[four strings], correctAnswer:0..3, explanation, difficulty:'Moderate'|'High', source:{name,url}, syllabusIds?:string[], passage?:{id,title,text,type:'prose'|'poem'}}`. `source` is labelled a topic reference unless it directly substantiates the answer; original passage questions use the supplied passage as evidence. `section` is `all`, `cdp`, `lang1`, `lang2`, `sst`, `p1` or `p2`. `unit`/`domain` are stable documented slugs.

New school bank exports `SCHOOL_QUESTIONS`; new NET bank exports `NET_QUESTIONS`. Workers may adapt existing bank arrays with explicit reviewed metadata but must not create fake novelty by numbering duplicates. Root catalog supplies public papers and source/coverage summaries.

AddTestModal keeps `onClose/onTestAdded`; imports call the stricter existing engine function. TestAnalysisView consumes `{test,attempt,onBackToHub}` and must use `attempt.testSnapshot || test`, warn for legacy records, show marks/accuracy/coverage without percentile, and expose source references. No cloud claims in components.

Scored attempts remain immutable. An interrupted draft can resume; a completed sitting opens solutions. Current app state must distinguish browser-local progress, pending cloud writes, confirmed cloud sync and failures.

## Approach

Repair the current app in place. A wholesale rewrite would discard the user's current exam flow and expand risk. A cosmetic-only repair would leave the observed scoring and content failures. Separate content, presentation and persistence tasks allow independent checks while keeping the app's existing stack.

## Validation

Write failing behavioral tests before fixes. Test known score fixtures, import rejection, bank quotas, normalized duplicates, wrong-domain leakage, migration, saving failures and draft deadlines. Browser-test actual selection → refresh → resume → expiry → results, manual submit, custom-form creation, mobile palette/results, modal focus/Escape, and full backup restore. Review new questions for answerability, plausible distractors and source/level labels. Do not claim official certification or a live Firebase test without evidence.
