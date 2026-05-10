// Aurora stylesheet served as a static asset — single dark theme,
// system font stack, no external resources.

export const css = `/* Smooth crossfade between same-origin radar pages.
   Modern browsers (Chrome 126+, Edge, Safari TP) — older fall back to native nav. */
@view-transition { navigation: auto; }
::view-transition-old(root),
::view-transition-new(root) { animation-duration: 220ms; }

:root {
  color-scheme: dark;
  --bg: #07080d;
  --bg-elev: #0c0f1a;
  --bg-card: #11162478;
  --fg: #e6e9f0;
  --fg-soft: #aab1c4;
  --fg-mute: #7a8093;
  --line: #1f2436;
  --accent-glow: rgba(120, 200, 255, 0.45);
  --r-adopt: hsl(150 60% 55%);
  --r-trial: hsl(195 65% 60%);
  --r-assess: hsl(45 80% 60%);
  --r-hold: hsl(2 75% 65%);
  --shadow-lg: 0 24px 60px -16px rgba(0, 0, 0, 0.6);
  --radius: 12px;
}

* { box-sizing: border-box; }
html, body { height: 100%; overflow: hidden; }
body {
  margin: 0;
  background:
    radial-gradient(60% 80% at 50% -10%, hsl(220 50% 12%) 0%, transparent 60%),
    radial-gradient(40% 60% at 100% 100%, hsl(280 40% 10%) 0%, transparent 70%),
    var(--bg);
  color: var(--fg);
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", system-ui, sans-serif;
  min-height: 100vh;
}
a { color: inherit; text-decoration: none; }
h1, h2, h3, h4 { margin: 0; font-weight: 600; letter-spacing: -0.01em; }

/* ── Topbar ──────────────────────────────────────────────────────── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  background: linear-gradient(to bottom, var(--bg-elev), transparent);
  position: sticky; top: 0; z-index: 5;
  backdrop-filter: blur(6px);
}
.brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-weight: 600; font-size: 14px;
  opacity: .55;
  transition: opacity .15s ease;
}
.brand:hover { opacity: 1; }
.brand-mark { font-size: 16px; filter: drop-shadow(0 0 6px var(--accent-glow)); }
.brand-text { color: var(--fg); }
.topbar-meta { display: flex; align-items: baseline; gap: 14px; font-size: 13px; color: var(--fg-soft); }
.meta-scope { color: var(--fg); font-weight: 500; }
.meta-date { font-variant-numeric: tabular-nums; color: var(--fg-mute); }

/* ── Scope tabs ──────────────────────────────────────────────────── */
.scope-tabs {
  display: flex; align-items: center; gap: 4px;
  flex: 1; justify-content: center;
  flex-wrap: wrap;
  padding: 0 16px;
}
.scope-tabs .tab {
  display: inline-flex; align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px; font-weight: 500;
  color: var(--fg-mute);
  border: 1px solid transparent;
  transition: color .15s ease, background .15s ease, border-color .15s ease;
}
.scope-tabs .tab:hover { color: var(--fg); background: rgba(255,255,255,.04); }
.scope-tabs .tab--current {
  color: var(--fg);
  background: rgba(255,255,255,.06);
  border-color: rgba(255,255,255,.1);
  pointer-events: none;
}

/* ── Timeline ────────────────────────────────────────────────────── */
/* Fixed total height — keeps page layout stable when switching between
   scopes whose timelines have different dot counts (or none). */
.timeline {
  position: relative;
  padding: 8px 32px 6px;
  min-height: 44px;
}
.tl-items {
  position: relative;
  height: 30px;
  margin: 0 auto;
  max-width: 1200px;
}
.tl-items::before {
  content: '';
  position: absolute;
  left: 16px; right: 16px;
  top: 5px;
  height: 1px;
  background: var(--line);
}
.tl-track { display: none; }
.tl-dot {
  position: absolute;
  top: 0;
  /* Inset by 16px so the first/last dots sit on the line ends, not off-screen. */
  left: calc(16px + var(--p, 0) * (100% - 32px));
  transform: translateX(-50%);
  text-decoration: none;
}
.tl-year-tick {
  position: absolute;
  bottom: 0;
  left: calc(16px + var(--p, 0) * (100% - 32px));
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--fg-mute);
  font-variant-numeric: tabular-nums;
  letter-spacing: .04em;
  pointer-events: none;
}
/* Tiny tick mark above year label, sitting on the line. */
.tl-year-tick::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -12px;
  width: 1px;
  height: 4px;
  background: var(--line);
  transform: translateX(-50%);
}
.tl-marker {
  width: 11px; height: 11px; border-radius: 999px;
  background: var(--bg-elev); border: 1.5px solid var(--fg-mute);
  transition: transform .15s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease;
  z-index: 1;
}
.tl-dot:hover .tl-marker {
  border-color: var(--r-adopt);
  background: var(--r-adopt);
  transform: scale(1.2);
}
.tl-dot--current .tl-marker {
  background: var(--r-adopt);
  border-color: var(--r-adopt);
  box-shadow: 0 0 0 3px hsl(150 60% 55% / 0.18), 0 0 18px hsl(150 60% 55% / 0.5);
}

/* ── Radar shell ─────────────────────────────────────────────────── */
.radar-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 20px;
  padding: 8px 24px 24px;
  max-width: 1700px;
  margin: 0 auto;
  align-items: start;
}
@media (max-width: 960px) {
  .radar-shell { grid-template-columns: 1fr; }
}
/* Stage is a square that fills the remaining viewport height (after topbar +
   timeline + paddings) and the column width — whichever is smaller wins. */
.radar-stage {
  position: relative;
  width: min(100%, calc(100vh - 140px));
  aspect-ratio: 1;
  margin: 0 auto;
}
.radar-svg { width: 100%; height: 100%; display: block; }

/* ── SVG ─────────────────────────────────────────────────────────── */
.sector { transition: filter .2s ease, opacity .2s ease; }
.sector:hover { filter: brightness(1.4); }
.ring-line { fill: none; stroke: rgba(255,255,255,.06); stroke-width: 1; }
.axis { stroke: rgba(255,255,255,.04); stroke-width: 1; }
.ring-label {
  font: 600 13px/1 sans-serif; letter-spacing: .25em;
  fill: rgba(255,255,255,.18);
  text-transform: uppercase;
}
.quad-label {
  font: 700 18px/1 sans-serif; letter-spacing: .15em;
  text-transform: uppercase;
  filter: drop-shadow(0 1px 8px rgba(0,0,0,.6));
}
.blip-link { cursor: pointer; outline: none; }
/* IMPORTANT: don't transform-scale .blip on hover — in dense clusters the
   scaled bbox overlaps a neighbouring <a>, the cursor flickers between them,
   and the hover-card strobes. Use glow filter only — bbox stays put. */
.blip-bg {
  opacity: .55;
  transition: opacity .15s ease;
  filter: blur(2px);
}
.blip-fg {
  stroke: rgba(255,255,255,.18);
  stroke-width: 1.2;
  transition: filter .15s ease, stroke .15s ease;
}
.blip-num {
  fill: rgba(255,255,255,.95);
  font: 700 12px/1 sans-serif;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
  paint-order: stroke fill;
  stroke: rgba(0,0,0,.35);
  stroke-width: 2;
}
.blip.is-active .blip-bg,
.blip-link:hover .blip-bg,
.blip-link:focus-visible .blip-bg { opacity: 1; }
.blip.is-active .blip-fg,
.blip-link:hover .blip-fg,
.blip-link:focus-visible .blip-fg {
  /* currentColor inherits from <g style="color:..."> on each blip — glow tints */
  filter: drop-shadow(0 0 12px currentColor) brightness(1.2);
  stroke: rgba(255,255,255,.45);
}

/* ── Legend (sidebar) ────────────────────────────────────────────── */
.legend {
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 16px 18px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  position: sticky; top: 80px;
  font-size: 13px;
}
.legend-quad + .legend-quad { margin-top: 22px; padding-top: 18px; border-top: 1px dashed var(--line); }
.legend-quad h3 {
  font-size: 13px; letter-spacing: .04em; text-transform: uppercase;
  color: hsl(var(--accent) 70% 75%);
  margin-bottom: 10px;
}
.legend-ring h4 {
  font-size: 11px; letter-spacing: .15em; text-transform: uppercase;
  color: var(--fg-mute); margin: 12px 0 6px;
}
.legend-ring--adopt h4 { color: var(--r-adopt); }
.legend-ring--trial h4 { color: var(--r-trial); }
.legend-ring--assess h4 { color: var(--r-assess); }
.legend-ring--hold h4 { color: var(--r-hold); }
.legend-ring ul { list-style: none; margin: 0; padding: 0; }
.legend-ring li {
  display: flex; align-items: baseline; gap: 8px;
  padding: 3px 0; cursor: pointer;
  border-radius: 6px; padding-left: 4px;
  transition: background .15s ease;
}
.legend-ring li:hover { background: rgba(255,255,255,.04); }
.legend-ring li.is-active {
  background: rgba(255,255,255,.08);
}
.li-num {
  display: inline-block; min-width: 24px;
  font-variant-numeric: tabular-nums;
  color: var(--fg-mute); font-size: 11px;
  text-align: right;
}
.li-name { flex: 1; color: var(--fg); }
.li-move { font-size: 10px; }
.li-move--up { color: var(--r-adopt); }
.li-move--down { color: var(--r-hold); }

/* ── Hover card ──────────────────────────────────────────────────── */
.hover-card {
  position: fixed;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px 16px;
  width: 320px;
  box-shadow: var(--shadow-lg);
  z-index: 50;
  font-size: 13px;
  opacity: 0;
  transition: opacity .12s ease;
  top: 0; left: 0;
}
/* pointer-events: none on the card AND every descendant — otherwise text
   children intercept hover and force pointerleave on the blip below,
   producing a strobe loop. */
.hover-card, .hover-card * { pointer-events: none; }
.hover-card.is-shown { opacity: 1; }
.hc-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
.hc-num { font-variant-numeric: tabular-nums; color: var(--fg-mute); font-size: 11px; }
.hc-name { font-size: 15px; font-weight: 600; }
.hc-meta { display: flex; gap: 10px; margin-bottom: 8px; font-size: 11px; }
.hc-ring { color: var(--r-adopt); letter-spacing: .1em; text-transform: uppercase; font-weight: 600; }
.hc-move { color: var(--fg-mute); }
.hc-desc { margin: 0; color: var(--fg-soft); line-height: 1.5; }

/* ── Entry detail ────────────────────────────────────────────────── */
.entry-shell {
  max-width: 720px; margin: 0 auto; padding: 32px 32px 64px;
}
.back { display: inline-block; margin-bottom: 18px; color: var(--fg-mute); font-size: 13px; }
.back:hover { color: var(--fg); }
.entry-title { font-size: 36px; line-height: 1.15; margin-bottom: 14px; }
.entry-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px; font-size: 11px;
  letter-spacing: .08em; text-transform: uppercase; font-weight: 600;
  background: var(--bg-card); border: 1px solid var(--line); color: var(--fg-soft);
}
.badge--ring-adopt { color: var(--r-adopt); border-color: hsl(150 60% 55% / .35); }
.badge--ring-trial { color: var(--r-trial); border-color: hsl(195 65% 60% / .35); }
.badge--ring-assess { color: var(--r-assess); border-color: hsl(45 80% 60% / .35); }
.badge--ring-hold { color: var(--r-hold); border-color: hsl(2 75% 65% / .35); }
.badge--up { color: var(--r-adopt); border-color: hsl(150 60% 55% / .35); }
.badge--down { color: var(--r-hold); border-color: hsl(2 75% 65% / .35); }
.entry-desc {
  font-size: 16px; line-height: 1.7; color: var(--fg-soft);
  white-space: pre-wrap;
}

.page-footer {
  text-align: center; padding: 24px;
  color: var(--fg-mute); font-size: 12px;
  border-top: 1px solid var(--line);
}
`
