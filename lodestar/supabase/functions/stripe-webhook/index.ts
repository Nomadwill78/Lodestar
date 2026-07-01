// ============================================================
// Supabase Edge Function: stripe-webhook
// Receives Stripe subscription events (from web checkout) and flips
// members.tier. Deploy with --no-verify-jwt; the Stripe signature is the
// gate. Verifies the signature with Web Crypto (no SDK needed).
//
// Setup:
//   - Create the webhook in Stripe pointing at this function.
//   - supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//   - The checkout session is created with client_reference_id = member id
//     and metadata { member_id, tier } (see web/app/api/checkout/route.js),
//     which we read back here.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import { STRIPE_PRICE_TIER, type Tier } from "../_shared/billing.ts";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifyStripeSignature(sigHeader: string, payload: string, secret: string): Promise<boolean> {
  try {
    const parts: Record<string, string> = {};
    for (const kv of sigHeader.split(",")) {
      const [k, v] = kv.split("=");
      if (k && v) parts[k.trim()] = v.trim();
    }
    if (!parts.t || !parts.v1) return false;
    const signed = `${parts.t}.${payload}`;
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
    const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return timingSafeEqual(hex, parts.v1);
  } catch {
    return false;
  }
}

function tierFromObject(obj: Record<string, any>): Tier {
  // Prefer explicit metadata.tier carried from checkout, else map the price.
  const metaTier = obj?.metadata?.tier;
  if (metaTier === "aligned" || metaTier === "founder") return metaTier;
  const priceId = obj?.items?.data?.[0]?.price?.id ?? obj?.plan?.id;
  return (priceId && STRIPE_PRICE_TIER[priceId]) || "free";
}

function memberFromObject(obj: Record<string, any>): string | null {
  return obj?.metadata?.member_id ?? obj?.client_reference_id ?? null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const sig = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text(); // raw body required for signature check
  if (!secret || !(await verifyStripeSignature(sig, raw, secret))) {
    return new Response("invalid signature", { status: 400 });
  }

  let evt: { type?: string; data?: { object?: Record<string, any> } };
  try { evt = JSON.parse(raw); } catch { return new Response("bad request", { status: 400 }); }

  const type = evt.type ?? "";
  const obj = evt.data?.object ?? {};

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Resulting tier/status/period from the event.
  let tier: Tier = "free";
  let status = "active";
  if (type === "checkout.session.completed") {
    tier = tierFromObject(obj);
    status = "active";
  } else if (type === "customer.subscription.updated") {
    const s = String(obj.status ?? "");
    status = s;
    tier = ["active", "trialing", "past_due"].includes(s) ? tierFromObject(obj) : "free";
  } else if (type === "customer.subscription.deleted") {
    tier = "free";
    status = "canceled";
  } else {
    return new Response("ignored", { status: 200 });
  }

  const periodEndSec = Number(obj.current_period_end ?? 0);
  const periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null;
  const email = obj?.customer_details?.email ?? obj?.customer_email ?? null;
  const customerId = typeof obj.customer === "string" ? obj.customer : null;

  // Resolve the member, in order:
  //   1. id carried from checkout (metadata / client_reference_id)
  //   2. the stored Stripe customer id (subscription.updated/deleted events
  //      carry obj.customer but no email, so this is how they map after a
  //      web-first signup has saved the customer id)
  //   3. an existing member by billing email (case-insensitive)
  let memberId = memberFromObject(obj);
  if (!memberId && customerId) {
    const { data } = await admin.from("members").select("id").eq("stripe_customer_id", customerId).maybeSingle();
    memberId = (data as { id?: string } | null)?.id ?? null;
  }
  if (!memberId && email) {
    const { data } = await admin.from("members").select("id").ilike("email", email).maybeSingle();
    memberId = (data as { id?: string } | null)?.id ?? null;
  }

  if (memberId) {
    // Persist the customer id so later events (which lack an email) can map.
    const { error } = await admin.rpc("apply_subscription_state", {
      p_member: memberId,
      p_tier: tier,
      p_provider: "stripe",
      p_status: status,
      p_period_end: periodEnd,
      p_stripe_customer_id: customerId,
    });
    if (error) return new Response(error.message, { status: 500 });
    return new Response("ok", { status: 200 });
  }

  // Web-first purchase: the buyer has no account yet. Stash the entitlement
  // by email; it is applied the moment they sign up (or via the self-reconcile
  // RPC the app calls on load). Only store real upgrades.
  if (email && tier !== "free") {
    const { error } = await admin.from("pending_entitlements").upsert({
      email: email.toLowerCase(),
      tier,
      provider: "stripe",
      status,
      period_end: periodEnd,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });
    if (error) return new Response(error.message, { status: 500 });
    return new Response("pending stored", { status: 200 });
  }

  return new Response("no member mapping", { status: 200 });
});
