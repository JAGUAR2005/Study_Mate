# 🏛️ System Architecture

## 1. High-Level Architecture
StudyMate AI uses a modern, serverless architecture centered around Next.js, Supabase, and OpenAI API.

- **Frontend:** Next.js (App Router), React, Tailwind CSS.
- **Backend/API:** Next.js Serverless Route Handlers deployed on Vercel.
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage).
- **AI Processing:** OpenAI GPT-5.6 (Hybrid routing).

## 2. Tech Stack Details

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Next.js 14 | UI, Routing, API endpoints |
| **Styling** | Tailwind CSS & shadcn/ui | Component design system |
| **PDF Handling** | PDF.js (react-pdf) | Rendering pages and text layers |
| **Rich Text** | TipTap | Editable workspace for notes |
| **Visuals** | HTML Canvas/SVG | Rendering flow diagrams/analogies (Mermaid fallback) |
| **Database** | Supabase (PostgreSQL) | Storing users, books, and notes |
| **AI Integration**| OpenAI API (v4) | LLM inference |

## 3. Database Schema

### `books` Table
```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  author TEXT,
  file_url TEXT,
  page_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `notes` Table
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  book_id UUID REFERENCES books ON DELETE CASCADE,
  source_text TEXT,
  user_thoughts TEXT,
  ai_explanation TEXT,
  ai_bullets TEXT[],
  ai_example TEXT,
  ai_mnemonic TEXT,
  ai_quiz JSONB,
  ai_visual JSONB,
  page_number INTEGER,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
*(Row Level Security (RLS) ensures users can only access their own data).*

## 4. AI Integration Strategy

We utilize a **Hybrid Routing Strategy** across the GPT-5.6 family to balance latency, reasoning, and cost.

| Model | Assigned Tasks | Rationale |
|-------|----------------|-----------|
| **`gpt-5.6-luna`** | Text cleaning, Mnemonics, Simple Explanations | Fast and cost-effective. |
| **`gpt-5.6-terra`** | Bullet notes, Examples, Quizzes | Balanced reasoning for logical outputs. |
| **`gpt-5.6-sol`** | Visual formatting (Cards, Flow Diagrams, Analogies) | Best spatial/relational reasoning. |

### API Endpoint (`/api/ai/process`)
- **Input:** `{ action, text, context }`
- **Output:** `{ success, data, error }`
- **Execution:** Uses `response_format: { type: "json_object" }` for structured outputs.
- **Streaming:** Text responses stream token-by-token; visual JSON is fetched in parallel.

## 5. Security & Environment
- Environment variables are strictly managed. `.env.local` is `.gitignore`d.
- Supabase Anon keys are used on the client; Service Role keys only on the server.
- Supabase RLS policies lock down row access to authenticated users.
