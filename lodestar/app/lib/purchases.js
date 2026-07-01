// ============================================================
// RevenueCat purchases helper. Scaffolds in-app subscriptions for the
// mobile app. Keys live in app.json extra; until they're set, everything
// here is a safe no-op so the app runs in Expo Go and dev without billing.
//
// Flow: configure() ties the RevenueCat user to the Supabase member id
// (auth uid) as the appUserID. After a purchase, RevenueCat sends a
// webhook to the revenuecat-webhook edge function, which flips
// members.tier. The app then reflects the new tier on next load.
//
// Note: react-native-purchases is a native module. It works in a dev or
// EAS build, not in plain Expo Go. All calls are guarded so a missing
// module or missing key never throws.
// ============================================================

import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};
const RC_IOS_KEY = extra.revenueCatIosKey;
const RC_ANDROID_KEY = extra.revenueCatAndroidKey;

let Purchases = null;
try {
  // Lazy, defensive: absent in Expo Go, present in dev/EAS builds.
  Purchases = require("react-native-purchases").default;
} catch {
  Purchases = null;
}

let configured = false;

export function isPurchasesAvailable() {
  return !!Purchases && !!(RC_IOS_KEY || RC_ANDROID_KEY);
}

// Tie RevenueCat to the Supabase member id so the webhook can map the
// purchase back to the right row. Call once a session exists.
export async function configurePurchases(memberId) {
  if (!isPurchasesAvailable() || configured || !memberId) return;
  try {
    const { Platform } = require("react-native");
    const apiKey = Platform.OS === "ios" ? RC_IOS_KEY : RC_ANDROID_KEY;
    if (!apiKey) return;
    Purchases.configure({ apiKey, appUserID: memberId });
    configured = true;
  } catch {
    // best-effort; billing simply stays off
  }
}

// List the current offering's packages for the paywall, normalized for
// display. { available } is false when billing is not configured yet (no
// key, Expo Go, or no offering), so the UI can show a static fallback.
export async function getUpgradeOptions() {
  if (!isPurchasesAvailable()) return { available: false, packages: [] };
  try {
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings?.current?.availablePackages ?? [];
    return {
      available: pkgs.length > 0,
      packages: pkgs.map((p) => ({
        id: p.identifier,
        title: p.product?.title ?? p.identifier,
        priceString: p.product?.priceString ?? "",
        description: p.product?.description ?? "",
      })),
    };
  } catch {
    return { available: false, packages: [] };
  }
}

// Purchase a specific package by identifier. The tier flip is server-side
// via the RevenueCat webhook; this only drives the store purchase sheet.
export async function purchasePackageById(packageIdentifier) {
  if (!isPurchasesAvailable()) return { ok: false, reason: "unavailable" };
  try {
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings?.current?.availablePackages ?? [];
    const pkg = packageIdentifier
      ? pkgs.find((p) => p.identifier === packageIdentifier) ?? pkgs[0]
      : pkgs[0];
    if (!pkg) return { ok: false, reason: "no_offerings" };
    await Purchases.purchasePackage(pkg);
    return { ok: true };
  } catch (e) {
    if (e?.userCancelled) return { ok: false, reason: "cancelled" };
    return { ok: false, reason: "error" };
  }
}

// Convenience: buy the first available package (used by simple prompts).
export async function startUpgrade(packageIdentifier) {
  return purchasePackageById(packageIdentifier);
}

export async function restorePurchases() {
  if (!isPurchasesAvailable()) return { ok: false };
  try {
    await Purchases.restorePurchases();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
