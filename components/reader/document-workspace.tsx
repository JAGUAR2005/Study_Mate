"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { languages, type PreferredLanguage } from "@/lib/preferences/language";
import type { DefinitionTone, StudyAction, StudyResult, VisualizeScope } from "@/types/study";
import { attachmentIcon } from "@/components/reader/attachment-marker";

type PageText = { pageNumber: number; heading: string; searchText: string };
type PdfDocument = { numPages: number; getPage: (pageNumber: number) => Promise<any>; destroy: () => Promise<void> };
type PdfRuntime = { TextLayer: new (options: { textContentSource: unknown; container: HTMLElement; viewport: unknown }) => { render: () => Promise<unknown> } };
type PdfLoad = { document: PdfDocument; runtime: PdfRuntime; pages: PageText[] };
type MarkerLocation = { anchor: PassageAnchor; left: number; top: number };

const actions: Array<{ id: StudyAction; label: string }> = [
  { id: "define", label: "Define" },
  { id: "translate", label: "Translate" },
  { id: "visualize", label: "Visualize" },
  { id: "note", label: "Note" },
];

function cleanExtractedText(text: string) {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pageHeading(text: string, pageNumber: number) {
  const firstSentence = cleanExtractedText(text).match(/[^.!?]+[.!?]+|[^.!?]+$/)?.[0]?.trim() ?? "";
  return firstSentence.length > 8 ? firstSentence.slice(0, 68) : `Page ${pageNumber}`;
}

async function loadPdf(url: string): Promise<PdfLoad> {
  // In-process worker avoids a rewritten worker URL in the Next.js server build.
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs") as unknown as PdfRuntime & { getDocument: (input: { data: Uint8Array; disableFontFace: boolean; useSystemFonts: boolean }) => { promise: Promise<PdfDocument> } };
  const bytes = await fetch(url).then(async (response) => {
    if (!response.ok) throw new Error("Your private PDF link expired. Return to the library and reopen the book.");
    return response.arrayBuffer();
  });
  const document = await pdfjs.getDocument({ data: new Uint8Array(bytes), disableFontFace: true, useSystemFonts: true }).promise;
  const pages: PageText[] = [];
  try {
    for (let index = 0; index < document.numPages; index += 1) {
      const pdfPage = await document.getPage(index + 1);
      const content = await pdfPage.getTextContent();
      const text = cleanExtractedText(content.items.map((item: unknown) => typeof item === "object" && item !== null && "str" in item ? String((item as { str: string }).str) : "").join(" "));
      pages.push({ pageNumber: index + 1, heading: pageHeading(text, index + 1), searchText: text });
      pdfPage.cleanup();
    }
    return { document, runtime: pdfjs, pages };
  } catch (error) {
    await document.destroy();
    throw error;
  }
}

export type PassageAnchor = { pageNumber: number; paragraphIndex: number; key: string; left: number; top: number };
export type SelectedPassage = { text: string; anchor: PassageAnchor };
export type MarkupKind = "highlight" | "underline" | "strike";
export type SelectionRect = { left: number; top: number; width: number; height: number };
export type MarkupAnnotation = { id: string; kind: MarkupKind; anchor: PassageAnchor; text: string; rects: SelectionRect[]; createdAt: string };
export type SavedVisualMap = { id: string; result: Extract<StudyResult, { action: "visualize" }>; scope: Exclude<VisualizeScope, "selection">; createdAt: string };

function markerKey(pageNumber: number, text: string, left: number, top: number) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) | 0;
  return `${pageNumber}:selection:${Math.round(left)}:${Math.round(top)}:${Math.abs(hash)}`;
}

