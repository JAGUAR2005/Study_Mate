# Syllabus Map Engine

## Purpose

The Visualize engine creates source-grounded mind maps and infographic briefs at four reading scopes:

- **Selection:** a single highlighted passage.
- **Page:** all readable chunks from the current PDF page.
- **Chapter/topic:** a learner-entered chapter or topic, found semantically and expanded to nearby source pages.
- **Whole book:** the book's index/contents chunks when available; otherwise representative content sampled across every readable page.

## Pipeline

1. The reader sends the requested scope, current page, optional chapter/topic, and authenticated book ID.
2. The server verifies the private user/session and gathers source chunks only from that book.
3. Whole-book mapping scores chunks containing contents/index/syllabus/chapter/unit/module/lesson/week language. If no index-like chunks are available, it uses the first chunk from each page to form a bounded representative outline.
4. Chapter mapping performs semantic retrieval for the supplied topic, then expands to neighbouring pages for enough chapter context.
5. The model returns a structured result with up to 12 topic nodes, directed relationships, and an infographic brief.
6. The reader renders the map in an on-demand sheet, keeping the original PDF page visible beneath it.

## Reliability and boundaries

- Context is capped at 38,000 source characters for book-level maps and compressed by Headroom before generation.
- Gemini transient overload responses (429/500/502/503) retry twice with short backoff.
- A map may only use the gathered private-PDF evidence; prompts explicitly prohibit invented chapters or facts.
- Whole-book and chapter maps are generated on demand and are not yet persisted as reusable study artifacts across sessions.
