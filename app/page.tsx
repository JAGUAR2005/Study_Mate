"use client";

import { useEffect, useState } from "react";
import type { StudyAction, StudyResponse, StudyResult } from "@/types/study";
import { languages, storedLanguage, type PreferredLanguage } from "@/lib/preferences/language";
import { MoteMascot, StudyMateLogo } from "@/components/brand/studymate-brand";
import { AttachmentMarker, attachmentIcon } from "@/components/reader/attachment-marker";

const tools = [
  {
    numeral: "I",
    icon: "⌑",
    name: "Define.",
    text: "Dictionary-grade meanings surfaced beside the sentence, never on top of it.",
  },
  {
    numeral: "II",
    icon: "文",
    name: "Translate.",
    text: "A fluent translation that holds on to the nuance of the original thought.",
  },
  {
    numeral: "III",
    icon: "◌",
    name: "Explain.",
    text: "A clear interpretation grounded in the paragraph you are actually reading.",
  },
  {
    numeral: "IV",
    icon: "⌘",
    name: "Visualize.",
    text: "Dense ideas become clean, memorable diagrams in a moment.",
  },
  {
    numeral: "V",
    icon: "▤",
    name: "Note.",
    text: "Quiet margin notes tied to the exact sentence, ready when you return.",
  },
];

export default function Home() {
  const [activeTool, setActiveTool] = useState(2);
  const [showReader, setShowReader] = useState(false);

  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="StudyMate home"><StudyMateLogo /></a>
        <div className="nav-links">
          <a href="/library">Library</a>
          <a href="/settings">Preferences</a>
          <a href="#instruments">Toolkit</a>
          <a href="#how-it-works">Method</a>
          <a className="nav-cta" href="/library">Upload PDF</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy reveal">
          <p className="eyebrow">§ a gentler study companion</p>
          <h1>Read deeply.<br /><em>Keep what matters.</em></h1>
          <p className="lede">StudyMate turns the passages that stop you into notes, explanations, and visual memory cues—without taking you away from the page.</p>
          <div className="hero-actions"><a className="hero-upload" href="/library">Upload your PDF <span>↗</span></a><button className="text-button" onClick={() => setShowReader(true)}>Try the reading room <span>→</span></button></div>
        </div>

        <div className="book-stage" aria-label="A preview of the StudyMate reader">
          <div className="orbit-card definition-card float-one">
            <p className="card-label">⌑ &nbsp; Define</p>
            <strong>ver·nac·u·lar</strong>
            <span>everyday speech; the language that feels like home.</span>
          </div>
          <div className="orbit-card translate-card float-two">
            <p className="card-label">文 &nbsp; Translate</p>
            <strong>→ 日本語</strong>
            <span>彼女は雨の音を聞くのが好きだった。</span>
          </div>
          <div className="orbit-card visual-card float-three">
            <p className="card-label">⌘ &nbsp; Visualize</p>
            <strong>Cause → Symptom → Remedy</strong>
            <span>3 nodes · 2 connections</span>
          </div>
          <div className="orbit-card note-card float-four">
            <p className="card-label">▤ &nbsp; Note</p>
            <strong>margin — page 42</strong>
            <span>Return to this when revising.</span>
          </div>

          <div className="book-cover">
            <div className="book-spine" />
            <div className="book-topline">Vol. I — MMXXVI</div>
            <div className="book-dash" />
            <div className="book-title">The<br />Attentive<br />Reader</div>
            <div className="book-footer">A field manual<br /><em>for the age of infinite text</em></div>
            <div className="book-seal">s</div>
          </div>
          <div className="mote-greeting"><MoteMascot size={76} /><span><b>Meet Mote.</b><br />Your quiet reading companion.</span></div>
        </div>
      </section>

      <div className="marquee" aria-label="StudyMate principles">
        <div className="marquee-track">
          <div className="marquee-group"><em>The interface disappears.</em><b>✦</b><em>Only the text — and the understanding — remain.</em><b>✦</b><em>Highlight anything.</em><b>✦</b><em>The interface disappears.</em><b>✦</b></div>
          <div className="marquee-group" aria-hidden="true"><em>The interface disappears.</em><b>✦</b><em>Only the text — and the understanding — remain.</em><b>✦</b><em>Highlight anything.</em><b>✦</b><em>The interface disappears.</em><b>✦</b></div>
        </div>
      </div>

      <section className="toolkit" id="instruments">
        <div className="section-intro">
          <div>
            <p className="eyebrow">§ toolkit</p>
            <div className="rule" />
            <h2>Five quiet<br /><em>instruments,</em><br />summoned by<br />a single highlight.</h2>
          </div>
          <p className="section-copy">The interface rises only when you need it. Select any sentence, choose an instrument, and receive a thoughtful answer grounded in the surrounding passage. Then it recedes, leaving you with the text.</p>
        </div>

        <div className="tool-grid">
          {tools.map((tool, index) => (
            <button
              className={`tool-card ${activeTool === index ? "is-active" : ""}`}
              key={tool.name}
              onClick={() => setActiveTool(index)}
              aria-pressed={activeTool === index}
            >
              <span className="tool-meta"><span>{tool.numeral}</span><span className="tool-icon">{tool.icon}</span></span>
              <h3>{tool.name}</h3>
              <p>{tool.text}</p>
              <span className="tool-arrow">Explore <b>↗</b></span>
            </button>
          ))}
          <aside className="editorial-card">
            <p className="eyebrow">Editorial</p>
            <blockquote>“The interface disappears. Only the text — and the understanding — remain.”</blockquote>
            <cite>— StudyMate field notes</cite>
          </aside>
        </div>
      </section>

      <section className="method" id="how-it-works">
        <div className="method-number">01 — 03</div>
        <div>
          <p className="eyebrow">§ how it feels</p>
          <h2>Close the gap<br />between <em>reading</em> and<br /><em>remembering.</em></h2>
        </div>
        <div className="method-steps">
          <article><span>01</span><h3>Bring a text.</h3><p>Upload a PDF from your shelf. StudyMate stays out of sight until you ask for it.</p></article>
          <article><span>02</span><h3>Follow your curiosity.</h3><p>Highlight the sentence that holds you up. Choose the kind of help you need.</p></article>
          <article><span>03</span><h3>Leave with a thread.</h3><p>Save a note, a visual, or a question—something worth returning to later.</p></article>
        </div>
      </section>

      <section className="closing">
        <p className="eyebrow">§ begin where you are</p>
        <h2>Your next<br /><em>good question</em><br />is waiting.</h2>
        <button className="primary-button" onClick={() => setShowReader(true)}>Open the reading room <span>↗</span></button>
      </section>

      <footer><span>© 2026 StudyMate</span><span>Made for attentive readers</span><a href="#top">Back to top ↑</a></footer>

      {showReader && <ReaderPreview onClose={() => setShowReader(false)} />}
    </main>
  );
}

