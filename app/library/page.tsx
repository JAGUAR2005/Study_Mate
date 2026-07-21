"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { createPrivateSession, getBrowserAccessToken, getBrowserSession, getBrowserSupabase } from "@/lib/rag/browser-session";
import { StudyMateLogo } from "@/components/brand/studymate-brand";
import type { UploadedBook } from "@/types/books";

type LibraryBook = UploadedBook & { createdAt: string };
type UploadEvent =
  | { type: "progress"; phase: "validating" | "extracting" | "chunking" | "embedding" | "storing" | "saving"; message: string; completed?: number; total?: number }
  | { type: "complete"; book: UploadedBook }
  | { type: "error"; error: string };

function progressFor(event: Extract<UploadEvent, { type: "progress" }>) {
  if (event.phase === "validating") return 5;
  if (event.phase === "extracting") return 8 + Math.round(((event.completed ?? 0) / Math.max(1, event.total ?? 1)) * 35);
  if (event.phase === "chunking") return 46;
  if (event.phase === "embedding") return 50 + Math.round(((event.completed ?? 0) / Math.max(1, event.total ?? 1)) * 32);
  if (event.phase === "storing") return 86;
  return 94;
}

export default function LibraryPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("Your books become private, page-aware study spaces.");
  const [isUploading, setIsUploading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connection, setConnection] = useState<"checking" | "missing" | "needs-session" | "ready">("checking");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("Waiting for a PDF");
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);

  async function loadBooks() {
    setIsLoadingBooks(true);
    try {
      const token = await getBrowserAccessToken();
      const response = await fetch("/api/books", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json() as { ok: boolean; error?: string; books?: LibraryBook[] };
      if (!data.ok) throw new Error(data.error ?? "Could not load your private library.");
      setBooks(data.books ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load your private library.");
    } finally {
      setIsLoadingBooks(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function checkConnection() {
      if (!getBrowserSupabase()) { if (!cancelled) setConnection("missing"); return; }
      const session = await getBrowserSession();
      if (!cancelled) {
        setConnection(session ? "ready" : "needs-session");
        if (session) void loadBooks();
      }
    }
    void checkConnection();
    return () => { cancelled = true; };
  }, []);

  async function connectPrivateSession() {
    setIsConnecting(true);
    setMessage("Setting up a private reading space in this browser…");
    try {
      await createPrivateSession();
      setConnection("ready");
      setMessage("You’re connected. Your PDFs and study notes will stay scoped to this private space.");
      await loadBooks();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Supabase could not create a private session.");
    } finally { setIsConnecting(false); }
  }

  async function upload(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { setMessage("Choose a PDF file to begin."); return; }
    if (file.size > 20 * 1024 * 1024) { setMessage("This PDF is larger than 20 MB. Please choose a smaller file."); return; }
    setSelectedFile(file);
    if (connection !== "ready") {
      setMessage(connection === "needs-session" ? "Create a private session above, then upload your PDF." : "Connect Supabase before adding books to your library.");
      return;
    }
    setIsUploading(true);
    setProgress(2);
    setPhase("Uploading your private PDF");
    setMessage("Preparing a live reading and indexing status…");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = await getBrowserAccessToken();
      const response = await fetch("/api/books/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (!response.ok || !response.body) throw new Error("The PDF upload could not start. Please try again.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      let completeBook: UploadedBook | undefined;
      while (true) {
        const { done, value } = await reader.read();
        pending += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as UploadEvent;
          if (event.type === "error") throw new Error(event.error);
          if (event.type === "complete") { completeBook = event.book; continue; }
          setProgress(progressFor(event));
          setPhase(event.message);
          setMessage(event.message);
        }
        if (done) break;
      }
      if (!completeBook) throw new Error("The PDF indexing status ended before the book was ready.");
      setProgress(100);
      setPhase("Ready to read");
      setMessage("Your book is ready. StudyMate will now retrieve only the pages relevant to each selection.");
      await loadBooks();
    } catch (error) {
      setProgress(0);
      setPhase("Upload paused");
      setMessage(error instanceof Error ? error.message : "The PDF could not be indexed.");
    } finally { setIsUploading(false); }
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) { event.preventDefault(); setDragActive(false); void upload(event.dataTransfer.files[0]); }
  function onChange(event: ChangeEvent<HTMLInputElement>) { upload(event.target.files?.[0]); event.target.value = ""; }

  return <main className="library-page">
    <nav className="nav"><a className="wordmark" href="/"><StudyMateLogo /></a><a className="library-back" href="/">← Reading room</a></nav>
    <section className="library-hero">
      <p className="eyebrow">§ personal library</p>
      <h1>Bring a book.<br /><em>Keep its context.</em></h1>
      <p>Upload a text-based PDF and StudyMate will index it page by page. When you highlight a passage, retrieval finds the few supporting chunks that matter—not the whole book.</p>
    </section>
    <section className="upload-grid">
      <button className={`upload-dropzone ${isUploading ? "is-uploading" : ""} ${dragActive ? "is-dragging" : ""}`} onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (event.currentTarget === event.target) setDragActive(false); }} onDrop={onDrop} disabled={isUploading}>
        <span className={`upload-glyph ${isUploading ? "is-spinning" : ""}`}>{isUploading ? "✦" : "↥"}</span><span className="eyebrow">{isUploading ? "StudyMate is reading" : "Add a PDF"}</span><strong>{isUploading ? phase : dragActive ? "Release to begin" : "Drop a PDF here"}</strong><small>{isUploading ? "Keep this window open while we prepare your reading room" : "or choose a file · PDF · up to 20 MB"}</small>
        {isUploading && <span className="upload-progress" aria-label={`${progress}% processing complete`}><i style={{ width: `${progress}%` }} /></span>}
      </button>
      <div className="rag-card"><p className="eyebrow">What happens next</p><ol><li><b>01</b> Text is extracted page by page.</li><li><b>02</b> Each page is split into overlapping study chunks.</li><li><b>03</b> Chunks are embedded and stored privately.</li><li><b>04</b> Your selection retrieves only relevant support.</li></ol></div>
    </section>
    <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={onChange} />
    <section className={`connection-card connection-${connection}`} aria-live="polite">
      <span className="connection-orb" />
      <div><p className="eyebrow">{connection === "ready" ? "Private space connected" : connection === "checking" ? "Checking your reading space" : "One small setup step"}</p><strong>{connection === "ready" ? "You’re ready to add a book." : connection === "checking" ? "Connecting to Supabase…" : connection === "missing" ? "Supabase needs its public keys." : "Create a private session to upload."}</strong><small>{connection === "ready" ? "Your library is scoped to this account and protected by Row Level Security." : connection === "missing" ? "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the server." : connection === "needs-session" ? "No password or personal details are needed for this demo. This browser gets its own private library." : "Verifying your private library connection."}</small></div>
      {connection === "needs-session" && <button className="connect-button" onClick={() => void connectPrivateSession()} disabled={isConnecting}>{isConnecting ? "Connecting…" : "Create private session ↗"}</button>}
    </section>
    {selectedFile && !isUploading && <div className="selected-file"><span className="file-badge">PDF</span><div><strong>{selectedFile.name}</strong><small>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · {progress === 100 ? "indexed and ready" : "ready to upload"}</small></div><button onClick={() => { setSelectedFile(null); setProgress(0); setPhase("Waiting for a PDF"); }} aria-label="Remove selected PDF">×</button></div>}
    <p className="library-message" role="status">{message}</p>
    <section className="library-shelf" aria-label="Your uploaded books">
      <div className="library-shelf-heading"><div><p className="eyebrow">Your library</p><h2>Return to a book.</h2></div><span>{isLoadingBooks ? "Refreshing…" : `${books.length} ${books.length === 1 ? "book" : "books"}`}</span></div>
      {isLoadingBooks ? <p className="library-empty">Opening your private shelf…</p> : books.length === 0 ? <p className="library-empty">Your first uploaded PDF will appear here, ready to reopen whenever you return.</p> : <div className="library-book-grid">{books.map((item) => <article className={`library-book-card is-${item.status}`} key={item.id}><span className="library-book-badge">PDF</span><div><p>{item.status === "ready" ? "Ready to study" : item.status === "processing" ? "Still processing" : "Needs attention"}</p><h3>{item.title}</h3><small>{item.pageCount} pages · added {new Date(item.createdAt).toLocaleDateString()}</small></div>{item.status === "ready" ? <a href={`/reader/${item.id}`}>Open reader <b>→</b></a> : <span className="library-book-status">{item.status === "processing" ? "Preparing…" : "Retry upload"}</span>}</article>)}</div>}
    </section>
    <section className="library-note"><p className="eyebrow">Privacy by design</p><p>Original PDFs remain in your private storage bucket. Chunks and retrieval are scoped to the signed-in owner through Supabase Row Level Security.</p></section>
  </main>;
}
