# 🧠 Project Memory & Progress Log

This file acts as the project's changelog, tracking decisions, updates, and progress throughout the build week.

## [2026-07-17] - Project Initialization
- **Action:** Created core project documentation based on the master specification.
- **Files Created:**
  - `README.md` (Updated with full spec, moved roadmap out, removed env secrets)
  - `ROADMAP.md` (Extracted roadmap for Day 1-5 MVP and v2 features)
  - `PRD.md` (Product Requirements Document detailing features and hypothesis)
  - `ARCHITECTURE.md` (System architecture, database schema, AI hybrid routing strategy)
  - `DESIGN.md` (UI/UX aesthetics, glassmorphism, dark mode, core screen layouts)
- **Status:** Documentation phase complete. Ready to begin Day 1 technical setup (Next.js initialization, Supabase config).

## [2026-07-19] - Base Documentation and Build Week Controls
- **Action:** Added the pre-development documentation set for scope, phased execution, technical contracts, AI safety, testing, and submission readiness.
- **Files Added:**
  - `PROJECT_CHARTER.md`
  - `BUILD_WEEK_GUIDELINES.md`
  - `IMPLEMENTATION_PLAN.md`
  - `TECHNICAL_SPEC.md`
  - `AI_SAFETY_AND_QUALITY.md`
  - `TEST_PLAN.md`
  - `SUBMISSION_CHECKLIST.md`
- **Status:** Base planning package ready for review before implementation begins.

## [2026-07-19] - Study Engine Foundation
- **Action:** Implemented server-side Define, Translate, Visualize, and Note engines with structured response contracts, input validation, and Headroom-backed context compression.
- **Voice:** Added browser-native, language-aware playback for the selected passage and translated/generated content.
- **Safety:** API keys remain server-only; missing configuration returns an actionable in-product message rather than fabricated AI content.
- **Verification:** Production build passes. The no-key API route returns the expected `503` configuration response.

## [2026-07-19] - PDF Library and RAG Foundation
- **Action:** Added a private library upload route, authenticated signed-PDF reader route, server-side PDF extraction, page-aware chunking, embeddings, pgvector retrieval, and source-aware study actions.
- **Storage:** Added `supabase/schema.sql` for books, chunks, vector matching, storage bucket policies, and RLS.
- **Documentation:** Added `RAG_PIPELINE.md` describing ingestion, retrieval, privacy boundaries, and the next reader-selection enhancement.
- **Status:** Ready to activate after Supabase Auth/Storage and OpenAI environment values are configured.

## [2026-07-20] - Application Foundation and Gemini Activation
- **Action:** Initialized the Next.js/TypeScript application and delivered the first responsive StudyMate experience: landing page, Library upload surface, reader preview, preferences page, and private reader route.
- **AI Provider:** Added provider routing for Gemini and OpenAI. Gemini is the default low-cost path for generation and retrieval embeddings; OpenAI remains an optional provider.
- **Configuration:** Created `.env.local` locally, configured Gemini server-side, restarted the app, and verified a live Define action returns a successful response.
- **Upload Discoverability:** Added prominent `Upload PDF` entry points in the header and hero, both linking to `/library`.
- **Verification:** Production build passes and the local app is running with the Gemini-backed study engine.

## [2026-07-20] - Language Preferences and Annotation Engine
- **Language:** Added `/settings` for a persistent device-level preferred translation language. Reader actions inherit this preference and can override it per request; browser voice playback uses the returned translation language.
- **Annotation Design:** Implemented the non-obstructive annotation pattern: study aids attach to a selection, appear as compact end-of-passage icons, and open in a dedicated margin rail instead of covering source text.
- **Documentation:** Added `ANNOTATION_ENGINE.md` with placement, responsive behavior, attachment states, and accessibility rules.
- **Verification:** A live Define result was tested and confirmed to attach to the passage and surface in the margin rail.

## [2026-07-20] - Brand System Redesign
- **Logo:** Replaced the initial generic mark with `Threadmark`, a custom vector reading line that folds into a margin annotation and note dot.
- **Mascot:** Rebuilt `Mote` as a folded-paper reading companion with an open-book body, used in the product’s landing and preferences contexts.
- **Coverage:** Updated the shared identity across the landing page, Library, Reader, and Preferences screens.
- **Verification:** Production build passes; the refreshed identity has been visually reviewed in the local app.

