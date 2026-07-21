# 📄 Product Requirements Document (PRD)

## 1. Project Overview
**Project Name:** StudyMate AI  
**Goal:** Build a responsive web app that allows students to upload PDFs, highlight confusing text, and instantly generate study materials (explanations, notes, visuals, mnemonics, examples, quizzes) using OpenAI's GPT‑5.6 models.  
**Target:** OpenAI Build Week (July 2026)

## 2. Core Hypothesis
*"Can users turn a difficult passage into personalized, memorable study material quickly?"*

## 3. Target Audience
Students, researchers, and lifelong learners who regularly read dense, complex academic material and struggle with comprehension or retention.

## 4. MVP Features

### 4.1 PDF Reader & Highlighter
- **Upload:** Users can upload PDF files (max 20MB) to their personal library.
- **Render:** Render PDFs using PDF.js.
- **Interact:** Select text to trigger a floating "Action Menu".
- **Constraints:** Scanned PDFs without OCR are blocked.

### 4.2 Action Menu (6 AI Actions)
1. **Explain Simply:** Rewrite complex jargon into everyday language.
2. **Create Notes:** Generate 3–5 bullet-point summary notes.
3. **Add Real-World Example:** Provide a concrete, relatable scenario.
4. **Create Mnemonic:** Build acronyms or rhymes for easy memorization.
5. **Generate Quiz:** Create a multiple-choice question with 4 options and an answer explanation.
6. **Create Visual:** Render concept cards, flow diagrams, or visual analogies.

### 4.3 Study Material Workspace (Full-Page Editor)
- **Original Text:** The highlighted text (editable).
- **AI Explanation:** The generated response (editable).
- **User Thoughts:** Rich text area (TipTap) pre-filled with Socratic prompts (e.g., "What confuses you about this?").
- **Visual Preview:** Rendered visual format.
- **Metadata:** Tags, page number, and source link.

### 4.4 Study Dashboard & Review
- **Library:** Manage all uploaded PDFs.
- **Saved Notes:** Search, filter by book, and manage tags for saved notes.
- **Review Page:** Flashcard-style active recall using Cloze deletions (fill-in-the-blank).

### 4.5 Quality Controls
- **Source Transparency:** Link back to the original passage and page number.
- **Regenerate:** Re-run the AI without overwriting user-edited thoughts.
- **Low-Confidence Warning:** Alerts if selected text is <10 characters.

## 5. Non-Functional Requirements
- **Platform:** Desktop-first responsive web app.
- **Installability:** PWA support for mobile access.
- **Performance:** Fast time-to-first-note using streaming AI responses.

## 6. Success Metrics
- **Time-to-first-note:** < 2 minutes.
- **Retention:** % of users returning to the Review page.
- **Edits:** Frequency of users editing AI output (proving personalization).
- **Cost:** Average API cost per note < $0.01.
