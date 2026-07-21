import OpenAI from "openai";
import { compactReadingContext } from "@/lib/ai/headroom";
import { activeProvider, generateGeminiJson, modelFor, providerKey } from "@/lib/ai/provider";
import type { StudyAction, StudyRequest, StudyResult } from "@/types/study";

const MAX_SELECTION_LENGTH = 5_000;
const MAX_CONTEXT_LENGTH = 7_000;

const schemas: Record<StudyAction, Record<string, unknown>> = {
  define: {
    type: "object",
    additionalProperties: false,
    required: ["title", "definition", "usage"],
    properties: {
      title: { type: "string" },
      definition: { type: "string" },
      pronunciation: { type: "string" },
      usage: { type: "string" },
    },
  },
  translate: {
    type: "object",
    additionalProperties: false,
    required: ["title", "language", "languageCode", "translation"],
    properties: {
      title: { type: "string" },
      language: { type: "string" },
      languageCode: { type: "string" },
      translation: { type: "string" },
      note: { type: "string" },
    },
  },
  visualize: {
    type: "object",
    additionalProperties: false,
    required: ["title", "summary", "nodes", "edges", "infographic"],
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      nodes: {
        type: "array",
        minItems: 2,
        maxItems: 12,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "label", "detail"],
          properties: { id: { type: "string" }, label: { type: "string" }, detail: { type: "string" } },
        },
      },
      edges: {
        type: "array",
        maxItems: 18,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["from", "to"],
          properties: { from: { type: "string" }, to: { type: "string" }, label: { type: "string" } },
        },
      },
      infographic: {
        type: "object",
        additionalProperties: false,
        required: ["headline", "takeaway", "panels"],
        properties: {
          headline: { type: "string" },
          takeaway: { type: "string" },
          panels: {
            type: "array",
            minItems: 2,
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "detail"],
              properties: { label: { type: "string" }, detail: { type: "string" } },
            },
          },
        },
      },
    },
  },
  note: {
    type: "object",
    additionalProperties: false,
    required: ["title", "body", "reflection"],
    properties: {
      title: { type: "string" },
      body: { type: "string" },
      reflection: { type: "string" },
    },
  },
};

function taskInstruction(action: StudyAction, targetLanguage: string, definitionTone: string, visualizeScope: string, chapterQuery?: string) {
  const common = "Use only the selected passage and its supplied surrounding context. Do not add facts that cannot be grounded in it. Be concise, clear, and useful to a student.";
  const tasks: Record<StudyAction, string> = {
    define: `Define the most conceptually important term or phrase in the selection in a ${definitionTone.toLowerCase()} voice. Give a precise definition, optional pronunciation when helpful, and one brief usage/connection to the passage. The requested voice changes clarity and warmth, never factual accuracy.`,
    translate: `Translate naturally into ${targetLanguage}. Preserve tone, key terminology, and meaning. Return an appropriate BCP-47 language code such as en-US, es-ES, or ja-JP.`,
    visualize: visualizeScope === "book"
      ? "Create a whole-book syllabus map. Prefer the supplied index/contents evidence; otherwise infer a conservative course outline from the distributed book excerpts. Use 6–12 hierarchical topic nodes and meaningful parent-child or prerequisite edges. Include a concise infographic brief that helps a learner see the sequence of study. Do not invent chapters that are not grounded in the source."
      : visualizeScope === "chapter"
        ? `Create a chapter/topic map for “${chapterQuery || "the requested topic"}”. Identify the chapter’s central concept, subtopics, and dependencies from the supplied book evidence. Use 4–10 nodes and a concise infographic brief.`
        : visualizeScope === "page"
          ? "Create a page-level concept map. Preserve the source page’s structure, concepts, and relationships. Use 3–8 nodes and a concise infographic brief."
          : "Extract a compact causal, process, or concept map from the selected passage. Use 2–5 short nodes and only meaningful directed edges. Also create a compact infographic brief with a headline, one takeaway, and 2–4 short panels. Both visual formats must be grounded only in the passage and supplied context.",
    note: "Write a short study note that preserves the passage's key claim, then add one reflective question that invites active recall rather than giving another summary.",
  };
  return `${common}\n\nTask: ${tasks[action]}`;
}

function cleanText(value: unknown, label: string, maximum: number) {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length < 8) throw new Error("Select a longer passage—at least a few words—to use this tool.");
  if (text.length > maximum) throw new Error(`${label} is too long. Please select a shorter passage.`);
  return text;
}

