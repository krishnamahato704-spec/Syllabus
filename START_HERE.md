# Use your Study Atlas webpage

## Try it first

Open `release/Study-Atlas.html` in Chrome, Edge or another modern browser. It contains the entire checklist and fonts, so the preview does not need an internet connection. Start from Overview or Syllabus.

- Search by a subject, concept or original ID, such as `H004.04`.
- Open a main topic to see every subtopic and its completion box.
- Use **Research this topic** to prepare a prompt for your AI chat. A prompt is also available for each individual subtopic.
- Add your notes and use **Check my understanding** to prepare a review prompt. You decide when an item is complete after studying and checking your understanding.
- Use a revision flag for material you need to revisit.
- On **Weekend review**, choose dates and build a question prompt from completed subtopics. Copy it into your AI chat. The app itself does not call an AI service or generate questions.
- Download backups from **Sources & settings**. The full checklist and your completed checklist can also be downloaded as Markdown.

The source checklist has 204 main topics and 1,602 subtopics. History is one combined course. CTET pedagogy remains separate because subject knowledge does not replace learning how to teach it. Official reference links and exam structures are inside Sources & settings.

## Connect sign-in and syncing

The supplied page starts in **preview mode**. Preview progress stays in the current browser. Google sign-in and cross-device sync are implemented in the source, but they need your Firebase project configuration before they can work. No Firebase project or account has been created for you.

You can give `AI_STUDIO_PROMPT.md` to Google AI Studio along with this project. These are the steps that still need your own account:

1. Open the [Firebase console](https://console.firebase.google.com/) and create a project, or choose your existing project. Register a **Web app** in Project settings. Copy its public web configuration.
2. Open Authentication, choose Sign-in method and enable **Google**. Set the support email if asked.
3. Create a **Cloud Firestore** database. Choose the database region carefully. Use production rules, then replace the Rules editor contents with the supplied `firestore.rules` and click Publish. Do not leave the database in public test mode.
4. Edit `src/firebase-config.js`. Replace the `null` export with the exact public configuration object supplied by Firebase. Keep the export named `firebaseConfig`. Do not use a service-account key or an Admin SDK credential.
5. In Authentication → Settings → Authorised domains, add the exact hostname of your published app. For example, take only the hostname between `https://` and the next `/`. Add your preview hostname too if you want to sign in there. Do not use a wildcard or include the protocol. New Firebase projects may need `localhost` added explicitly for local testing.
6. Rebuild or ask AI Studio to rebuild the page. Use **Sign in with Google**. If a browser blocks the pop-up, allow it for the app.
7. Complete one subtopic on your computer, then open the same published address and sign in to the same Google account on your phone. Confirm it appears there. Change a note on your phone and confirm it reaches the computer.

Each account has its own records under `users/{uid}/items/{subtopicId}`. The supplied rules allow a signed-in user to read and change only their own progress. Notes are stored as plain text in your Firebase project, not end-to-end encrypted. Cloud editing pauses while offline and shows when a change is still saving or has failed.

To move work from preview into your account: export a preview backup, sign in, then import it. The app never silently transfers a browser's preview work into another person's account. An import merges matching IDs; records in the backup replace those IDs' status, notes, revision flags and completion dates. Records absent from the backup stay as they are. The full file is validated first. Cloud imports save records one at a time, report partial progress on interruption and can be retried.

## Bring the project into Google AI Studio

Google's documented source import route is **GitHub**. A ZIP is provided to move the files easily; do not rely on ZIP upload as a supported project-import method.

1. Extract `Study-Atlas-Source.zip`.
2. Create a GitHub repository in your own account. Upload the contents of the `study-atlas` folder, so `package.json` and `index.html` are at the repository's root. Include the `src`, `scripts`, `licenses` and other source files. Do not upload `node_modules`.
3. Open [Google AI Studio](https://aistudio.google.com/), go to Build, and use **Add files (+) → Import from GitHub**. Connect/select the repository. If your interface differs, follow the [current official Build guide](https://ai.google.dev/gemini-api/docs/aistudio-build-mode).
4. Give AI Studio the text in `AI_STUDIO_PROMPT.md`. Ask it to run the existing project and keep the syllabus JSON unchanged. You can supply your public Firebase web configuration there or edit the file in its Code tab.
5. Test the page in preview. When ready, use **Publish** and follow the [official publishing guide](https://ai.google.dev/gemini-api/docs/aistudio-deploying). Review the hosting plan and any billing screen before accepting it. Availability of a free Starter Tier depends on your account and the platform's current conditions. Firebase has its own usage limits and charges.
6. Add the published hostname to Firebase's Authorised domains, then test sign-in and syncing on two devices again. A published app uses a different browser origin from a local preview, so preview progress needs a backup transfer.

No Gemini or other AI API key is needed for the supplied app. It prepares text you paste into the AI service you choose. If AI Studio offers to add paid AI services, they are optional and outside this app's requirements.

## What has and has not been checked

The included checklist data, completion logic, prompt selection, backup validation and account-session guard have automated checks. Browser checks cover the interface, local preview persistence, Unicode notes, backup download/restore, mobile layout and the setup notice.

Live Google sign-in, Firestore rules deployment and sync across real devices still need to be tested after you connect your Firebase project. The included `VERIFICATION.md` records the actual checks performed.

## Official setup references

- [AI Studio Build and source import](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [AI Studio publishing](https://ai.google.dev/gemini-api/docs/aistudio-deploying)
- [Firebase web setup](https://firebase.google.com/docs/web/setup)
- [Google sign-in on the web](https://firebase.google.com/docs/auth/web/google-signin)
- [Firestore live updates](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firestore account-based rules](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firebase Authentication troubleshooting and authorised domains](https://firebase.google.com/docs/auth/faq-and-troubleshooting)
