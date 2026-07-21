# StudyMate AI — Phase-Wise Implementation Plan

## Phase 0 — Foundation and controls

- Initialize the Next.js/TypeScript project.
- Add linting, formatting, environment validation, and a safe `.env.example`.
- Add the Supabase schema and access-policy plan.
- Establish the build log, decision log, and test conventions.
- Confirm the smallest end-to-end demo path.

**Exit gate:** the app boots locally, the repository is reproducible, and no secrets are committed.

## Phase 1 — Shell and library

- Add application layout, navigation, auth boundary, and library screen.
- Add PDF upload validation and storage integration.
- Add loading, empty, error, and unsupported-file states.

**Exit gate:** a user can upload and see a PDF in their library.

## Phase 2 — Reader and selection

- Render PDFs with PDF.js.
- Add page navigation and text selection.
- Add the floating action menu and source/page capture.

**Exit gate:** selecting text produces a stable, source-linked action request.

## Phase 3 — AI actions and workspace

- Implement the server-side AI endpoint and structured action contracts.
- Add the six MVP actions with validation and fallback errors.
- Add the editable workspace and visual renderers.

**Exit gate:** a selected passage can produce, edit, and save at least one complete study item.

## Phase 4 — Notes and review

- Add saved-note search, filters, tags, and deletion.
- Add cloze review and progress states.
- Add regeneration with field-level preservation.

**Exit gate:** saved material can be found, reviewed, edited, and regenerated safely.

## Phase 5 — Demo hardening and submission

- Add responsive polish, accessibility checks, and PWA basics.
- Test the clean setup from the README.
- Seed a safe demo dataset and verify the public deployment.
- Record the under-three-minute demo and complete the submission checklist.

**Exit gate:** a judge can understand and test the product without private assistance.

