import { NextResponse } from "next/server";
import { ingestPdf, type IngestProgress } from "@/lib/rag/ingest";
import { userIdFromRequest } from "@/lib/rag/supabase";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      const sendProgress = (progress: IngestProgress) => send({ type: "progress", ...progress });
      void (async () => {
        try {
          const userId = await userIdFromRequest(request);
          const formData = await request.formData();
          const file = formData.get("file");
          if (!(file instanceof File)) throw new Error("Choose a PDF to upload.");
          if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Only PDF files are supported.");
          if (file.size === 0 || file.size > MAX_FILE_BYTES) throw new Error("Choose a PDF smaller than 20 MB.");
          const book = await ingestPdf({ file, userId, onProgress: sendProgress });
          send({ type: "complete", book });
        } catch (error) {
          send({ type: "error", error: error instanceof Error ? error.message : "The PDF could not be indexed." });
        } finally {
          controller.close();
        }
      })();
    },
  });
  return new NextResponse(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