export function DocumentWorkspace({
  url,
  title,
  totalPages,
  onSelect,
  onAction,
  attachedActions,
  attachedAnchors,
  onOpenAttachment,
  annotations,
  onAddMarkup,
  bookmarkedPages,
  onToggleBookmark,
  readingHistory,
  onNavigate,
  targetLanguage,
  onTargetLanguageChange,
  definitionTone,
  onDefinitionToneChange,
  workingAction,
  onVisualizeScope,
  savedMaps,
  onOpenSavedMap,
}: {
  url: string;
  title: string;
  totalPages: number;
  onSelect: (selection: SelectedPassage) => void;
  onAction: (action: StudyAction) => void;
  attachedActions: Record<string, StudyAction[]>;
  attachedAnchors: PassageAnchor[];
  onOpenAttachment: (anchor: PassageAnchor, action: StudyAction) => void;
  annotations: MarkupAnnotation[];
  onAddMarkup: (markup: Omit<MarkupAnnotation, "id" | "createdAt">) => void;
  bookmarkedPages: number[];
  onToggleBookmark: (page: number) => void;
  readingHistory: number[];
  onNavigate: (page: number) => void;
  targetLanguage: PreferredLanguage;
  onTargetLanguageChange: (language: PreferredLanguage) => void;
  definitionTone: DefinitionTone;
  onDefinitionToneChange: (tone: DefinitionTone) => void;
  workingAction?: StudyAction;
  onVisualizeScope: (request: { scope: Exclude<VisualizeScope, "selection">; pageNumber: number; chapterQuery?: string }) => void;
  savedMaps: SavedVisualMap[];
  onOpenSavedMap: (id: string) => void;
}) {
  const [pdf, setPdf] = useState<PdfLoad>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectedAnchor, setSelectedAnchor] = useState<PassageAnchor>();
  const [selectionRects, setSelectionRects] = useState<SelectionRect[]>([]);
  const [markerLocations, setMarkerLocations] = useState<Record<string, MarkerLocation>>({});
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [chapterQuery, setChapterQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scaleMode, setScaleMode] = useState<"fit" | "large" | "comfortable">("comfortable");
  const [renderVersion, setRenderVersion] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const pageFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setPdf(undefined); setPage(1); setSelectedText(""); setSelectedAnchor(undefined); setSelectionRects([]); setMarkerLocations({});
    void loadPdf(url).then((loaded) => {
      if (!active) { void loaded.document.destroy(); return; }
      setPdf(loaded);
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "We could not open this PDF."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url]);

  useEffect(() => () => { if (pdf) void pdf.document.destroy(); }, [pdf]);

  useEffect(() => {
    const onResize = () => setRenderVersion((version) => version + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!pdf || !canvasRef.current || !textLayerRef.current || !pageFrameRef.current) return;
    let active = true;
    let task: { cancel?: () => void } | undefined;
    setRendering(true);
    void (async () => {
      try {
        const pdfPage = await pdf.document.getPage(page);
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const scrollArea = pageFrameRef.current?.parentElement;
        const scrollStyles = scrollArea ? window.getComputedStyle(scrollArea) : undefined;
        const frameWidth = Math.max(280, (scrollArea?.clientWidth ?? baseViewport.width) - (Number.parseFloat(scrollStyles?.paddingLeft ?? "0") + Number.parseFloat(scrollStyles?.paddingRight ?? "0")));
        const maxWidth = scaleMode === "large" ? 1600 : scaleMode === "comfortable" ? 1360 : 1160;
        const scale = Math.min(maxWidth, frameWidth) / baseViewport.width;
        const viewport = pdfPage.getViewport({ scale });
        const canvas = canvasRef.current;
        const textLayer = textLayerRef.current;
        if (!canvas || !textLayer || !active) return;
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        textLayer.replaceChildren();
        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;
        const nextTask = pdfPage.render({ canvasContext: canvas.getContext("2d", { alpha: false })!, viewport, transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0] });
        task = nextTask;
        await nextTask.promise;
        if (!active) return;
        const textContent = await pdfPage.getTextContent();
        const layer = new pdf.runtime.TextLayer({ textContentSource: textContent, container: textLayer, viewport });
        await layer.render();
        pdfPage.cleanup();
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "We could not render this page.");
      } finally {
        if (active) setRendering(false);
      }
    })();
    return () => { active = false; task?.cancel?.(); };
  }, [pdf, page, scaleMode, renderVersion]);

  const pageCount = pdf?.pages.length || totalPages;
  const matchingPages = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query || !pdf) return pdf?.pages ?? [];
    return pdf.pages.filter((item) => `${item.heading} ${item.searchText}`.toLocaleLowerCase().includes(query));
  }, [pdf, searchQuery]);
  const currentMarkers = useMemo(() => {
    const knownAnchors = [...attachedAnchors, ...Object.values(markerLocations).map((marker) => marker.anchor)];
    return Array.from(new Map(knownAnchors.map((anchor) => [anchor.key, anchor])).values())
      .filter((anchor) => anchor.pageNumber === page && (attachedActions[anchor.key]?.length ?? 0) > 0);
  }, [attachedActions, attachedAnchors, markerLocations, page]);
  const pageAnnotations = annotations.filter((annotation) => annotation.anchor.pageNumber === page);

  function goToPage(nextPage: number) {
    const targetPage = Math.max(1, Math.min(pageCount, nextPage));
    setPage(targetPage);
    onNavigate(targetPage);
    setSelectedText(""); setSelectedAnchor(undefined); setSelectionRects([]);
  }

  useEffect(() => {
    pageFrameRef.current?.scrollIntoView({ block: "start" });
  }, [page]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) return;
      if (event.key === "ArrowRight") { event.preventDefault(); goToPage(page + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); goToPage(page - 1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [page, pageCount]);

  function captureSelection() {
    const selection = window.getSelection();
    const text = selection?.toString().replace(/\s+/g, " ").trim() ?? "";
    if (text.length < 8 || !pageFrameRef.current?.contains(selection?.anchorNode ?? null) || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    const rangeRect = range.getBoundingClientRect();
    const frameRect = pageFrameRef.current.getBoundingClientRect();
    const left = Math.max(1, Math.min(98, ((rangeRect.right - frameRect.left) / frameRect.width) * 100));
    const top = Math.max(1, Math.min(98, ((rangeRect.bottom - frameRect.top) / frameRect.height) * 100));
    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0).map((rect) => ({
      left: Math.max(0, Math.min(100, ((rect.left - frameRect.left) / frameRect.width) * 100)),
      top: Math.max(0, Math.min(100, ((rect.top - frameRect.top) / frameRect.height) * 100)),
      width: Math.max(0.25, Math.min(100, (rect.width / frameRect.width) * 100)),
      height: Math.max(0.25, Math.min(100, (rect.height / frameRect.height) * 100)),
    }));
    const anchor: PassageAnchor = { pageNumber: page, paragraphIndex: Math.round(top * 10), key: markerKey(page, text, left, top), left, top };
    setMarkerLocations((current) => ({ ...current, [anchor.key]: { anchor, left, top } }));
    setSelectedText(text); setSelectedAnchor(anchor); setSelectionRects(rects); onSelect({ text, anchor });
  }

  function addMarkup(kind: MarkupKind) {
    if (!selectedAnchor || !selectedText || selectionRects.length === 0) return;
    onAddMarkup({ kind, anchor: selectedAnchor, text: selectedText, rects: selectionRects });
    window.getSelection()?.removeAllRanges();
    setSelectedText(""); setSelectedAnchor(undefined); setSelectionRects([]);
  }

  function requestSyllabusMap(scope: Exclude<VisualizeScope, "selection">) {
    if (scope === "chapter" && chapterQuery.trim().length < 2) return;
    onVisualizeScope({ scope, pageNumber: page, chapterQuery: scope === "chapter" ? chapterQuery.trim() : undefined });
    setMapOpen(false);
  }

  return <section className="focus-reader">
    <header className="focus-reader-bar">
      <div className="focus-bar-start"><a href="/library" aria-label="Return to library">←</a><button type="button" aria-expanded={outlineOpen} onClick={() => setOutlineOpen((open) => !open)}>☰ <span>Pages</span></button><button type="button" className="focus-map-button" aria-expanded={mapOpen} onClick={() => setMapOpen((open) => !open)}>⌘ <span>Map</span></button></div>
      <div className="focus-book-label"><strong>{title}</strong><small>{rendering ? "Rendering page…" : "Private reading copy"}</small></div>
      <div className="focus-reader-controls"><button type="button" title="Previous page (Left Arrow)" aria-label="Previous page" disabled={page === 1} onClick={() => goToPage(page - 1)}>←</button><label><span className="sr-only">Current page</span><input aria-label="Current page" value={page} type="number" min={1} max={pageCount} onChange={(event) => goToPage(Number(event.target.value) || 1)} /></label><small>/ {pageCount}</small><button type="button" title="Next page (Right Arrow)" aria-label="Next page" disabled={page >= pageCount} onClick={() => goToPage(page + 1)}>→</button><i /><button type="button" className={bookmarkedPages.includes(page) ? "is-bookmarked" : ""} title="Bookmark page" aria-label="Bookmark page" aria-pressed={bookmarkedPages.includes(page)} onClick={() => onToggleBookmark(page)}>⌑</button><button type="button" title="Change page width" aria-label="Change page width" onClick={() => setScaleMode((mode) => mode === "fit" ? "comfortable" : mode === "comfortable" ? "large" : "fit")}>Aa</button></div>
    </header>
    {outlineOpen && <aside className="reader-outline" aria-label="Document pages">
      <div className="outline-heading"><strong>Pages</strong><button type="button" aria-label="Close pages" onClick={() => setOutlineOpen(false)}>×</button></div>
      <div className="outline-tools"><button type="button" aria-pressed={searchOpen} onClick={() => setSearchOpen((open) => !open)}>⌕ Find in book</button>{searchOpen && <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Find a word or phrase" aria-label="Find in this book" />}</div>
      <div className="outline-pages">{matchingPages.map((item) => <button type="button" className={item.pageNumber === page ? "is-current" : ""} key={item.pageNumber} onClick={() => { goToPage(item.pageNumber); setOutlineOpen(false); }}><b>{String(item.pageNumber).padStart(2, "0")}</b><span>{item.heading}</span></button>)}{matchingPages.length === 0 && <p>No matching pages.</p>}</div>
      <div className="outline-history"><span>Recently read</span>{readingHistory.map((visited) => <button key={visited} type="button" onClick={() => { goToPage(visited); setOutlineOpen(false); }}>Page {visited}</button>)}</div>
    </aside>}
    {mapOpen && <section className="syllabus-launcher" aria-label="Syllabus mind map"><header><div><span>Visualize</span><strong>Map your source</strong></div><button type="button" aria-label="Close syllabus map menu" onClick={() => setMapOpen(false)}>×</button></header><p>Generate a grounded map from the current page, a named chapter, or the book’s index and content.</p><div className="syllabus-map-actions"><button type="button" disabled={!!workingAction} onClick={() => requestSyllabusMap("page")}><b>01</b><span><strong>This page</strong><small>Map page {page}</small></span></button><button type="button" disabled={!!workingAction} onClick={() => requestSyllabusMap("book")}><b>02</b><span><strong>Whole book</strong><small>Use contents or distributed chapters</small></span></button></div><label>Chapter or topic<input value={chapterQuery} onChange={(event) => setChapterQuery(event.target.value)} placeholder="e.g. Red team evaluation" /></label><button className="syllabus-chapter-button" type="button" disabled={!!workingAction || chapterQuery.trim().length < 2} onClick={() => requestSyllabusMap("chapter")}>Map this chapter →</button>{savedMaps.length > 0 && <div className="saved-map-list"><span>Saved maps · this device</span>{savedMaps.slice(0, 4).map((map) => <button type="button" key={map.id} onClick={() => { onOpenSavedMap(map.id); setMapOpen(false); }}><b>{map.scope === "book" ? "Book" : map.scope === "chapter" ? "Chapter" : "Page"}</b><em>{map.result.title}</em></button>)}</div>}</section>}
    <section className="focus-reader-canvas">
      <div className="focus-reader-scroll">
        {loading && <div className="reader-loading"><span className="loading-orbit">✦</span><strong>Preparing the original PDF page</strong><small>Keeping your source layout intact…</small></div>}
        {error && <div className="reader-load-error"><strong>We couldn’t prepare this PDF page.</strong><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div>}
        {!loading && !error && <div className={`pdf-page-stage pdf-scale-${scaleMode}`} ref={pageFrameRef} onMouseUp={captureSelection}>
          <canvas ref={canvasRef} aria-label={`PDF page ${page}`} />
          {pageAnnotations.length > 0 && <div className="pdf-markup-layer" aria-label={`${pageAnnotations.length} saved markup annotations`}>{pageAnnotations.flatMap((annotation) => annotation.rects.map((rect, index) => <span key={`${annotation.id}-${index}`} className={`pdf-markup pdf-markup-${annotation.kind}`} title={`${annotation.kind}: ${annotation.text.slice(0, 80)}`} style={{ left: `${rect.left}%`, top: `${rect.top}%`, width: `${rect.width}%`, height: `${rect.height}%` }} />))}</div>}
          <div ref={textLayerRef} className="pdf-text-layer" aria-label={`Selectable text from page ${page}`} />
          {currentMarkers.map((anchor) => <span key={anchor.key} className="pdf-attachment-marker" style={{ left: `${anchor.left}%`, top: `${anchor.top}%` }}>{(attachedActions[anchor.key] ?? []).map((action) => <button type="button" key={action} aria-label={`Open attached ${action}`} title={`Open ${action}`} onClick={() => onOpenAttachment(anchor, action)}>{attachmentIcon[action]}</button>)}</span>)}
          {rendering && <div className="pdf-page-loader" role="status"><span className="loading-orbit">✦</span><strong>Rendering page {page}</strong><small>Aligning the source and selection layer…</small></div>}
          {selectedText && selectedAnchor && <div className="selection-popover" role="toolbar" aria-label="Study and markup tools for selected passage"><div className="selection-popover-copy"><span>Selected passage</span><small>{selectedText.length > 72 ? `${selectedText.slice(0, 72)}…` : selectedText}</small></div><div className="selection-ai-tools">{actions.map((action) => <button key={action.id} type="button" disabled={!!workingAction} onClick={() => onAction(action.id)}><b>{attachmentIcon[action.id]}</b>{workingAction === action.id ? "Working…" : action.label}</button>)}</div><div className="selection-markup-tools"><span>Markup</span><button type="button" disabled={!!workingAction} onClick={() => addMarkup("highlight")}>Highlight</button><button type="button" disabled={!!workingAction} onClick={() => addMarkup("underline")}>Underline</button><button type="button" disabled={!!workingAction} onClick={() => addMarkup("strike")}>Strike</button></div><div className="selection-preferences"><label>Definition voice<select value={definitionTone} onChange={(event) => onDefinitionToneChange(event.target.value as DefinitionTone)}>{["Clear", "Professional", "Friendly", "Academic"].map((tone) => <option key={tone}>{tone}</option>)}</select></label><label>Translate to<select value={targetLanguage} onChange={(event) => onTargetLanguageChange(event.target.value as PreferredLanguage)}>{languages.map((language) => <option key={language.code} value={language.name}>{language.name}</option>)}</select></label></div></div>}
        </div>}
      </div>
    </section>
  </section>;
}
