"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrowserAccessToken } from "@/lib/rag/browser-session";
import type { DefinitionTone, StudyAction, StudyResponse, StudyResult, VisualizeScope } from "@/types/study";
import { storedLanguage, type PreferredLanguage } from "@/lib/preferences/language";
import { attachmentIcon } from "@/components/reader/attachment-marker";
import { DocumentWorkspace, type MarkupAnnotation, type PassageAnchor, type SavedVisualMap, type SelectedPassage } from "@/components/reader/document-workspace";

type ReaderBook = { id: string; title: string; pageCount: number; status: string };
type ReaderStudyArtifact = {
  id: string;
  action: StudyAction;
  result: StudyResult;
  anchor?: PassageAnchor;
  scope?: Exclude<VisualizeScope, "selection">;
  pageNumber?: number;
  chapterQuery?: string;
  createdAt: string;
};

type PrivateReaderStore = { version: 1; artifacts: ReaderStudyArtifact[]; annotations: MarkupAnnotation[]; bookmarks: number[]; history: number[] };

function storeKey(bookId: string) { return `studymate:private-reader:${bookId}`; }
function makeId(prefix: string) { return `${prefix}:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`; }

export default function BookReader({ params }: { params: Promise<{ id: string }> }) {
  const [bookId, setBookId] = useState<string>();
  const [book, setBook] = useState<ReaderBook>();
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [selection, setSelection] = useState<SelectedPassage>();
  const [result, setResult] = useState<StudyResult>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [message, setMessage] = useState("Opening your private copy…");
  const [working, setWorking] = useState<StudyAction>();
  const [targetLanguage, setTargetLanguage] = useState<PreferredLanguage>("English");
  const [definitionTone, setDefinitionTone] = useState<DefinitionTone>("Clear");
  const [artifacts, setArtifacts] = useState<ReaderStudyArtifact[]>([]);
  const [annotations, setAnnotations] = useState<MarkupAnnotation[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [readingHistory, setReadingHistory] = useState<number[]>([1]);
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => { params.then(({ id }) => setBookId(id)); }, [params]);
  useEffect(() => setTargetLanguage(storedLanguage()), []);
  useEffect(() => {
    if (!bookId) return;
    setStoreReady(false);
    setArtifacts([]); setAnnotations([]); setBookmarks([]); setReadingHistory([1]);
    try {
      const saved = window.localStorage.getItem(storeKey(bookId));
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PrivateReaderStore>;
        if (Array.isArray(parsed.artifacts)) setArtifacts(parsed.artifacts);
        if (Array.isArray(parsed.annotations)) setAnnotations(parsed.annotations);
        if (Array.isArray(parsed.bookmarks)) setBookmarks(parsed.bookmarks.filter((page): page is number => typeof page === "number" && page > 0));
        if (Array.isArray(parsed.history)) setReadingHistory(parsed.history.filter((page): page is number => typeof page === "number" && page > 0).slice(0, 8));
      }
    } catch {
      // A corrupt private cache should never prevent the source PDF from opening.
    } finally {
      setStoreReady(true);
    }
  }, [bookId]);
  useEffect(() => {
    if (!bookId || !storeReady) return;
    const store: PrivateReaderStore = { version: 1, artifacts, annotations, bookmarks, history: readingHistory };
    try { window.localStorage.setItem(storeKey(bookId), JSON.stringify(store)); } catch { /* Storage is optional for private reading. */ }
  }, [annotations, artifacts, bookmarks, bookId, readingHistory, storeReady]);
  useEffect(() => {
    if (!bookId) return;
    (async () => {
      try {
        const token = await getBrowserAccessToken();
        const response = await fetch(`/api/books/${bookId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json() as { ok: boolean; error?: string; book?: ReaderBook; url?: string };
        if (!data.ok || !data.book || !data.url) throw new Error(data.error ?? "Could not open this book.");
        setBook(data.book); setPdfUrl(data.url); setMessage("");
      } catch (error) { setMessage(error instanceof Error ? error.message : "Could not open this book."); }
    })();
  }, [bookId]);

  const attachments = useMemo(() => artifacts.reduce<Record<string, StudyAction[]>>((current, artifact) => {
    if (!artifact.anchor) return current;
    const actions = current[artifact.anchor.key] ?? [];
    if (!actions.includes(artifact.action)) current[artifact.anchor.key] = [...actions, artifact.action];
    return current;
  }, {}), [artifacts]);
  const attachedAnchors = useMemo(() => Array.from(new Map(artifacts.filter((artifact) => artifact.anchor).map((artifact) => [artifact.anchor!.key, artifact.anchor!])).values()), [artifacts]);
  const savedMaps = useMemo<SavedVisualMap[]>(() => artifacts.filter((artifact): artifact is ReaderStudyArtifact & { result: Extract<StudyResult, { action: "visualize" }>; scope: Exclude<VisualizeScope, "selection"> } => artifact.action === "visualize" && !!artifact.scope && artifact.result.action === "visualize").map((artifact) => ({ id: artifact.id, result: artifact.result, scope: artifact.scope, createdAt: artifact.createdAt })), [artifacts]);

  async function study(action: StudyAction, visualization?: { scope: Exclude<VisualizeScope, "selection">; pageNumber: number; chapterQuery?: string }) {
    const usesSyllabusScope = action === "visualize" && !!visualization;
    if (!usesSyllabusScope && (!selection || selection.text.trim().length < 8)) { setMessage("Select a sentence or passage before choosing an action."); return; }
    if (!bookId) return;
    setWorking(action); setMessage("");
    if (usesSyllabusScope) { setResult(undefined); setSheetOpen(true); }
    try {
      const token = await getBrowserAccessToken();
      const scope = visualization?.scope ?? "selection";
      const sourceText = usesSyllabusScope ? `Create a grounded syllabus mind map for ${scope === "book" ? "the whole book" : scope === "page" ? `page ${visualization?.pageNumber}` : visualization?.chapterQuery ?? "the requested chapter"}.` : selection!.text;
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, text: sourceText, bookId, pageNumber: visualization?.pageNumber ?? selection?.anchor.pageNumber, targetLanguage, definitionTone, visualizeScope: scope, chapterQuery: visualization?.chapterQuery }),
      });
      const data = await response.json() as StudyResponse;
      if (!data.ok) throw new Error(data.error);
      setResult(data.result);
      const artifact: ReaderStudyArtifact = { id: makeId("study"), action, result: data.result, anchor: usesSyllabusScope ? undefined : selection?.anchor, scope: visualization?.scope, pageNumber: visualization?.pageNumber ?? selection?.anchor.pageNumber, chapterQuery: visualization?.chapterQuery, createdAt: new Date().toISOString() };
      setArtifacts((current) => [artifact, ...current.filter((existing) => usesSyllabusScope
        ? !(existing.action === "visualize" && existing.scope === artifact.scope && existing.pageNumber === artifact.pageNumber && existing.chapterQuery === artifact.chapterQuery)
        : !(existing.anchor?.key === artifact.anchor?.key && existing.action === artifact.action))]);
      setSheetOpen(true);
      setMessage("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The study action could not be completed."); if (usesSyllabusScope) setSheetOpen(false); }
    finally { setWorking(undefined); }
  }

  function openAttachment(anchor: PassageAnchor, action: StudyAction) {
    const saved = artifacts.find((artifact) => artifact.anchor?.key === anchor.key && artifact.action === action)?.result;
    if (!saved) { setMessage("This aid belongs to another session and needs to be generated again."); return; }
    setResult(saved); setSheetOpen(true);
  }

  function openSavedMap(id: string) {
    const saved = artifacts.find((artifact) => artifact.id === id && artifact.result.action === "visualize")?.result;
    if (!saved || saved.action !== "visualize") return;
    setResult(saved); setSheetOpen(true); setMessage("");
  }

  function addMarkup(markup: Omit<MarkupAnnotation, "id" | "createdAt">) {
    const annotation: MarkupAnnotation = { ...markup, id: makeId("markup"), createdAt: new Date().toISOString() };
    setAnnotations((current) => current.some((item) => item.kind === annotation.kind && item.anchor.key === annotation.anchor.key) ? current : [annotation, ...current]);
    setMessage(`${markup.kind === "strike" ? "Strikethrough" : `${markup.kind[0].toUpperCase()}${markup.kind.slice(1)}`} saved to this private reading copy.`);
  }

  function toggleBookmark(page: number) {
    setBookmarks((current) => current.includes(page) ? current.filter((item) => item !== page) : [...current, page].sort((left, right) => left - right));
  }

  function rememberPage(page: number) {
    setReadingHistory((current) => [page, ...current.filter((item) => item !== page)].slice(0, 8));
  }

  function readAloud() {
    const text = result ? speechText(result) : selection?.text;
    if (!text) { setMessage("Select a passage or open a study aid before using read aloud."); return; }
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { setMessage("Read aloud is not available in this browser."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (result?.action === "translate") utterance.lang = result.languageCode;
    else if (targetLanguage === "English") utterance.lang = "en-US";
    utterance.rate = 0.93;
    window.speechSynthesis.speak(utterance);
    setMessage("Reading aloud.");
  }

  return <main className="book-reader-page">
    {pdfUrl && book ? <DocumentWorkspace
      url={pdfUrl}
      title={book.title}
      totalPages={book.pageCount}
      onSelect={(nextSelection) => { setSelection(nextSelection); setResult(undefined); setSheetOpen(false); setMessage(""); }}
      onAction={(action) => void study(action)}
      attachedActions={attachments}
      attachedAnchors={attachedAnchors}
      onOpenAttachment={openAttachment}
      annotations={annotations}
      onAddMarkup={addMarkup}
      bookmarkedPages={bookmarks}
      onToggleBookmark={toggleBookmark}
      readingHistory={readingHistory}
      onNavigate={rememberPage}
      targetLanguage={targetLanguage}
      onTargetLanguageChange={setTargetLanguage}
      definitionTone={definitionTone}
      onDefinitionToneChange={setDefinitionTone}
      workingAction={working}
      onVisualizeScope={(request) => void study("visualize", request)}
      savedMaps={savedMaps}
      onOpenSavedMap={openSavedMap}
    /> : <div className="reader-bootstrap"><span>✦</span><strong>{message}</strong>{message && message !== "Opening your private copy…" && <a href="/library">Return to private library</a>}</div>}
    {sheetOpen && <StudyResultSheet result={result} loading={working === "visualize" && !result} onClose={() => setSheetOpen(false)} onListen={readAloud} />}
    {message && !sheetOpen && <p className="reader-toast" role="status">{message}</p>}
  </main>;
}

function speechText(result: StudyResult) {
  if (result.action === "define") return `${result.title}. ${result.definition}. ${result.usage}`;
  if (result.action === "translate") return `${result.translation}. ${result.note ?? ""}`;
  if (result.action === "visualize") return `${result.title}. ${result.summary}. ${result.infographic.takeaway}`;
  return `${result.title}. ${result.body}. ${result.reflection}`;
}

function StudyResultSheet({ result, loading, onClose, onListen }: { result?: StudyResult; loading?: boolean; onClose: () => void; onListen: () => void }) {
  if (!result) return <aside className="study-result-sheet study-result-loading" aria-label="Building visual study result">
    <header><div><span>⌘ visualize</span><strong>Building your mind map</strong></div><button type="button" aria-label="Close study result" onClick={onClose}>×</button></header>
    <div className="study-sheet-loader"><span className="loading-orbit">✦</span><strong>{loading ? "Reading the book structure" : "Preparing your study map"}</strong><p>Finding the relevant pages, shaping the hierarchy, and laying out the infographic.</p><div><span>1&nbsp; Grounding in source</span><span>2&nbsp; Connecting ideas</span><span>3&nbsp; Rendering map</span></div></div>
  </aside>;
  return <aside className="study-result-sheet" aria-label="Study result">
    <header><div><span>{attachmentIcon[result.action]} {result.action}</span><strong>{result.title}</strong></div><div><button type="button" onClick={onListen}>Listen</button><button type="button" aria-label="Close study result" onClick={onClose}>×</button></div></header>
    {result.action === "define" && <div className="result-prose"><p className="result-definition">{result.definition}</p>{result.pronunciation && <p className="result-pronunciation">{result.pronunciation}</p>}<p>{result.usage}</p></div>}
    {result.action === "translate" && <div className="result-prose"><p className="result-translation">{result.translation}</p>{result.note && <p>{result.note}</p>}</div>}
    {result.action === "note" && <div className="result-prose"><p>{result.body}</p><p className="result-reflection">Reflect: {result.reflection}</p></div>}
    {result.action === "visualize" && <VisualStudyResult result={result} />}
  </aside>;
}

function VisualStudyResult({ result }: { result: Extract<StudyResult, { action: "visualize" }> }) {
  const outgoing = new Map(result.nodes.map((node) => [node.id, [] as string[]]));
  const incoming = new Set<string>();
  for (const edge of result.edges) {
    outgoing.get(edge.from)?.push(edge.to);
    incoming.add(edge.to);
  }
  const roots = result.nodes.filter((node) => !incoming.has(node.id));
  const queue = [...(roots.length ? roots : result.nodes.slice(0, 1))];
  const depths = new Map(queue.map((node) => [node.id, 0]));
  while (queue.length) {
    const node = queue.shift()!;
    const depth = depths.get(node.id) ?? 0;
    for (const child of outgoing.get(node.id) ?? []) {
      if (!depths.has(child)) {
        depths.set(child, depth + 1);
        const childNode = result.nodes.find((item) => item.id === child);
        if (childNode) queue.push(childNode);
      }
    }
  }
  for (const node of result.nodes) if (!depths.has(node.id)) depths.set(node.id, 0);
  const maximumDepth = Math.max(...depths.values(), 0);
  const columns = new Map<number, typeof result.nodes>();
  for (const node of result.nodes) {
    const depth = depths.get(node.id) ?? 0;
    columns.set(depth, [...(columns.get(depth) ?? []), node]);
  }
  const points = new Map<string, [number, number]>();
  for (const [depth, nodes] of columns) {
    nodes.forEach((node, index) => points.set(node.id, [10 + (depth * 80) / Math.max(1, maximumDepth), 9 + ((index + 1) * 82) / (nodes.length + 1)]));
  }
  const mapHeight = Math.max(360, ...[...columns.values()].map((nodes) => nodes.length * 86 + 70));
  return <div className="visual-study-result"><p className="visual-summary">{result.summary}</p><section><div className="visual-section-title"><span>01</span><strong>{result.nodes.length > 5 ? "Syllabus mind map" : "Mind map"}</strong><small>Grounded in your PDF</small></div><div className="concept-map notebook-map" style={{ minHeight: mapHeight }} aria-label="Generated concept map"> <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{result.edges.map((edge, index) => { const from = points.get(edge.from); const to = points.get(edge.to); if (!from || !to) return null; const bend = Math.max(6, (to[0] - from[0]) * .52); return <path key={`${edge.from}-${edge.to}-${index}`} d={`M ${from[0]} ${from[1]} C ${from[0] + bend} ${from[1]}, ${to[0] - bend} ${to[1]}, ${to[0]} ${to[1]}`} />; })}</svg>{result.nodes.map((node) => { const point = points.get(node.id) ?? [50, 50]; const isLeaf = (outgoing.get(node.id)?.length ?? 0) === 0; return <article key={node.id} className={`concept-node ${isLeaf ? "is-leaf" : ""} ${depths.get(node.id) === 0 ? "is-root" : ""}`} style={{ left: `${point[0]}%`, top: `${point[1]}%` }}><strong>{node.label}</strong><small>{node.detail}</small>{!isLeaf && <i aria-hidden="true">›</i>}</article>; })}</div></section><section><div className="visual-section-title"><span>02</span><strong>Infographic brief</strong></div><div className="infographic"><div className="infographic-intro"><b>{result.infographic.headline}</b><p>{result.infographic.takeaway}</p></div><div className="infographic-panels">{result.infographic.panels.map((panel, index) => <article key={`${panel.label}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{panel.label}</strong><p>{panel.detail}</p></article>)}</div></div></section></div>;
}
