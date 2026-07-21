# StudyMate PDF Retrieval Pipeline

## User path

1. A signed-in user uploads a text-based PDF at `/library`.
2. The server validates the type and 20 MB limit, then stores the original file in that user's private `books` storage path.
3. PDF.js extracts text per page. Scanned PDFs with no text layer are rejected with a clear OCR message.
4. Each page is split into roughly 1,100-character chunks with a 180-character overlap, retaining its page number.
5. Chunks are embedded with the configured provider (`gemini-embedding-2` by default, or OpenAI `text-embedding-3-small`) and stored in `book_chunks` with `pgvector`.
6. In the reader, the highlighted passage is embedded as the query. The closest five chunks for the same book and owner are retrieved, with an optional one-page proximity preference.
7. Only the selected passage plus those source-labelled chunks are passed to the StudyMate action engine. Returned source pages are shown with the result.

## Why this design

- **Grounded answers:** retrieval keeps explanations, notes, translations, and visual maps anchored in the uploaded book.
- **Private by default:** original PDFs use a private storage bucket; Row Level Security scopes books and chunks to the signed-in owner.
- **Token-efficient:** RAG limits context to relevant chunks; Headroom can further compress long prompts when configured.
- **Traceable:** every retrieval chunk carries its page number for citation and return-to-source behavior.

## Required configuration

Add the values from `.env.example` to `.env.local`, run `supabase/schema.sql` in the Supabase SQL editor, configure Supabase Auth, and make sure the app's signed-in client sends its session token to the API routes.

## Current limitation

The first reader view securely opens the original PDF and accepts a pasted selection for RAG actions. The next reader enhancement should replace that input with PDF.js text-layer selection directly inside the document view.