const selectedPassage = "Attention is not the absence of distraction; it is the quiet decision to return, again and again, to what is in front of you.";
const readerActions: Array<{ id: StudyAction; label: string; detail: string }> = [
  { id: "define", label: "Define", detail: "Clarify the central term" },
  { id: "translate", label: "Translate", detail: "Keep tone and meaning intact" },
  { id: "visualize", label: "Visualize", detail: "Turn the idea into a map" },
  { id: "note", label: "Note", detail: "Save an active-recall prompt" },
];

function ReaderPreview({ onClose }: { onClose: () => void }) {
  const [selection, setSelection] = useState(false);
  const [result, setResult] = useState<StudyResult | null>(null);
  const [activeAction, setActiveAction] = useState<StudyAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<PreferredLanguage>("English");
  const [attachments, setAttachments] = useState<Partial<Record<StudyAction, StudyResult>>>({});

  useEffect(() => setTargetLanguage(storedLanguage()), []);

  async function requestAction(action: StudyAction) {
    setSelection(true);
    setActiveAction(action);
    setError(null);
    try {
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: selectedPassage,
          context: "There is a way of moving through a page that resembles walking through a familiar room with the lights turned low. You do not need to name everything at once. You only need to stay long enough for its shape to become known. A useful reading life is made from these returns.",
          targetLanguage,
        }),
      });
      const data = (await response.json()) as StudyResponse;
      if (!data.ok) throw new Error(data.error);
      setResult(data.result);
      setAttachments((current) => ({ ...current, [action]: data.result }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The study engine could not complete that request.");
      setResult(null);
    } finally {
      setActiveAction(null);
    }
  }

  return <div className="reader-overlay" role="dialog" aria-modal="true" aria-label="StudyMate reader preview">
    <div className="reader-window">
      <header><button onClick={onClose}>← Library</button><span className="wordmark"><span className="wordmark-mark">s</span> StudyMate<span className="accent">.</span></span><button onClick={onClose}>Close ×</button></header>
      <div className="reader-content">
        <article className="reader-page">
          <p className="eyebrow">Chapter two · The practice of attention</p>
          <h2>To read is to remain.</h2>
          <p>There is a way of moving through a page that resembles walking through a familiar room with the lights turned low. You do not need to name everything at once. You only need to stay long enough for its shape to become known.</p>
          <p className={selection ? "selected-passage" : ""} onClick={() => setSelection(true)}>{selectedPassage}<AttachmentMarker actions={Object.keys(attachments) as StudyAction[]} onOpen={(action) => setResult(attachments[action] ?? null)} /></p>
          <p>A useful reading life is made from these returns. A phrase underlined in the margin. A question left unanswered for the afternoon. A small note that lets the next encounter begin somewhere deeper.</p>
          <div className="selection-controls">
            <button className="select-hint" onClick={() => setSelection(true)}>{selection ? "Passage selected" : "Highlight this passage"}</button>
            <VoiceButton text={selectedPassage} language="en-US" label="Read selection" />
          </div>
        </article>
        <aside className={`reader-panel ${selection ? "panel-visible" : ""}`}>
          <p className="eyebrow">§ selected passage</p>
          <p className="panel-quote">“Attention is not the absence of distraction…”</p>
          {Object.keys(attachments).length > 0 && <div className="attached-aids"><p className="eyebrow">Attached to this passage</p><div>{(Object.keys(attachments) as StudyAction[]).map((action) => <button key={action} onClick={() => setResult(attachments[action] ?? null)}>{attachmentIcon[action]} {readerActions.find((item) => item.id === action)?.label}</button>)}</div></div>}
          <div className="translation-control">
            <label htmlFor="translation-language">Translation language</label>
            <select id="translation-language" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value as PreferredLanguage)}>
              {languages.map((language) => <option key={language.code} value={language.name}>{language.name}</option>)}
            </select>
          </div>
          <div className="action-list">{readerActions.map((action) => <button key={action.id} onClick={() => requestAction(action.id)} disabled={activeAction !== null}>{activeAction === action.id ? "Thinking…" : action.label}<span>{activeAction === action.id ? "◌" : "↗"}</span><small>{action.detail}</small></button>)}</div>
          <StudyOutput result={result} error={error} loading={activeAction !== null} />
        </aside>
      </div>
    </div>
  </div>;
}

