import { NextResponse } from "next/server";
import { createSupabaseAdmin, userIdFromRequest } from "@/lib/rag/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const userId = await userIdFromRequest(request);
    const admin = createSupabaseAdmin();
    const { data, error } = await admin
      .from("books")
      .select("id, title, page_count, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, books: (data ?? []).map((book) => ({ id: book.id, title: book.title, pageCount: book.page_count, status: book.status, createdAt: book.created_at })) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load your private library.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
