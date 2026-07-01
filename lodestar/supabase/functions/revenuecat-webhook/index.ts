// ============================================================
// Supabase Edge Function: revenuecat-webhook
// Receives RevenueCat subscription events and flips members.tier.
// Deploy with --no-verify-jwt (RevenueCat is not a logged-in member); the
// shared secret in the Authorization header is the gate.
//
// Setup:
//   - In RevenueCat, set the webhook URL to this function and set the
//     Authorization header value to your REVENUECAT_WEBHOOK_AUTH secret.
//   - The app sets appUserID = the Supabase member id (auth uid), which
//     arrives here as event.app_user_id, so we can map directly.
//   - supabase secrets set REVENUECAT_WEBHOOK_AUTH=...
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import { tierFromEntitlements, type Tier } from "../_shared/billing.ts";

// Event types that mean "active/entitled" vs "access has actually ended".
const ACTIVE = new Set([
  "INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "UNCANCELLATION", "SUBSCRIPTION_EXTENDED",
]);
// Only downgrade when access truly ends. CANCELLATION and BILLING_ISSUE do NOT
// end access (the member keeps their tier until the paid period expires, and
// billing issues run through a grace period), so they are intentionally
// ignored here; EXPIRATION is the event that actually removes access.
const INACTIVE = new Set([
  "EXPIRATION", "SUBSCRIPTION_PAUSED",
]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
  const auth = req.headers.get("Authorization") ?? "";
  if (!expected || auth !== expected) {
    return new Response("forbidden", { status: 403 });
  }

  let payload: { event?: Record<string, unknown> };
  try { payload = await req.json(); } catch { return new Response("bad request", { status: 400 }); }

  const event = payload.event ?? {};
  const type = String(event.type ?? "");
  const memberId = String(event.app_user_id ?? "");
  if (!memberId) return new Response("no app_user_id", { status: 200 }); // nothing to map

  // Determine the resulting tier.
  let tier: Tier = "free";
  let status = "active";
  if (ACTIVE.has(type)) {
    const ents = Array.isArray(event.entitlement_ids)
      ? (event.entitlement_ids as string[])
      : event.entitlement_id ? [String(event.entitlement_id)] : [];
    tier = tierFromEntitlements(ents);
    status = "active";
  } else if (INACTIVE.has(type)) {
    tier = "free";
    status = type.toLowerCase();
  } else {
    return new Response("ignored", { status: 200 }); // TEST, TRANSFER, etc.
  }

  const periodEndMs = Number(event.expiration_at_ms ?? 0);
  const periodEnd = periodEndMs ? new Date(periodEndMs).toISOString() : null;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error } = await admin.rpc("apply_subscription_state", {
    p_member: memberId,
    p_tier: tier,
    p_provider: "revenuecat",
    p_status: status,
    p_period_end: periodEnd,
  });
  if (error) return new Response(error.message, { status: 500 });

  return new Response("ok", { status: 200 });
});
