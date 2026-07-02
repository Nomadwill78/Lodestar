// ============================================================
// Web build of registerForPush. Expo push notifications are native-only,
// so on the web app this is a no-op. Metro picks this file over
// registerForPush.js when bundling for web.
// ============================================================

export async function registerForPush() {
  // No push on web; the in-app cards still show. Nothing to do.
}
