# Task checklist

- [x] Inspect the revised syllabus and current Google AI Studio/Firebase documentation.
- [x] Record the user's cross-device sign-in preference and the implementation specification.
- [x] Export and audit the full syllabus data: all 34 units match the source export exactly.
- [x] Implement and test study/progress/import/prompt logic: 14 logic/session tests pass.
- [x] Implement Firebase authentication, live records and security rules. Live project verification is an owner setup item below.
- [x] Build the responsive tracker interface and accessibility states.
- [x] Prepare production hosting and single-file preview builds.
- [x] Write Google AI Studio and Firebase setup/publishing instructions.
- [x] Verify browser flows, content fidelity and build output on served and single-file previews, including 320px and 390px phone widths.
- [x] Save the reusable web style (`captured-slate-study-workspace-e9cf883cd992`) and package the final files.

Owner setup: supply Firebase web configuration, enable Google authentication, create Firestore, publish its rules, authorise hostnames, test real sign-in/two-device sync and publish in the owner's account. No project-backed authentication/rules test is claimed. See `VERIFICATION.md`.