function parseResult(action: StudyAction, value: string): StudyResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("The study engine returned an unreadable result. Please try again.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("The study engine returned an invalid result. Please try again.");
  const object = parsed as Record<string, unknown>;
  const text = (key: string, optional = false) => {
    const candidate = object[key];
    if (optional && (candidate === undefined || candidate === null || candidate === "")) return undefined;
    if (typeof candidate !== "string" || !candidate.trim()) throw new Error(`The study engine returned an invalid ${key.replace(/([A-Z])/g, " $1").toLowerCase()}. Please try again.`);
    return candidate.trim();
  };
  if (action === "define") return { action, title: text("title")!, definition: text("definition")!, pronunciation: text("pronunciation", true), usage: text("usage")! };
  if (action === "translate") return { action, title: text("title")!, language: text("language")!, languageCode: text("languageCode")!, translation: text("translation")!, note: text("note", true) };
  if (action === "note") return { action, title: text("title")!, body: text("body")!, reflection: text("reflection")! };

  const nodes = object.nodes;
  const edges = object.edges;
  const infographic = object.infographic;
  if (!Array.isArray(nodes) || nodes.length < 2 || !Array.isArray(edges) || !infographic || typeof infographic !== "object" || Array.isArray(infographic)) throw new Error("The study engine returned an incomplete mind map. Please try again.");
  const validatedNodes = nodes.map((node) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) throw new Error("The study engine returned an invalid mind-map node. Please try again.");
    const item = node as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.label !== "string" || typeof item.detail !== "string" || !item.id.trim() || !item.label.trim() || !item.detail.trim()) throw new Error("The study engine returned an invalid mind-map node. Please try again.");
    return { id: item.id.trim(), label: item.label.trim(), detail: item.detail.trim() };
  });
  const nodeIds = new Set(validatedNodes.map((node) => node.id));
  const validatedEdges = edges.flatMap((edge) => {
    if (!edge || typeof edge !== "object" || Array.isArray(edge)) return [];
    const item = edge as Record<string, unknown>;
    if (typeof item.from !== "string" || typeof item.to !== "string" || !nodeIds.has(item.from) || !nodeIds.has(item.to)) return [];
    return [{ from: item.from, to: item.to, label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : undefined }];
  });
  const graphic = infographic as Record<string, unknown>;
  if (typeof graphic.headline !== "string" || typeof graphic.takeaway !== "string" || !Array.isArray(graphic.panels) || graphic.panels.length < 2) throw new Error("The study engine returned an incomplete infographic. Please try again.");
  const panels = graphic.panels.map((panel) => {
    if (!panel || typeof panel !== "object" || Array.isArray(panel)) throw new Error("The study engine returned an invalid infographic panel. Please try again.");
    const item = panel as Record<string, unknown>;
    if (typeof item.label !== "string" || typeof item.detail !== "string" || !item.label.trim() || !item.detail.trim()) throw new Error("The study engine returned an invalid infographic panel. Please try again.");
    return { label: item.label.trim(), detail: item.detail.trim() };
  });
  return { action, title: text("title")!, summary: text("summary")!, nodes: validatedNodes, edges: validatedEdges, infographic: { headline: graphic.headline.trim(), takeaway: graphic.takeaway.trim(), panels } };
}

export async function runStudyAction(input: StudyRequest) {
  const text = cleanText(input.text, "Selected text", MAX_SELECTION_LENGTH);
  const visualizeScope = input.visualizeScope ?? "selection";
  const contextLimit = input.action === "visualize" && visualizeScope !== "selection" ? 45_000 : MAX_CONTEXT_LENGTH;
  const context = input.context ? cleanText(input.context, "Context", contextLimit) : "No surrounding context was supplied.";
  const targetLanguage = input.targetLanguage?.trim() || "English";
  const definitionTone = input.definitionTone?.trim() || "Clear";

  const messages = [
    { role: "system" as const, content: "You are StudyMate, a precise academic reading companion. Return only JSON that matches the supplied schema." },
    {
      role: "user" as const,
      content: `${taskInstruction(input.action, targetLanguage, definitionTone, visualizeScope, input.chapterQuery)}\n\nSelected passage or mapping request:\n${text}\n\nSurrounding context:\n${context}`,
    },
  ];
  const provider = activeProvider();
  // Headroom accepts OpenAI-compatible message arrays, so compress the retrieved
  // context before routing to either configured model provider.
  const compacted = await compactReadingContext(messages);
  let content: string | null;
  if (provider === "gemini") {
    content = await generateGeminiJson({ prompt: compacted.messages.map((message) => message.content).join("\n\n"), schema: schemas[input.action] });
  } else {
    const client = new OpenAI({ apiKey: providerKey("openai") });
    const completion = await client.chat.completions.create({
      model: modelFor("openai"),
      messages: compacted.messages,
      response_format: {
        type: "json_schema",
        json_schema: { name: `studymate_${input.action}`, strict: true, schema: schemas[input.action] },
      },
    });
    content = completion.choices[0]?.message.content ?? null;
  }
  if (!content) throw new Error("The study engine did not return a result. Please try again.");

  return { result: parseResult(input.action, content), tokensSaved: compacted.tokensSaved ?? 0 };
}
