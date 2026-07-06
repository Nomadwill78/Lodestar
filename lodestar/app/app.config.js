// ============================================================
// Dynamic Expo config. Uses app.json as the base and lets deploy
// environments (Vercel for web, EAS for native) inject the Supabase and
// RevenueCat values via environment variables, so real keys never live in
// the repo. Falls back to the app.json placeholders when a var is unset.
//
// Set on the host:
//   EXPO_PUBLIC_SUPABASE_URL
//   EXPO_PUBLIC_SUPABASE_ANON_KEY
//   EXPO_PUBLIC_RC_IOS_KEY        (optional, native billing)
//   EXPO_PUBLIC_RC_ANDROID_KEY    (optional, native billing)
//   EXPO_PUBLIC_EAS_PROJECT_ID    (optional, push)
// ============================================================

module.exports = ({ config }) => {
  const extra = config.extra ?? {};
  const eas = extra.eas ?? {};
  return {
    ...config,
    extra: {
      ...extra,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey,
      revenueCatIosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? extra.revenueCatIosKey,
      revenueCatAndroidKey: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? extra.revenueCatAndroidKey,
      eas: {
        ...eas,
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? eas.projectId,
      },
    },
  };
};