function StudyOutput({ result, error, loading }: { result: StudyResult | null; error: string | null; loading: boolean }) {
  if (loading) return <div className="ai-response is-loading"><p className="eyebrow">StudyMate is reading</p><span className="thinking-line" /><span className="thinking-line short" /></div>;
  if (error) return <div className="ai-response is-error"><p className="eyebrow">Connection needed</p><p>{error}</p></div>;
  if (!result) return <div className="ai-response"><p className="eyebrow">StudyMate is ready</p><p>Choose an instrument to make the selected passage easier to return to.</p></div>;

  if (result.action === "define") return <div className="ai-response"><p className="eyebrow">Definition</p><h3>{result.title}</h3>{result.pronunciation && <span className="pronunciation">{result.pronunciation}</span>}<p>{result.definition}</p><p className="response-detail">{result.usage}</p><VoiceButton text={`${result.title}. ${result.definition}. ${result.usage}`} language="en-US" label="Listen" /></div>;
  if (result.action === "translate") return <div className="ai-response translation-response"><p className="eyebrow">In {result.language}</p><h3>{result.title}</h3><p className="translation-text">{result.translation}</p>{result.note && <p className="response-detail">{result.note}</p>}<VoiceButton text={result.translation} language={result.languageCode} label={`Listen in ${result.language}`} /></div>;
  if (result.action === "visualize") return <div className="ai-response visual-response"><p className="eyebrow">Concept map</p><h3>{result.title}</h3><p>{result.summary}</p><div className="flow-map">{result.nodes.map((node, index) => <div className="flow-node" key={node.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{node.label}</strong><small>{node.detail}</small>{index < result.nodes.length - 1 && <i>↓</i>}</div>)}</div></div>;
  return <div className="ai-response"><p className="eyebrow">Study note</p><h3>{result.title}</h3><p>{result.body}</p><p className="reflection">{result.reflection}</p><VoiceButton text={`${result.body}. ${result.reflection}`} language="en-US" label="Listen" /></div>;
}

function VoiceButton({ text, language, label }: { text: string; language: string; label: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  function speak() {
    if (!available) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.92;
    const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith(language.split("-")[0].toLowerCase()));
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return <button className="voice-button" type="button" onClick={speaking ? () => window.speechSynthesis.cancel() : speak} disabled={!available}>{speaking ? "Stop reading" : `◖ ${label}`}</button>;
}
