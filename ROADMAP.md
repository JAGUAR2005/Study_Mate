# 🗺️ StudyMate AI - Development Roadmap

## Build Week Plan (MVP Scope)

### Day 1 – Foundation
- [ ] Set up Next.js + Tailwind + TypeScript
- [ ] Configure Supabase (Auth, Database, Storage)
- [ ] Create basic layout (sidebar navigation, header)
- [ ] Implement login/signup (Supabase Auth)

### Day 2 – Library & PDF Reader
- [ ] Upload PDF to Supabase Storage (with progress)
- [ ] List books in Library
- [ ] Build Reader page: PDF.js rendering + page navigation
- [ ] Text selection detection + floating Action Menu
- [ ] Implement Prompt 1 (Text Cleaner) to fix PDF extraction

### Day 3 – AI Actions & Workspace
- [ ] Create `/api/ai/process` endpoint with GPT‑5.6 routing (Luna/Terra/Sol)
- [ ] Wire all 6 actions to call the API
- [ ] Build the Study Material Workspace (TipTap editor, visual preview)
- [ ] Implement Prompt 3 (Socratic prompts) to pre-fill user thoughts

### Day 4 – Notes & Review
- [ ] Saved Notes page (list, search, filter, delete)
- [ ] Review page (flashcard + Cloze deletions using Prompt 5)
- [ ] Add tagging functionality

### Day 5 – Polish & Deployment
- [ ] Add "Regenerate" button (re-call API, overwrite only AI fields)
- [ ] Ensure all AI fields are editable
- [ ] Add low-confidence warnings (<10 chars selected)
- [ ] PWA manifest + service worker (Next.js PWA plugin)
- [ ] Mobile responsiveness (basic)
- [ ] Deploy to Vercel

---

## Upcoming Features (v2+)

The following features are explicitly postponed to maintain laser focus during the MVP build:

-  Mind maps (visual diagrams of interconnected concepts)
-  Audio jingles (audio mnemonics)
-  Collaboration (shared workspaces)
-  Social sharing (export/share notes)
-  Templates marketplace
-  Native iOS/Android apps (PWA covers this)
-  EPUB support (v2)
-  Multiple file formats (Word, plain text, web articles)
-  Multi-file batch upload
