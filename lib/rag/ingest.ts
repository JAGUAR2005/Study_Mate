import { activeProvider, embedWithActiveProvider, providerKey } from "@/lib/ai/provider";
import { chunkPages } from "@/lib/rag/chunk";
import { createSupabaseAdmin } from "@/lib/rag/supabase";
import type { PdfPage, UploadedBook } from "@/types/books";

const EMBEDDING_BATCH_SIZE = 96;

export type IngestProgress = {
  phase: "validating" | "extracting" | "chunking" | "embedding" | "storing" | "saving";
  message: string;
  completed?: number;
  total?: number;
};

type ProgressReporter = (progress: IngestProgress) => void;

async function extractPdfPages(bytes: ArrayBuffer, report?: ProgressReporter): Promise<PdfPage[]> {
  // Load the worker module in-process. pdf.js detects its exported message
  // handler on `globalThis`, avoiding a browser worker or a rewritten file path.
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({ data: new Uint8Array(bytes), disableFontFace: true, useSystemFonts: true }).promise;
  try {
    // Work one page at a time. A large lecture pack can have hundreds of pages;
    // parallel extraction makes pdf.js retain too many page resources at once.
    const pages: PdfPage[] = [];
    for (let pageIndex = 0; pageIndex < document.numPages; pageIndex += 1) {
      const page = await document.getPage(pageIndex + 1);
      const content = await page.getTextContent();
      pages.push({
        pageNumber: pageIndex + 1,
        text: content.items.map((item) => ("str" in item ? item.str : "")).join(" "),
      });
      page.cleanup();
      report?.({ phase: "extracting", message: `Read page ${pageIndex + 1} of ${document.numPages}`, completed: pageIndex + 1, total: document.numPages });
    }
    return pages;
  } finally {
    await document.destroy();
  }
}

async function embedChunks(contents: string[], report?: ProgressReporter) {
  const embeddings: number[][] = [];
  for (let cursor = 0; cursor < contents.length; cursor += EMBEDDING_BATCH_SIZE) {
    const batch = contents.slice(cursor, cursor + EMBEDDING_BATCH_SIZE);
    embeddings.push(...await embedWithActiveProvider(batch, "document"));
    report?.({ phase: "embedding", message: `Indexed ${Math.min(cursor + batch.length, contents.length)} of ${contents.length} study passages`, completed: Math.min(cursor + batch.length, contents.length), total: contents.length });
  }
  return embeddings;
}

export async function ingestPdf({ file, userId, onProgress }: { file: File; userId: string; onProgress?: ProgressReporter }): Promise<UploadedBook> {
  providerKey(activeProvider());
  onProgress?.({ phase: "validating", message: "Checking the PDF and preparing a private workspace" });
  const pages = await extractPdfPages(await file.arrayBuffer(), onProgress);
  onProgress?.({ phase: "chunking", message: "Creating page-aware study passages" });
  const chunks = chunkPages(pages);
  if (!chunks.length) throw new Error("This PDF has no selectable text. Please use a text-based PDF or run OCR before uploading.");
  const embeddings = await embedChunks(chunks.map((chunk) => chunk.content), onProgress);
  const admin = createSupabaseAdmin();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${userId}/${crypto.randomUUID()}-${safeName}`;

  onProgress?.({ phase: "storing", message: "Saving the original PDF to your private library" });
  const { error: uploadError } = await admin.storage.from("books").upload(storagePath, file, { contentType: "application/pdf", upsert: false });
  if (uploadError) throw new Error(`PDF upload failed: ${uploadError.message}`);

  try {
    const { data: book, error: bookError } = await admin.from("books").insert({
      user_id: userId,
      title: file.name.replace(/\.pdf$/i, ""),
      file_path: storagePath,
      page_count: pages.length,
      status: "processing",
    }).select("id, title, page_count, status").single();
    if (bookError || !book) throw new Error(bookError?.message ?? "Could not create the book record.");

    const rows = chunks.map((chunk, index) => ({
      book_id: book.id,
      user_id: userId,
      page_number: chunk.pageNumber,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: embeddings[index],
    }));
    onProgress?.({ phase: "saving", message: "Saving the retrieval index" });
    const { error: chunkError } = await admin.from("book_chunks").insert(rows);
    if (chunkError) throw new Error(chunkError.message);
    const { error: readyError } = await admin.from("books").update({ status: "ready" }).eq("id", book.id).eq("user_id", userId);
    if (readyError) throw new Error(readyError.message);
    return { id: book.id, title: book.title, pageCount: book.page_count, chunkCount: chunks.length, status: "ready" };
  } catch (error) {
    await admin.storage.from("books").remove([storagePath]);
    throw error;
  }
}
