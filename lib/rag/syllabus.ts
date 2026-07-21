import { retrieveBookContext } from "@/lib/rag/retrieve";
import { createSupabaseAdmin } from "@/lib/rag/supabase";
import type { RetrievalSource, VisualizeScope } from "@/types/study";

type StoredChunk = { id: string; page_number: number; chunk_index: number; content: string };

const MAX_SYLLABUS_CHARS = 38_000;
const INDEX_PATTERN = /\b(table of contents|contents|syllabus|course outline|module|unit|chapter|lesson|week)\b/gi;

function asSource(chunk: StoredChunk, similarity = 1): RetrievalSource {
  return { chunkId: chunk.id, pageNumber: chunk.page_number, content: chunk.content, similarity };
}

function packChunks(chunks: StoredChunk[], maximum = MAX_SYLLABUS_CHARS, distribute = false) {
  const sorted = [...chunks].sort((left, right) => left.page_number - right.page_number || left.chunk_index - right.chunk_index);
  const totalSize = sorted.reduce((size, chunk) => size + `[Page ${chunk.page_number}] ${chunk.content}`.length, 0);
  const candidates = distribute && totalSize > maximum
    ? Array.from({ length: Math.min(28, sorted.length) }, (_, index) => sorted[Math.round((index * (sorted.length - 1)) / Math.max(1, Math.min(28, sorted.length) - 1))]).filter((chunk, index, list) => list.indexOf(chunk) === index)
    : sorted;
  const selected: StoredChunk[] = [];
  let size = 0;
  for (const chunk of candidates) {
    const labelled = `[Page ${chunk.page_number}] ${chunk.content}`;
    if (selected.length && size + labelled.length > maximum) break;
    selected.push(chunk); size += labelled.length;
  }
  return {
    sources: selected.map((chunk) => asSource(chunk)),
    context: selected.map((chunk) => `[Page ${chunk.page_number}] ${chunk.content}`).join("\n\n"),
  };
}

function indexScore(content: string) {
  return (content.match(INDEX_PATTERN) ?? []).length;
}

function bookOutlineChunks(chunks: StoredChunk[]) {
  const indexChunks = chunks.map((chunk) => ({ chunk, score: indexScore(chunk.content) })).filter(({ score }) => score > 0).sort((left, right) => right.score - left.score || left.chunk.page_number - right.chunk.page_number);
  if (indexChunks.length >= 2) return indexChunks.slice(0, 14).map(({ chunk }) => chunk);

  // If the PDF does not expose a contents/index page, sample the first chunk
  // from every page. This keeps a whole-book map representative and bounded.
  const representative = new Map<number, StoredChunk>();
  for (const chunk of chunks) if (!representative.has(chunk.page_number)) representative.set(chunk.page_number, chunk);
  return [...representative.values()];
}

export async function collectVisualizationContext({
  userId,
  bookId,
  scope,
  pageNumber,
  chapterQuery,
}: {
  userId: string;
  bookId: string;
  scope: Exclude<VisualizeScope, "selection">;
  pageNumber?: number;
  chapterQuery?: string;
}) {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.from("book_chunks").select("id, page_number, chunk_index, content").eq("book_id", bookId).eq("user_id", userId).order("page_number").order("chunk_index");
  if (error) throw new Error(`Could not read this book for visualization: ${error.message}`);
  const chunks = (data ?? []) as StoredChunk[];
  if (!chunks.length) throw new Error("This book has no readable content to map yet.");

  if (scope === "page") {
    const currentPage = pageNumber ?? 1;
    const pageChunks = chunks.filter((chunk) => chunk.page_number === currentPage);
    if (!pageChunks.length) throw new Error(`Page ${currentPage} does not have readable text to map.`);
    return { ...packChunks(pageChunks), label: `page ${currentPage}`, strategy: "page" as const };
  }

  if (scope === "chapter") {
    const query = chapterQuery?.trim();
    if (!query || query.length < 2) throw new Error("Name a chapter, unit, or topic to create its map.");
    const retrieved = await retrieveBookContext({ userId, bookId, query });
    const matchedPages = retrieved.sources.map((source) => source.pageNumber);
    const firstPage = Math.max(1, Math.min(...matchedPages) - 1);
    const lastPage = Math.max(...matchedPages) + 1;
    const chapterChunks = chunks.filter((chunk) => chunk.page_number >= firstPage && chunk.page_number <= lastPage);
    return { ...packChunks(chapterChunks), label: `chapter/topic “${query}”`, strategy: "chapter" as const };
  }

  return { ...packChunks(bookOutlineChunks(chunks), MAX_SYLLABUS_CHARS, true), label: "the whole book", strategy: "book" as const };
}
