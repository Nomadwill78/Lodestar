// ============================================================
// Billing mapping shared by the store webhooks. Maps store product /
// entitlement identifiers to a Lodestar tier, in one place. Set these
// strings to match the product identifiers you create in RevenueCat,
// the App Store, Google Play, and Stripe.
// ============================================================

export type Tier = "free" | "aligned" | "founder";

// RevenueCat entitlement identifiers -> tier. Configure these entitlements
// in the RevenueCat dashboard and attach your store products to them.
export const RC_ENTITLEMENT_TIER: Record<string, Tier> = {
  aligned: "aligned",
  founder: "founder",
};

// Stripe Price IDs -> tier. Use the price IDs from your Stripe products
// (monthly and annual can both map to the same tier).
export const STRIPE_PRICE_TIER: Record<string, Tier> = {
  // "price_xxx_aligned_monthly": "aligned",
  // "price_xxx_aligned_annual":  "aligned",
  // "price_xxx_founder_monthly": "founder",
  // "price_xxx_founder_annual":  "founder",
};

// Resolve the highest tier among a set of active RevenueCat entitlements.
export function tierFromEntitlements(entitlementIds: string[]): Tier {
  let best: Tier = "free";
  const rank: Record<Tier, number> = { free: 0, aligned: 1, founder: 2 };
  for (const id of entitlementIds) {
    const t = RC_ENTITLEMENT_TIER[id];
    if (t && rank[t] > rank[best]) best = t;
  }
  return best;
}
