import { activeProvider, embedWithActiveProvider, providerKey } from "@/lib/ai/provider";
import { createSupabaseAdmin } from "@/lib/rag/supabase";
import type { RetrievalSource } from "@/types/study";

export async function retrieveBookContext({ userId, bookId, query, pageNumber }: { userId: string; bookId: string; query: string; pageNumber?: number }) {
  providerKey(activeProvider());
  const [queryEmbedding] = await embedWithActiveProvider([query], "query");
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.rpc("match_book_chunks", {
    p_book_id: bookId,
    p_user_id: userId,
    p_query_embedding: queryEmbedding,
    p_match_count: 5,
    p_page_number: pageNumber ?? null,
  });
  if (error) throw new Error(`Could not retrieve book context: ${error.message}`);
  const sources = (data ?? []) as RetrievalSource[];
  if (!sources.length) throw new Error("No matching PDF context was found. Try selecting a longer passage.");
  return {
    sources,
    context: sources.map((source) => `[Page ${source.pageNumber}] ${source.content}`).join("\n\n"),
  };
}
