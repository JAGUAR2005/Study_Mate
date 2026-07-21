"use client";

import { useEffect, useState } from "react";
import { languages, saveLanguage, storedLanguage, type PreferredLanguage } from "@/lib/preferences/language";
import { MoteMascot, StudyMateLogo } from "@/components/brand/studymate-brand";

export default function SettingsPage() {
  const [language, setLanguage] = useState<PreferredLanguage>("English");
  const [saved, setSaved] = useState(false);

  useEffect(() => setLanguage(storedLanguage()), []);
  function update(value: PreferredLanguage) { setLanguage(value); saveLanguage(value); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }

  return <main className="settings-page">
    <nav className="nav"><a className="wordmark" href="/"><StudyMateLogo /></a><a className="library-back" href="/">← Reading room</a></nav>
    <section className="settings-shell"><div className="settings-mote"><MoteMascot size={88} /><span>Mote keeps your language close.</span></div><p className="eyebrow">§ preferences</p><h1>Read in one language.<br /><em>Understand in yours.</em></h1><p className="settings-lede">Choose the language StudyMate should use whenever you ask for a translation. Your choice is remembered on this device and can be overridden in any reader.</p><div className="settings-rule" />
      <label htmlFor="preferred-language">Preferred translation language</label><select id="preferred-language" value={language} onChange={(event) => update(event.target.value as PreferredLanguage)}>{languages.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}</select>
      <p className="settings-status" role="status">{saved ? `${language} is now your default.` : "Translations and their voice playback will follow this preference."}</p>
    </section>
  </main>;
}
