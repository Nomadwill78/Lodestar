// ============================================================
// Web build of the purchases helper. react-native-purchases (RevenueCat)
// is native-only, so on the web app billing is unavailable and every call
// is a safe no-op. Metro picks this file over purchases.js for web, so the
// native module is never bundled into the web build. The paywall reads
// isPurchasesAvailable() === false and shows its static plan comparison.
// ============================================================

export function isPurchasesAvailable() {
  return false;
}

export async function configurePurchases() {}

export async function getUpgradeOptions() {
  return { available: false, packages: [] };
}

export async function purchasePackageById() {
  return { ok: false, reason: "unavailable" };
}

export async function startUpgrade() {
  return { ok: false, reason: "unavailable" };
}

export async function restorePurchases() {
  return { ok: false };
}