## [2026-07-20] - Private PDF Reader and Reliability Pass
- **Reader:** Replaced the basic embedded-PDF reader with a document-first study workspace: page navigation, outline-style page list, full-book search, recent-page history, bookmarks, adjustable reading size, and a persistent insight dock.
- **Selection workflow:** The PDF text layer is now directly selectable. Define, Translate, Visualize, and Note open from the selection toolbar or dock without covering the source passage; generated aids leave compact markers at the passage edge.
- **Voice and languages:** Browser-native read-aloud is available for a selected passage or generated output, and translation language is selectable in the reader.
- **Reliability:** Replaced the fragile rewritten `pdf.worker` path with the PDF.js in-process worker module. Ingestion is page-by-page to keep memory bounded for large lecture packs. Size, text-extraction, session, upload, and expired-link failures now return human-readable recovery guidance.
- **Verification:** Production build passes. An anonymous private session was created and a text-based PDF was uploaded, indexed into 3 retrieval chunks, and opened in the redesigned reader. The reader's full-book search was exercised successfully.

## [2026-07-20] - Focus Reader and Visual Study Upgrade
- **Reader experience:** Rebuilt the PDF workspace around a quiet Apple Preview/Notion-style reading mode. The document owns the full viewport; Pages, search, history, bookmark, and reading-size controls are compact or on demand. The source canvas has its own viewport-safe scroll region, eliminating the clipped lower-content issue.
- **Selection-first study tools:** Define, Translate, Visualize, and Note now appear only after a reader selects text. Each successful aid attaches a compact clickable icon group to the exact selected paragraph rather than to the end of the page.
- **AI controls:** Added definition voices (`Clear`, `Professional`, `Friendly`, `Academic`) and an in-context target-language selector. Translation receives the selected language and definition generation receives the selected voice as part of its server-side prompt.
- **Visualize:** The study engine now returns both a linked concept/mind map and a concise infographic brief, rendered together in an on-demand result sheet rather than a permanent side panel.
- **Verification:** Production build passes. Live local checks confirmed the visualize schema (mind map + infographic), Professional define request, and Hindi (`hi-IN`) translation request all succeed with the configured Gemini provider.

## [2026-07-20] - Native PDF Page Renderer and Keyboard Navigation
- **Source fidelity:** Replaced the reflowed extracted-text page with a PDF.js canvas renderer and aligned selectable text layer. The reading workspace now displays each original PDF page—its real typography, tables, diagrams, spacing, and page geometry—while extracted text is used only for page search/navigation.
- **Navigation:** Added compact previous/next controls, direct page input, on-demand page outline/search/history, and Left/Right arrow-key page turning when the user is reading (keys remain available to form controls when those are focused).
- **Selection UX:** Rebuilt the selection bar into a responsive, two-row contextual menu so action labels, definition voice, and translation-language controls do not collide. Removed the redundant selection toast. Attached study-aid icons now use the selection's visual end position on the original PDF page.
- **Contrast:** Shifted the reader to a high-contrast cool-neutral workspace with a white source page, dark slate controls, and a restrained rust accent for clear state and action distinction.
- **Verification:** Production build passes. A four-page text PDF was uploaded, indexed, opened as a source-faithful canvas page, and navigated from page 1 to page 2 using the reader navigation controls.

## [2026-07-20] - Syllabus Mind Map Engine
- **Scopes:** Expanded Visualize from selected-passage diagrams to Page, Chapter/Topic, and Whole Book maps. The on-demand Map launcher keeps the reader uncluttered while making the three larger scopes discoverable.
- **Source selection:** Whole-book maps prioritise index/contents/syllabus-like chunks; books without an index use representative chunks distributed over all readable pages. Chapter maps use semantic retrieval and neighbouring-page expansion.
- **Output:** The engine returns a 2–12-node concept/syllabus map with directed relationships and an infographic brief. Larger maps use an expanded grid layout in the result sheet.
- **Reliability:** Added bounded retries for Gemini transient overloads (429/500/502/503).
- **Verification:** A four-page PDF generated a whole-book 11-topic syllabus map and infographic. A named `Academics Page` chapter map also generated successfully after a transient model-overload retry.
- **Documentation:** Added `SYLLABUS_MAP_ENGINE.md`.

