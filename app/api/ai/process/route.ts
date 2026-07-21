import { NextResponse } from "next/server";
import { runStudyAction } from "@/lib/ai/engine";
import { retrieveBookContext } from "@/lib/rag/retrieve";
import { collectVisualizationContext } from "@/lib/rag/syllabus";
import { userIdFromRequest } from "@/lib/rag/supabase";
import { studyActions, visualizeScopes, type StudyRequest, type StudyResponse } from "@/types/study";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<StudyRequest>;
    if (!body.action || !studyActions.includes(body.action)) {
      return NextResponse.json<StudyResponse>({ ok: false, error: "Choose a valid study action." }, { status: 400 });
    }
    if (body.visualizeScope && !visualizeScopes.includes(body.visualizeScope)) {
      return NextResponse.json<StudyResponse>({ ok: false, error: "Choose a valid visualization scope." }, { status: 400 });
    }
    let sources;
    if (body.bookId) {
      const userId = await userIdFromRequest(request);
      const scope = body.visualizeScope ?? "selection";
      if (body.action === "visualize" && scope !== "selection") {
        const visualization = await collectVisualizationContext({ userId, bookId: body.bookId, scope, pageNumber: body.pageNumber, chapterQuery: body.chapterQuery });
        body.context = visualization.context;
        body.text = body.text?.trim() || `Create a grounded syllabus map for ${visualization.label}.`;
        sources = visualization.sources;
      } else {
        const retrieved = await retrieveBookContext({ userId, bookId: body.bookId, query: body.text ?? "", pageNumber: body.pageNumber });
        body.context = retrieved.context;
        sources = retrieved.sources;
      }
    }
    const { result, tokensSaved } = await runStudyAction(body as StudyRequest);
    return NextResponse.json<StudyResponse>({ ok: true, result, tokensSaved, sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong while preparing your study material.";
    const isInputIssue = /valid study action|valid visualization scope|must be text|Select a longer passage|too long|Name a chapter|No matching PDF context|does not have readable text/i.test(message);
    const status = message.includes("not configured") ? 503 : isInputIssue ? 400 : 502;
    return NextResponse.json<StudyResponse>({ ok: false, error: message }, { status });
  }
}
