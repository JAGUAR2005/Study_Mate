# StudyMate AI — AI Safety and Quality Controls

## Product position

StudyMate AI is a study aid, not an authority. Generated content must be presented as editable assistance and remain linked to the selected source passage.

## Input controls

- Reject empty or extremely short selections; warn below 10 characters.
- Limit PDF size to 20 MB for the MVP.
- Detect missing text layers and explain that scanned PDFs require OCR.
- Avoid sending unrelated pages or private data to the model.

## Output controls

- Use structured schemas for quizzes and visuals.
- Require a source-grounded response when the action depends on the passage.
- Display uncertainty or failure instead of inventing missing context.
- Let users edit, regenerate, correct, or delete every AI field.
- Preserve user thoughts and custom edits during regeneration.

## Privacy and security

- Never expose API keys in the browser.
- Apply authenticated ownership checks and Supabase RLS.
- Do not use real student records or sensitive documents in screenshots or fixtures.
- Provide deletion paths for uploaded PDFs and saved notes.
- Keep analytics minimal and avoid collecting document contents unless required.

## Evaluation set

Before submission, test at least:

- A clean text PDF
- A long technical passage
- A short/ambiguous selection
- A PDF with no usable text layer
- A model timeout or malformed response
- Regeneration after user edits

