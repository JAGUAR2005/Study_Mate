# StudyMate AI — Technical Specification

## Application boundaries

- **Client:** Next.js App Router, React, TypeScript, Tailwind, accessible UI primitives.
- **Server:** Next.js route handlers for authenticated mutations and AI calls.
- **Persistence:** Supabase Auth, PostgreSQL, Storage, and row-level security.
- **AI:** OpenAI API called only from the server; structured outputs validated before persistence.
- **PDF:** PDF.js/react-pdf for rendering and text-layer selection.

## Core routes

- `/library` — uploaded books and upload entry point
- `/reader/[id]` — PDF reader and text selection
- `/workspace/[id]` — editable study material
- `/notes` — saved-note management
- `/review` — active recall review
- `/api/ai/process` — validated AI action endpoint

## AI request contract

```ts
type AiAction =
  | "explain"
  | "notes"
  | "example"
  | "mnemonic"
  | "quiz"
  | "visual";

type AiRequest = {
  action: AiAction;
  text: string;
  context?: { title?: string; pageNumber?: number };
};
```

The response must identify success/failure, action, validated data, and a user-safe error message. User-authored fields are never part of an overwrite operation unless explicitly requested.

## Data entities

- `books`: owner, title, file reference, page count, timestamps
- `notes`: owner, book, source text, page, AI fields, user thoughts, visual data, tags, timestamps
- `review_items`: note reference, cloze prompt, answer, scheduling/progress metadata

## Required engineering controls

- Validate file type, size, and extracted text length.
- Enforce ownership in every database query and mutation.
- Keep service-role credentials server-only.
- Validate structured model output before rendering or saving.
- Log failures without logging source documents or secrets.

