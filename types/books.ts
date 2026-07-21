export type BookStatus = "processing" | "ready" | "failed";

export type UploadedBook = {
  id: string;
  title: string;
  pageCount: number;
  chunkCount: number;
  status: BookStatus;
};

export type PdfPage = { pageNumber: number; text: string };

export type RagChunk = { pageNumber: number; chunkIndex: number; content: string };
