// ============================================================
// Lodestar's brand palette. Single source for the Expo app.
//
// The marketing site mirrors these values in web/tailwind.config.js. The two
// cannot share a file: each is a separate Vercel project rooted at its own
// directory, so neither build can read outside it. Change one, change both.
// ============================================================

export const theme = {
  // Core brand
  night: "#0B1026",
  deep: "#141B3C",
  star: "#E8B04B",
  ink: "#EDEFF7",
  muted: "#8A93B8",
  care: "#7FA8E8",

  // Evidence states, shown against log entries and momentum
  win: "#7FD8A8",
  setback: "#E8848B", // also carries inline error text

  // Vega's dimmer emotional states, used for her glow as contact lapses
  starDim: "#D9A24B",
  dusk: "#B98AC9",

  // Derived translucents. Kept as literals because React Native styles do not
  // compose colors, and these exact values are already in the design.
  starSoft: "rgba(232,176,75,0.10)",
  careSoft: "rgba(127,168,232,0.10)",
  line: "rgba(138,147,184,0.18)",
};
