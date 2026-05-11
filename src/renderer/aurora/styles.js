// Aurora stylesheet served as a static asset — single dark theme,
// system font stack, no external resources.

export const css = `/* Smooth crossfade between same-origin radar pages.
   Modern browsers (Chrome 126+, Edge, Safari TP) — older fall back to native nav. */
@view-transition { navigation: auto; }
::view-transition-old(root),
::view-transition-new(root) { animation-duration: 220ms; }

/* ── Theme tokens ────────────────────────────────────────────────── */
/* Two independent axes:
     [data-theme="dark"|"light"]   — surface tones
     [data-chroma="color"|"mono"]  — accent hues (or grayscale)
   Defaults: dark + color. */
:root, [data-theme="dark"] {
  color-scheme: dark;
  --bg: #07080d;
  --bg-elev: #0c0f1a;
  /* Slightly brighter than --bg-elev so panels (legend) read as lifted. */
  --bg-panel: #161b2acc;
  --bg-card: #11162478;
  --bg-glow-1: hsl(220 50% 12%);
  --bg-glow-2: hsl(280 40% 10%);
  --fg: #e6e9f0;
  --fg-soft: #aab1c4;
  --fg-mute: #7a8093;
  --line: #1f2436;
  /* UI-state accent (current snapshot, active toggle dot, focus ring).
     Detached from ring/quadrant semantics so "selected" never collides
     with "ADOPT". */
  --accent: hsl(200 85% 65%);
  --accent-glow: rgba(120, 200, 255, 0.45);
  --r-adopt:  hsl(150 60% 55%);
  --r-trial:  hsl(195 65% 60%);
  --r-assess: hsl(45 80% 60%);
  --r-hold:   hsl(2 75% 65%);
  --shadow-lg: 0 24px 60px -16px rgba(0, 0, 0, 0.6);
  --radius: 12px;

  /* Per-quadrant accents (color chroma) — used for strokes, text, blip outline. */
  --q1-accent: hsl(165 65% 60%);
  --q2-accent: hsl(280 60% 68%);
  --q3-accent: hsl(38 75% 60%);
  --q4-accent: hsl(200 70% 62%);

  /* Sector gradient stops — alpha baked in, tuned for dark canvas. */
  --q1-grad-0: hsla(165, 65%, 60%, 0.32);
  --q1-grad-1: hsla(165, 65%, 60%, 0.02);
  --q2-grad-0: hsla(280, 60%, 68%, 0.32);
  --q2-grad-1: hsla(280, 60%, 68%, 0.02);
  --q3-grad-0: hsla(38,  75%, 60%, 0.32);
  --q3-grad-1: hsla(38,  75%, 60%, 0.02);
  --q4-grad-0: hsla(200, 70%, 62%, 0.32);
  --q4-grad-1: hsla(200, 70%, 62%, 0.02);
}

[data-theme="light"] {
  color-scheme: light;
  --bg: #f6f7fa;
  --bg-elev: #ffffff;
  --bg-panel: rgba(255, 255, 255, 0.92);
  --bg-card: rgba(255, 255, 255, 0.72);
  /* Subtle pastel glow corners — won't muddy the radar but breaks the flat-white. */
  --bg-glow-1: hsl(200 75% 95%);
  --bg-glow-2: hsl(300 55% 96%);
  --fg: #11151c;
  --fg-soft: #475064;
  --fg-mute: #6c7484;
  --line: #dfe3ea;
  --accent: hsl(220 85% 52%);
  --accent-glow: rgba(60, 110, 200, 0.35);
  --r-adopt:  hsl(150 55% 38%);
  --r-trial:  hsl(195 55% 42%);
  --r-assess: hsl(38 70% 45%);
  --r-hold:   hsl(2 70% 48%);
  --shadow-lg: 0 12px 40px -10px rgba(20, 25, 40, 0.18);

  /* Strokes/text stay darker for contrast on white. */
  --q1-accent: hsl(165 60% 36%);
  --q2-accent: hsl(280 50% 48%);
  --q3-accent: hsl(38  75% 42%);
  --q4-accent: hsl(200 65% 40%);

  /* Gradient stops are a DIFFERENT colour — pastel wash, not dark ink. The
     hue matches the accent, but lightness is bumped way up and the alpha
     compensates so the sectors read as tinted paper instead of stains. */
  --q1-grad-0: hsla(165, 75%, 70%, 0.55);
  --q1-grad-1: hsla(165, 75%, 80%, 0.02);
  --q2-grad-0: hsla(280, 65%, 80%, 0.55);
  --q2-grad-1: hsla(280, 65%, 88%, 0.02);
  --q3-grad-0: hsla(38,  90%, 70%, 0.55);
  --q3-grad-1: hsla(38,  90%, 85%, 0.02);
  --q4-grad-0: hsla(200, 80%, 75%, 0.55);
  --q4-grad-1: hsla(200, 80%, 88%, 0.02);
}

/* Monochrome — collapse all semantic accents (and gradient stops) to neutral. */
[data-chroma="mono"] {
  --accent: var(--fg-soft);
  --r-adopt:  var(--fg-soft);
  --r-trial:  var(--fg-soft);
  --r-assess: var(--fg-soft);
  --r-hold:   var(--fg-soft);
  --q1-accent: var(--fg-soft);
  --q2-accent: var(--fg-soft);
  --q3-accent: var(--fg-soft);
  --q4-accent: var(--fg-soft);
  --q1-grad-0: hsla(220, 10%, 50%, 0.1);
  --q1-grad-1: hsla(220, 10%, 50%, 0.02);
  --q2-grad-0: hsla(220, 10%, 50%, 0.1);
  --q2-grad-1: hsla(220, 10%, 50%, 0.02);
  --q3-grad-0: hsla(220, 10%, 50%, 0.1);
  --q3-grad-1: hsla(220, 10%, 50%, 0.02);
  --q4-grad-0: hsla(220, 10%, 50%, 0.1);
  --q4-grad-1: hsla(220, 10%, 50%, 0.02);
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
[data-theme="light"] .brand-mark { filter: none; }
.brand-text { color: var(--fg); }
.topbar-meta { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--fg-soft); }
.meta-scope { color: var(--fg); font-weight: 500; }
.meta-date { font-variant-numeric: tabular-nums; color: var(--fg-mute); margin-right: 4px; }

/* ── Mode toggle (theme + chroma in one) ─────────────────────────── */
/* One round button cycles through 4 states: dark+color → dark+mono →
   light+mono → light+color → … The glyph encodes BOTH axes:
     • dot size  → theme (dark = filled, light = small inset dot)
     • dot colour → chroma (color = accent, mono = grey) */
.toggle {
  appearance: none;
  width: 26px; height: 26px;
  padding: 0;
  border-radius: 999px;
  border: 1.5px solid var(--fg-mute);
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: border-color .15s ease, transform .15s ease;
}
.toggle:hover { border-color: var(--fg); transform: scale(1.06); }
.toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.toggle--mode::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 999px;
  background: var(--accent);
  transform: scale(1);
  transition: background .2s ease, transform .2s ease;
}
[data-chroma="mono"] .toggle--mode::before { background: var(--fg-mute); }
/* Light theme → smaller inset dot (visually reads as "less filled"). */
[data-theme="light"] .toggle--mode::before { transform: scale(0.5); }

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
  transition: color .15s ease, background .15s ease;
}
/* Theme-agnostic hover/active fills — derived from --fg so they read in both
   light and dark surfaces. Hardcoded white-alpha was invisible on the white. */
.scope-tabs .tab:hover {
  color: var(--fg);
  background: color-mix(in srgb, var(--fg) 8%, transparent);
}
.scope-tabs .tab--current {
  color: var(--fg);
  background: color-mix(in srgb, var(--fg) 12%, transparent);
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
  border-color: var(--accent);
  background: var(--accent);
  transform: scale(1.2);
}
.tl-dot--current .tl-marker {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent),
    0 0 18px color-mix(in srgb, var(--accent) 45%, transparent);
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
/* Sector backgrounds — per-quadrant radial gradient defined in SVG defs
   (visual atmosphere, NOT semantic). Semantic colour encoding lives on
   the blips and ring labels (by ring). */
.sector { transition: fill-opacity .2s ease, opacity .2s ease; stroke: none; }
.sector:hover { filter: brightness(1.25); }

/* Monochrome — no sector fills; only the ring outlines define structure. */
[data-chroma="mono"] .sector { fill: transparent; }

/* Ring boundary circles + cross axes. In colour mode they sit underneath
   the per-quadrant gradient, so they should whisper — a faint tint of fg.
   In mono they're the only structure the eye has to land on → bumped up. */
.ring-line {
  fill: none;
  stroke: color-mix(in srgb, var(--fg) 8%, transparent);
  stroke-width: 1;
}
.axis {
  stroke: color-mix(in srgb, var(--fg) 5%, transparent);
  stroke-width: 1;
}
[data-chroma="mono"] .ring-line {
  stroke: color-mix(in srgb, var(--fg-mute) 50%, transparent);
  stroke-width: 1.25;
}
[data-chroma="mono"] .axis {
  stroke: color-mix(in srgb, var(--fg-mute) 30%, transparent);
}

/* Ring labels — neutral. Ring is encoded by position + blip brightness,
   not by colour, so no per-ring tint here. */
.ring-label {
  font: 600 18px/1 sans-serif; letter-spacing: .25em;
  fill: var(--fg-mute); fill-opacity: .55;
  text-transform: uppercase;
}
.quad-label {
  font: 700 18px/1 sans-serif; letter-spacing: .15em;
  text-transform: uppercase;
  fill-opacity: .85;
}
[data-chroma="mono"] .quad-label { fill-opacity: .55; }
.blip-link { cursor: pointer; outline: none; }
/* Color = quadrant (matches the sector hue). Brightness = ring — adopt
   glows brightly, hold fades to a quiet outline. The decay is the visual
   metaphor for "alive / on its way out". */
.blip[data-q="q1"] { color: var(--q1-accent); }
.blip[data-q="q2"] { color: var(--q2-accent); }
.blip[data-q="q3"] { color: var(--q3-accent); }
.blip[data-q="q4"] { color: var(--q4-accent); }

/* Center glows, periphery fades to a ghostly silhouette: both opacity
   and saturation drop as you move outward, so hold-ring entries feel
   like they're already leaving the stage. */
.blip[data-r="adopt"]  { opacity: 1;    filter: saturate(1.15); }
.blip[data-r="trial"]  { opacity: 0.78; filter: saturate(0.8); }
.blip[data-r="assess"] { opacity: 0.5;  filter: saturate(0.5); }
.blip[data-r="hold"]   { opacity: 0.32; filter: saturate(0.25); }

/* Hover / active brings any blip back to full intensity so the user can
   inspect even the most faded hold-ring entries. */
.blip.is-active,
.blip-link:hover .blip,
.blip-link:focus-visible .blip {
  opacity: 1;
  filter: saturate(1.15);
}

/* Outlined blips: fill matches the page background so the SVG sector
   gradient doesn't leak through; stroke + number both pick up the accent.
   IMPORTANT: don't transform-scale .blip on hover — bbox flicker in dense
   clusters strobes the hover-card. Glow filter only. */
.blip-fg {
  fill: var(--bg);
  stroke: currentColor;
  stroke-width: 2;
  transition: filter .15s ease, stroke-width .15s ease, fill .15s ease;
}
.blip-num {
  fill: currentColor;
  font: 700 12px/1 sans-serif;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
}
.blip.is-active .blip-fg,
.blip-link:hover .blip-fg,
.blip-link:focus-visible .blip-fg {
  filter: drop-shadow(0 0 10px currentColor);
  stroke-width: 2.5;
  fill: color-mix(in srgb, currentColor 14%, var(--bg));
}

/* ── Light + colour: solid-filled blips, no sector wash ─────────────
   On the dark canvas a coloured wash + outlined blip read well together
   (signal-on-fog). On white we drop the wash entirely and let the blip
   colour carry. Key fixes against "dirty colour":
     • dedicated vivid --qN-blip tokens (--qN-accent stays darker for
       strokes/text on white — different jobs);
     • no stroke (dark stroke muddies the hue);
     • no saturate() filter on blip (it pushes solid fills toward grey);
     • softer opacity ramp so hold-ring blips fade but don't go ghost. */
[data-theme="light"][data-chroma="color"] {
  /* Brighter, cooler palette — lifted lightness, higher saturation. The
     hue shifts a touch: q1 → mint, q4 → cerulean, q3 → tangerine. */
  --q1-blip: hsl(168 72% 46%);
  --q2-blip: hsl(275 68% 64%);
  --q3-blip: hsl(34  96% 56%);
  --q4-blip: hsl(198 82% 54%);
}
[data-theme="light"][data-chroma="color"] .sector { fill: transparent; }
[data-theme="light"][data-chroma="color"] .ring-line {
  stroke: color-mix(in srgb, var(--fg) 14%, transparent);
}
[data-theme="light"][data-chroma="color"] .axis {
  stroke: color-mix(in srgb, var(--fg) 10%, transparent);
}
[data-theme="light"][data-chroma="color"] .blip[data-q="q1"] { color: var(--q1-blip); }
[data-theme="light"][data-chroma="color"] .blip[data-q="q2"] { color: var(--q2-blip); }
[data-theme="light"][data-chroma="color"] .blip[data-q="q3"] { color: var(--q3-blip); }
[data-theme="light"][data-chroma="color"] .blip[data-q="q4"] { color: var(--q4-blip); }
[data-theme="light"][data-chroma="color"] .blip { filter: none; }
[data-theme="light"][data-chroma="color"] .blip[data-r="adopt"]  { opacity: 1;    }
[data-theme="light"][data-chroma="color"] .blip[data-r="trial"]  { opacity: 0.92; }
[data-theme="light"][data-chroma="color"] .blip[data-r="assess"] { opacity: 0.78; }
[data-theme="light"][data-chroma="color"] .blip[data-r="hold"]   { opacity: 0.55; }
[data-theme="light"][data-chroma="color"] .blip.is-active,
[data-theme="light"][data-chroma="color"] .blip-link:hover .blip,
[data-theme="light"][data-chroma="color"] .blip-link:focus-visible .blip {
  opacity: 1;
  filter: none;
}
[data-theme="light"][data-chroma="color"] .blip-fg {
  fill: currentColor;
  stroke: none;
}
[data-theme="light"][data-chroma="color"] .blip-num {
  fill: #fff;
}
[data-theme="light"][data-chroma="color"] .blip.is-active .blip-fg,
[data-theme="light"][data-chroma="color"] .blip-link:hover .blip-fg,
[data-theme="light"][data-chroma="color"] .blip-link:focus-visible .blip-fg {
  fill: currentColor;
  stroke: none;
  filter: drop-shadow(0 3px 10px color-mix(in srgb, currentColor 55%, transparent));
}

/* ── Legend (sidebar) ────────────────────────────────────────────── */
/* The whole column (legend panel + footer credit) sticks together; only the
   list inside the panel scrolls when entries overflow.
   Max-height matches the radar-stage (calc(100vh - 140px)) so the column
   bottom never falls below the radar — leaves room for topbar + timeline
   + shell padding (~120 px) plus a small viewport margin. */
.legend-col {
  position: sticky; top: 80px;
  display: flex; flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 140px);
  min-height: 0;
}
.legend {
  background: var(--bg-panel);
  border-radius: var(--radius);
  padding: 14px 16px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  font-size: 13px;
}
.legend-quad + .legend-quad { margin-top: 22px; padding-top: 18px; border-top: 1px dashed var(--line); }
.legend-quad h3 {
  font-size: 13px; letter-spacing: .04em; text-transform: uppercase;
  color: var(--fg);
  margin-bottom: 10px;
}
.legend-quad[data-q="q1"] h3 { color: var(--q1-accent); }
.legend-quad[data-q="q2"] h3 { color: var(--q2-accent); }
.legend-quad[data-q="q3"] h3 { color: var(--q3-accent); }
.legend-quad[data-q="q4"] h3 { color: var(--q4-accent); }
.legend-ring h4 {
  font-size: 11px; letter-spacing: .15em; text-transform: uppercase;
  color: var(--fg-mute); margin: 12px 0 6px;
}
.legend-ring ul { list-style: none; margin: 0; padding: 0; }
.legend-ring li {
  display: flex; align-items: baseline; gap: 8px;
  padding: 3px 0; cursor: pointer;
  border-radius: 6px; padding-left: 4px;
  transition: background .15s ease;
}
/* Theme-agnostic — derived from --fg so it shows on both light + dark. */
.legend-ring li:hover { background: color-mix(in srgb, var(--fg) 6%, transparent); }
.legend-ring li.is-active {
  background: color-mix(in srgb, var(--fg) 12%, transparent);
}

/* Generator credit — sits OUTSIDE .legend so the panel's bg/radius don't
   wrap it. Just plain text on the page background, no chrome.
   Single row; flex: 0 0 auto so the scrollable panel above can't squeeze
   it out. Some breathing room above the line so it doesn't crowd the
   legend's bottom items. */
.legend-footer {
  flex: 0 0 auto;
  padding: 8px 6px 0;
  font-size: 11px;
  color: var(--fg-mute);
  line-height: 1.4;
  display: flex; flex-flow: row wrap; align-items: baseline;
  gap: 0 6px;
}
.legend-footer .sep { opacity: .55; }
/* Link inherits the same muted grey as the slogan — it's a credit, not a CTA.
   Underline stays as the only affordance; brightens on hover. */
.legend-footer a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--fg-mute) 35%, transparent);
  text-underline-offset: 2px;
}
.legend-footer a:hover {
  color: var(--fg-soft);
  text-decoration-color: var(--fg-mute);
}
.legend-footer .heart { color: hsl(2 75% 60%); }
[data-chroma="mono"] .legend-footer .heart { color: var(--fg-mute); }
.li-num {
  display: inline-block; min-width: 24px;
  font-variant-numeric: tabular-nums;
  color: var(--fg-mute); font-size: 11px;
  text-align: right;
}
.li-name { flex: 1; color: var(--fg); }
.li-move { font-size: 10px; color: var(--fg-mute); }

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
.hc-ring {
  color: var(--fg-soft);
  letter-spacing: .14em; text-transform: uppercase; font-weight: 600;
  font-size: 10.5px;
}
.hc-move { color: var(--fg-mute); }
.hc-desc { margin: 0; color: var(--fg-soft); line-height: 1.5; }

/* ── Entry detail ────────────────────────────────────────────────── */
.entry-shell {
  max-width: 720px; margin: 0 auto; padding: 32px 32px 64px;
}
.entry-title {
  font-size: 36px; line-height: 1.15; margin-bottom: 14px;
  display: flex; align-items: center; gap: 16px;
}
.entry-title .back {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 999px;
  color: var(--fg-mute);
  font-size: 24px; font-weight: 400; line-height: 1;
  border: 1px solid var(--line);
  transition: color .15s ease, border-color .15s ease, background .15s ease;
}
.entry-title .back:hover {
  color: var(--fg);
  border-color: var(--fg-mute);
  background: rgba(255,255,255,.04);
}
.entry-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px; font-size: 11px;
  letter-spacing: .08em; text-transform: uppercase; font-weight: 600;
  background: var(--bg-card); border: 1px solid var(--line); color: var(--fg-soft);
}
.badge--ring-adopt  { color: var(--r-adopt);  border-color: color-mix(in srgb, var(--r-adopt)  35%, transparent); }
.badge--ring-trial  { color: var(--r-trial);  border-color: color-mix(in srgb, var(--r-trial)  35%, transparent); }
.badge--ring-assess { color: var(--r-assess); border-color: color-mix(in srgb, var(--r-assess) 35%, transparent); }
.badge--ring-hold   { color: var(--r-hold);   border-color: color-mix(in srgb, var(--r-hold)   35%, transparent); }
.badge--up   { color: var(--r-adopt); border-color: color-mix(in srgb, var(--r-adopt) 35%, transparent); }
.badge--down { color: var(--r-hold);  border-color: color-mix(in srgb, var(--r-hold)  35%, transparent); }
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
