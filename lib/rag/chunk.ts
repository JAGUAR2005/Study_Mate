import type { PdfPage, RagChunk } from "@/types/books";

const CHUNK_SIZE = 1_100;
const CHUNK_OVERLAP = 180;

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

/** Keep chunks page-aware so every model answer can cite the source page. */
export function chunkPages(pages: PdfPage[]): RagChunk[] {
  const chunks: RagChunk[] = [];
  for (const page of pages) {
    const text = normalize(page.text);
    if (text.length < 40) continue;
    let start = 0;
    let index = 0;
    while (start < text.length) {
      let end = Math.min(start + CHUNK_SIZE, text.length);
      if (end < text.length) {
        const breakpoint = Math.max(text.lastIndexOf(". ", end), text.lastIndexOf("; ", end), text.lastIndexOf(" ", end));
        if (breakpoint > start + CHUNK_SIZE * 0.55) end = breakpoint + 1;
      }
      const content = text.slice(start, end).trim();
      if (content.length >= 40) chunks.push({ pageNumber: page.pageNumber, chunkIndex: index++, content });
      if (end >= text.length) break;
      start = Math.max(end - CHUNK_OVERLAP, start + 1);
    }
  }
  return chunks;
}
