// ============================================================
// Metro config. Vega's canonical tier push copy lives in the shared
// edge-function folder (../supabase/functions/_shared/vegaTiers.json),
// above the Expo app root, so both the app and the vega-nudge function
// read the exact same source. Metro only resolves files under the
// project root or an explicit watch folder, so we add it here.
// ============================================================

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.resolve(__dirname, "..", "supabase", "functions", "_shared"),
];

module.exports = config;
