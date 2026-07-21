# StudyMate AI — Test and Verification Plan

## Smoke test

1. Start from a clean checkout using only README instructions.
2. Configure values from `.env.example` without committing secrets.
3. Sign in or use the documented demo account.
4. Upload the sample PDF.
5. Open the reader, select text, run an AI action, and inspect the result.
6. Edit the result, save it, find it in Notes, and review it.

## Functional checks

- Upload validation and progress
- PDF page navigation and text selection
- All six AI actions
- Source passage and page metadata
- Visual rendering and fallback state
- Save, edit, delete, search, filter, and tag flows
- Regeneration preserving user-authored content
- Cloze review interaction

## Quality checks

- Loading, empty, error, and retry states
- Keyboard navigation and readable contrast
- Desktop and mobile layout
- Unauthorized access and ownership boundaries
- Malformed AI output and provider timeout handling
- No secret values in client bundles, logs, or repository history

## Release evidence

Record the date, environment, commit, test result, and known limitation for each release candidate.

