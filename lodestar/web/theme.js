// ============================================================
// Lodestar's brand palette for the marketing site. Single source: consumed by
// tailwind.config.js (which exposes these as utility classes and to theme() in
// globals.css) and imported directly where a raw value is unavoidable, such as
// Next metadata and SVG props.
//
// Mirrors app/lib/theme.js. One shared file is possible but is not set up on
// either side: this project's Vercel root directory is lodestar/web, so
// anything above it needs "include files outside root directory", and the app
// reaches above its own root only through an explicit metro watch folder.
// Until both are arranged, change one, change both.
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
