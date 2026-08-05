// ============================================================
// Lodestar's brand palette for the marketing site. Single source: consumed by
// tailwind.config.js (which exposes these as utility classes and to theme() in
// globals.css) and imported directly where a raw value is unavoidable, such as
// Next metadata and SVG props.
//
// Mirrors app/lib/theme.js. The two cannot share a file because each is a
// separate Vercel project rooted at its own directory, so neither build can
// read outside it. Change one, change both.
//
// CommonJS so the Tailwind config can require it.
// ============================================================

const palette = {
  night: "#0B1026",
  deep: "#141B3C",
  star: "#E8B04B",
  ink: "#EDEFF7",
  muted: "#8A93B8",
  care: "#7FA8E8",
};

module.exports = { palette };
