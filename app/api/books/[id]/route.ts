import { NextResponse } from "next/server";
import { createSupabaseAdmin, userIdFromRequest } from "@/lib/rag/supabase";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await userIdFromRequest(request);
    const { id } = await params;
    const admin = createSupabaseAdmin();
    const { data: book, error } = await admin.from("books").select("id, title, page_count, file_path, status").eq("id", id).eq("user_id", userId).single();
    if (error || !book) return NextResponse.json({ ok: false, error: "This book was not found in your library." }, { status: 404 });
    const { data: signed, error: signedError } = await admin.storage.from("books").createSignedUrl(book.file_path, 60 * 60);
    if (signedError || !signed) throw new Error(signedError?.message ?? "Could not open this PDF.");
    return NextResponse.json({ ok: true, book: { id: book.id, title: book.title, pageCount: book.page_count, status: book.status }, url: signed.signedUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open this PDF.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
