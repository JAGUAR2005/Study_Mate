type LogoProps = { compact?: boolean; className?: string; inverse?: boolean };

/**
 * Threadmark: a reading line that folds into a margin annotation.
 * The interrupted line is intentional—it represents the exact moment a reader
 * pauses to make meaning, which is the central StudyMate interaction.
 */
export function StudyMateLogo({ compact = false, className = "", inverse = false }: LogoProps) {
  return <span className={`studymate-logo ${inverse ? "is-inverse" : ""} ${className}`} aria-label="StudyMate">
    <svg className="studymate-logo-mark" viewBox="0 0 102 74" aria-hidden="true">
      <path className="threadmark-shadow" d="M12 22.5h41c10.8 0 16.8 4.5 16.8 12.2 0 8.2-7.2 13.1-19 13.1H35.6c-7.9 0-12.7 3.3-12.7 9 0 5.4 4.5 8.4 11.9 8.4h39.8" />
      <path className="threadmark-ink" d="M12 18.5h41c10.8 0 16.8 4.5 16.8 12.2 0 8.2-7.2 13.1-19 13.1H35.6c-7.9 0-12.7 3.3-12.7 9 0 5.4 4.5 8.4 11.9 8.4h36" />
      <path className="threadmark-note" d="M81.4 43.8v17.8" />
      <circle className="threadmark-dot" cx="81.4" cy="65" r="5.6" />
      <path className="threadmark-spark" d="m91 11 1.9 4.2 4.2 1.8-4.2 1.9-1.9 4.2-1.8-4.2-4.2-1.9 4.2-1.8L91 11Z" />
    </svg>
    {!compact && <span className="studymate-logo-type"><i>Study</i><b>Mate</b><span className="logo-period">.</span><small>reading intelligence</small></span>}
  </span>;
}

/** Mote is a paper creature made from a folded annotation tab and an open book. */
export function MoteMascot({ className = "", size = 92 }: { className?: string; size?: number }) {
  return <svg className={`mote-mascot ${className}`} width={size} height={size} viewBox="0 0 142 142" role="img" aria-label="Mote, the StudyMate reading companion">
    <defs>
      <linearGradient id="mote-paper" x1="29" y1="27" x2="112" y2="113" gradientUnits="userSpaceOnUse"><stop stopColor="#fffaf0" /><stop offset="1" stopColor="#e9d3b9" /></linearGradient>
      <filter id="mote-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#36241f" floodOpacity=".2" /></filter>
    </defs>
    <g filter="url(#mote-shadow)">
      <path d="M35 35c0-10 8-18 18-18h39c10 0 18 8 18 18v53c0 17-13 30-30 30H64c-16 0-29-13-29-30V35Z" fill="url(#mote-paper)" stroke="#2d2421" strokeWidth="2.3" />
      <path d="M90 17v23c0 6 5 11 11 11h9" fill="#d05b47" stroke="#2d2421" strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M35 76c11-7 22-7 34 0 12-7 26-7 41 0v20c-15-7-28-6-41 1-13-7-24-8-34-1V76Z" fill="#b7503f" stroke="#2d2421" strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M69 76v21" stroke="#2d2421" strokeWidth="2" />
    </g>
    <circle cx="56" cy="58" r="5.4" fill="#2d2421" /><circle cx="85" cy="58" r="5.4" fill="#2d2421" />
    <path d="M58 67c7 6 16 6 23 0" fill="none" stroke="#2d2421" strokeWidth="3" strokeLinecap="round" />
    <path d="M47 45c4-3 9-3 13-1M80 44c4-2 9-2 13 1" fill="none" stroke="#2d2421" strokeWidth="2.5" strokeLinecap="round" />
    <path d="m28 51 2.4 5.4 5.4 2.4-5.4 2.4-2.4 5.4-2.4-5.4-5.4-2.4 5.4-2.4L28 51Zm89 50 1.7 3.8 3.8 1.7-3.8 1.7-1.7 3.8-1.7-3.8-3.8-1.7 3.8-1.7 1.7-3.8Z" fill="#d05b47" />
  </svg>;
}
