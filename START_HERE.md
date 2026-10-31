# Use Study Atlas Assessment

Choose NCERT, CTET or UGC NET. Use the sub-section buttons, topic/unit filter and “30 minutes or less” to find focused work. Search matches titles, topics and units across all streams. “Topics & paper details” shows the scope and marking of each paper.

Start Test begins the original deadline. Choosing an answer saves it; Mark for Review retains the answer for scoring. Save & Exit and refresh preserve the sitting, but do not pause the timer. Resume an expired draft to submit its stored responses. After completion, View results opens the saved paper, choices, explanations and topic references. The same paper cannot be retaken.

Use Download progress before clearing browser storage or changing devices. Restore progress previews the file before merging. Existing completed results and saved sittings are retained. An expired imported sitting keeps its original deadline. To revise a custom paper, import it with a new ID.

Add a test accepts validated JSON or a visual form. Each question needs four distinct options and an answer index 0–3. Sources, explanations, passages and syllabus IDs can be supplied in JSON. Exported papers contain questions and keys but no progress; Download progress is the full backup.

## Existing Google AI Studio app

The connected repository is krishnamahato704-spec/Syllabus, branch main. Pull/sync repository updates into the existing app, build, check Preview and then Republish to the existing syllabus-1.ai.studio URL. Do not create a second app or overwrite unrelated Studio changes. The Node 24 Dockerfile builds with the committed package-lock.json.

The application does not call Gemini or another model API. Do not add a model key to source code. The standalone release/Study-Atlas.html can also be opened locally for browser-only practice; production should use the built project.

## Optional Firebase sign-in and device sync

Current configuration: null in src/firebase-config.js. Without configuration the UI states that progress is stored in this browser. No working account sync is implied.

To activate an existing owner-controlled Firebase project:

1. Register a web app and place its PUBLIC web configuration in src/firebase-config.js. Never paste an Admin SDK/service-account key or model API secret there.
2. Enable Google sign-in in Firebase Authentication. Add syllabus-1.ai.studio, the actual Studio preview hostname and localhost (for local testing) to authorized domains as needed.
3. Enable Firestore in the selected project. Deploy the included firestore.rules to that same project, preserving any unrelated application rules. Each user is limited to users/{uid}/assessmentRecords; completed result records cannot be replaced or deleted by the client.
4. Build and test with two owned accounts, two devices and offline/reconnection. Verify owner isolation and rules in the Firebase emulator before relying on sync.
5. Republish after the account tests pass.

Guest progress stays in a separate browser scope. Transfer it deliberately: download a guest backup, sign in, restore the backup, then wait for sync to settle. Each record must stay below 600 KB in UTF-8. Very large custom papers can still be used locally with backups; the UI reports cloud size failures.

A newer edit of the same sitting can be adopted on another device. Different starts, paper versions or same-time conflicting edits are rejected. The first cloud completion is immutable; keep local backups to inspect any conflict. The app has no administrator conflict-resolution interface and does not claim proctoring security.

