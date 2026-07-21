export const studyActions = ["define", "translate", "visualize", "note"] as const;
export const definitionTones = ["Clear", "Professional", "Friendly", "Academic"] as const;
export const visualizeScopes = ["selection", "page", "chapter", "book"] as const;

export type StudyAction = (typeof studyActions)[number];
export type DefinitionTone = (typeof definitionTones)[number];
export type VisualizeScope = (typeof visualizeScopes)[number];

export type StudyRequest = {
  action: StudyAction;
  text: string;
  context?: string;
  targetLanguage?: string;
  definitionTone?: DefinitionTone;
  visualizeScope?: VisualizeScope;
  chapterQuery?: string;
  bookId?: string;
  pageNumber?: number;
};

export type RetrievalSource = { chunkId: string; pageNumber: number; content: string; similarity: number };

export type StudyResult =
  | {
      action: "define";
      title: string;
      definition: string;
      pronunciation?: string;
      usage: string;
    }
  | {
      action: "translate";
      title: string;
      language: string;
      languageCode: string;
      translation: string;
      note?: string;
    }
  | {
      action: "visualize";
      title: string;
      summary: string;
      nodes: Array<{ id: string; label: string; detail: string }>;
      edges: Array<{ from: string; to: string; label?: string }>;
      infographic: {
        headline: string;
        takeaway: string;
        panels: Array<{ label: string; detail: string }>;
      };
    }
  | {
      action: "note";
      title: string;
      body: string;
      reflection: string;
    };

export type StudyResponse =
  | { ok: true; result: StudyResult; tokensSaved: number; sources?: RetrievalSource[] }
  | { ok: false; error: string };
