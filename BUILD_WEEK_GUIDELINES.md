# OpenAI Build Week — Working Guidelines

This file keeps the project aligned with the current Build Week challenge requirements. The official rules remain authoritative and must be checked before submission.

## Verified challenge requirements

According to the [official Build Week page](https://openai.com/build-week/), the project is expected to be built with Codex and GPT-5.6. The [official Devpost rules](https://openai.devpost.com/rules) and [FAQ](https://openai.devpost.com/details/faqs) require or describe the following:

- Submit a working project built with Codex and GPT-5.6.
- Select one challenge category; StudyMate AI currently fits **Education**.
- Provide a clear written project description.
- Provide a public YouTube demonstration video under three minutes, with audio, showing what was built and how Codex and GPT-5.6 were used.
- Provide a repository URL for judging/testing. It must be public with appropriate licensing, or shared privately with the addresses specified by Devpost.
- Include setup instructions, sample data where needed, and clear run instructions in the README.
- Explain where Codex accelerated the workflow and where key product, engineering, or design decisions were made.
- Preserve the primary build thread's `/feedback` Codex Session ID for submission.
- Make the project available free of charge and without testing restrictions through the judging period; provide credentials if access is private.
- If the project existed before the event, document what was created during the event and retain evidence such as timestamps, session logs, and commit history.

## Do

- Use Codex throughout implementation and retain a concise build log.
- Use GPT-5.6 for meaningful product functionality, not only for a cosmetic demo.
- Keep commits small and descriptive so the build timeline is auditable.
- Record decisions, tradeoffs, prompts, evaluations, and known limitations.
- Make the demo path deterministic with seeded/sample content and a fallback when external services are unavailable.
- Show source transparency, editable output, and error handling in the demo.
- Keep API keys server-side and use environment variables only.
- Cite or license third-party assets, libraries, and sample content appropriately.

## Do not

- Do not claim features that are not working in the submitted build.
- Do not expose API keys, service-role credentials, private user data, or secrets in Git, screenshots, logs, or the demo.
- Do not use copyrighted PDFs, images, music, or trademarks in the public demo without permission.
- Do not make unsupported claims that AI output is authoritative or error-free.
- Do not silently overwrite user-authored notes during regeneration.
- Do not rely on judges having paid accounts, local secrets, or undocumented setup steps.
- Do not add scope that weakens the end-to-end MVP before the submission cutoff.

## Project evidence to retain

- Git commit history with dates and meaningful messages
- Codex build-thread/session reference and `/feedback` Session ID
- Prompt and model-routing decisions
- Test results and known limitations
- Demo script, recording, and final repository state

## Important dates currently published

- Submission deadline: **July 21, 2026 at 5:00 PM PDT**
- Judging period: **July 22–August 5, 2026**, per the Devpost rules

Dates and requirements must be rechecked on Devpost immediately before submission.

