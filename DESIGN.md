# 🎨 UI/UX & Design Guidelines

## 1. Design Philosophy
StudyMate AI is designed to make learning **frictionless and premium**. The UI should get out of the way while providing a visually stunning environment that encourages focus and engagement.

## 2. Aesthetics & Styling
As per our core design rules, the app must "WOW" the user at first glance.
- **Rich Aesthetics:** Utilize vibrant, curated color palettes avoiding generic browser defaults. 
- **Dark Mode:** Implement a sleek, deeply integrated dark mode system.
- **Glassmorphism:** Use subtle backdrop-filters and translucent surfaces for floating elements (like the Action Menu and modals).
- **Typography:** Use modern, highly readable sans-serif fonts (e.g., Inter, Outfit, or Roboto) for interfaces, and a clean serif or highly legible sans-serif for the PDF reader.
- **Micro-interactions:** Add dynamic hover effects, smooth transitions, and subtle animations to make the UI feel alive and responsive.

## 3. Core Screens & Layouts

### 3.1 Library (`/library`)
- Grid layout displaying uploaded books as cards.
- Each card shows the cover (or generated thumbnail), title, and page count.
- Prominent "Upload PDF" dropzone with a dashed border and hover states.

### 3.2 Book Reader (`/reader/[id]`)
- **Desktop-first split:** Maximize the PDF viewing area.
- Minimalist header with back button and basic controls (zoom, page navigation).
- **Action Menu:** A floating, glassmorphic popover that appears precisely above the user's text selection.

### 3.3 Study Material Workspace (`/workspace/[id]`)
- **Two-Column Layout:**
  - **Left Panel (Text & Thoughts):** Original text at the top (visually distinct, perhaps in a subtle blockquote), followed by the AI explanation, and the rich-text "My Thoughts" area.
  - **Right Panel (Visuals):** A sticky container showcasing the AI-generated visual (Concept Card, Flow Diagram, or Analogy).
- **Bottom Bar:** Tag management and a prominent "Save Note" CTA.

### 3.4 Saved Notes (`/notes`)
- A masonry or grid layout of note cards.
- Search bar and tag filters at the top.
- Cards show a snippet of the original text, the AI visual thumbnail, and tags.

### 3.5 Review (`/review`)
- Flashcard interface centered on the screen.
- Distraction-free mode.
- Large text for Cloze deletions (fill-in-the-blank).

## 4. Visual Formats Design

- **Concept Cards:** Clean, bordered cards with a strong title header, a short definition, and subtle pill-shaped keywords.
- **Flow Diagrams:** Clean nodes with rounded corners and smooth bezier curves for edges. Nodes should use contrasting colors to indicate flow.
- **Visual Analogies:** Side-by-side comparison layout. Use a dividing line or an icon (like an equals or arrow) in the center.

## 5. Components Library
We will utilize **shadcn/ui** primitives styled with Tailwind CSS to ensure consistency, accessibility, and a premium feel across all interactive elements (buttons, dialogs, dropdowns).