## [2026-07-20] - Durable Reader Study Shelf and Markup
- **Persistence:** Page, chapter, and whole-book visual maps now save automatically in a private, device-local shelf for each book. `Map` → `Saved maps` restores a completed map after its result sheet is closed or the reader is reloaded.
- **Markup:** Added selection-driven Highlight, Underline, and Strikethrough actions. Marks are stored as source-page-relative rectangles, so they stay aligned as the reader size changes.
- **Loading feedback:** Added a page-render overlay and a three-step visual-map loader that explains grounding, connecting ideas, and rendering while the study engine is working.
- **Reader fit:** Increased the comfortable canvas width, reduced non-essential gutters, and contained scrolling within the workspace so the source page remains usable without clipped controls.
- **Verification:** Production build passes. A live page map was generated, closed, found in `Saved maps`, and reopened successfully.

## [2026-07-20] - Seamless Landing Marquee
- **Animation:** Rebuilt the principles strip as two identical, equal-width content groups. The track now translates exactly one group per cycle, so the loop remains filled across wide screens and does not reveal an empty tail at the repeat point.
- **Verification:** Production build passes after the marquee markup and CSS update.

## [2026-07-20] - Submission Hardening Pass
- **Library:** Added a server-backed private-library endpoint and persistent shelf. A returning anonymous session can now see and reopen its uploaded books instead of only the most recent in-memory upload.
- **Ingestion UX:** Replaced timer-simulated upload progress with streamed extraction, chunking, embedding, storage, and indexing events from the server.
- **Reader reliability:** A new selection closes an old study result; bookmarks and reading history persist with the private reading copy; unsupported browser voice playback now returns a recovery message.
- **AI quality:** Added runtime validation for all AI result shapes before rendering. Provider/network faults now return server-failure responses instead of being mislabeled as user input errors.
- **Visualize:** Rebuilt the map canvas as a dark, left-to-right hierarchy with curved relationships, focused root/leaf states, and a responsive bottom-sheet result surface at narrower widths.
- **Source coverage:** Whole-book map fallback sampling now distributes evidence through the book rather than filling the budget only with early pages.
- **Release controls:** Rewrote the README to match the actual product and privacy flow, made the Supabase setup SQL rerunnable, and replaced the interactive deprecated lint command with a repeatable type-check.

## Current Timeline Status — 2026-07-20
- **Completed:** Documentation, application shell, visual system, mascot/logo, Gemini provider routing, private Supabase session flow, PDF upload and page-aware RAG ingestion, focus reader, direct selection reader, paragraph-level annotation markers, language preferences, browser voice, and all four StudyMate actions.
- **Configured locally:** Gemini and Supabase are operational for the local private-session flow; the end-to-end upload → index → open-reader path has been verified.
- **Next priority:** Deploy a clean hosted build, run a fresh anonymous-session upload → reader → study-action smoke test, then record the three-minute submission walkthrough and publish the repository.

## [2026-07-21] - Publication Safety
- **Privacy:** Kept authentication limited to Supabase anonymous private sessions; the Library does not collect email or password credentials.
- **Privacy controls:** Confirmed local environment files are ignored; API keys, service-role credentials, private PDFs, real user data, and account credentials must never enter Git, screenshots, logs, or the deployment.
- **Submission package:** Added an MIT `LICENSE` and explicit placeholders for the repository URL, deployment URL, demo URL, Codex usage, GPT-5.6 usage, and primary `/feedback` session ID.
- **Verification:** `npm run check` passes after the privacy and documentation changes.
- **Status:** Release candidate is code-complete for launch preparation; public deployment, hosted smoke test, demo recording, and final URL replacement remain.

## [2026-07-21] - Hosting Package Organization
- **Deployment layout:** Kept the Next.js app at the project root for direct Vercel deployment.
- **Exclusions:** Added `.vercelignore` and tightened `.gitignore` to exclude secrets, generated output, the unrelated `WisprClone` Swift prototype, and its documentation from the StudyMate hosting package.
- **Documentation:** Added `DEPLOYMENT.md` with the included files, excluded files, and Vercel settings.
- **Verification:** `npm run check` passes after packaging changes.

## [2026-07-22] - Render and Supabase Deployment Configuration
- **Hosting:** Documented Render Web Service as the active hosting path for the full-stack Next.js application.
- **Runtime:** Recorded the Render build command `npm install && npm run build` and start command `npm run start -- --hostname 0.0.0.0`; documented that Render supplies `PORT` automatically.
- **Backend:** Documented Supabase as the production authentication, private storage, database, vector retrieval, and RLS backend; the live Render URL must be added to Supabase Authentication URL Configuration.
- **Privacy:** Production secrets remain deployment-provider environment variables and are not written to Git or project documentation.
