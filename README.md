# StudyMate

StudyMate is a private, PDF-first reading companion for learners. It keeps the original document in view while helping a reader define, translate, visualize, annotate, and revisit difficult passages.

## What is working

- Private anonymous Supabase sessions for a browser-scoped library.
- PDF upload, page-aware extraction, chunking, embeddings, and retrieval with pgvector.
- A source-faithful PDF.js reader with page navigation, search, bookmarks, read history, and keyboard page turns.
- Selection-only actions: Define, Translate, Visualize, and Note.
- Highlight, underline, and strikethrough annotations saved for the current private reading copy.
- Page, chapter/topic, and whole-book syllabus maps, plus infographic briefs.
- Browser-native voice playback and a persistent preferred translation language.
- OpenAI as the primary AI provider, with optional Gemini support for a lower-cost path and optional Headroom context compression.

## Privacy model

Original PDFs are stored in a private Supabase Storage bucket. Page chunks and retrieval are scoped to the authenticated anonymous user through Row Level Security. Each browser gets its own private reading space; no email, password, or personal credential is collected. Study artifacts, highlights, bookmarks, and history are saved locally in the active browser for the private reading experience; clearing site data clears those local reader aids.

Selected text and the retrieved supporting PDF context are sent from the server to the configured AI provider to generate a study action. Do not upload documents you are not allowed to share with that provider.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and supply the required Supabase and AI values.
3. Run [supabase/schema.sql](./supabase/schema.sql) in the Supabase SQL editor. It is safe to rerun for this MVP.
4. In Supabase Authentication, enable Anonymous sign-ins. For a local demo, configure or disable CAPTCHA so anonymous sessions can be created.
5. Start the app with `npm run dev` and open `http://127.0.0.1:3000`.

Required environment values:

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Set `AI_PROVIDER=openai` and `OPENAI_API_KEY` to use OpenAI instead. Optional `HEADROOM_BASE_URL`, `HEADROOM_API_KEY`, and `HEADROOM_TOKEN_BUDGET` enable server-side context compression.

Never commit `.env.local`, API keys, Supabase service-role credentials, user PDFs, or real account credentials. The `.gitignore` file excludes local environment files; deployment secrets must be entered only in the hosting provider’s encrypted environment settings.

## Hosted deployment

The recommended low-cost full-stack deployment is a Render Node Web Service.
Use `npm install && npm run build` as the build command and
`npm run start -- --hostname 0.0.0.0` as the start command. Render supplies
the runtime `PORT` automatically. Add the Supabase and Gemini variables in
Render's encrypted environment settings, then add the resulting Render URL to
Supabase Authentication → URL Configuration.

## Quality checks

```bash
npm run lint
npm run build
npm run check
```

## Product flow

```text
Upload PDF → extract pages → chunk and embed → private Library
                                              ↓
Open reader → select source text → retrieve relevant context → study action
                                              ↓
                               save markup, note, map, or translation
```

## Documentation

- [RAG pipeline](./RAG_PIPELINE.md)
- [Annotation engine](./ANNOTATION_ENGINE.md)
- [Syllabus map engine](./SYLLABUS_MAP_ENGINE.md)
- [Build Week checklist](./SUBMISSION_CHECKLIST.md)
- [Test plan](./TEST_PLAN.md)
