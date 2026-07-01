// ============================================================
// POST /api/checkout  -  Create a Stripe Checkout Session for a paid plan.
// Server-side route handler. Calls the Stripe REST API directly (no SDK
// dependency) and returns the hosted checkout URL for the client to open.
// The resulting subscription events are handled by the stripe-webhook edge
// function, which flips members.tier.
//
// Env (see .env.example):
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_ALIGNED_MONTHLY / _ANNUAL
//   STRIPE_PRICE_FOUNDER_MONTHLY / _ANNUAL
//   NEXT_PUBLIC_SITE_URL  (for success/cancel redirects)
// ============================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICE_ENV = {
  "aligned:monthly": "STRIPE_PRICE_ALIGNED_MONTHLY",
  "aligned:annual": "STRIPE_PRICE_ALIGNED_ANNUAL",
  "founder:monthly": "STRIPE_PRICE_FOUNDER_MONTHLY",
  "founder:annual": "STRIPE_PRICE_FOUNDER_ANNUAL",
};

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const tier = body?.tier === "founder" ? "founder" : "aligned";
  const billing = body?.billing === "monthly" ? "monthly" : "annual";
  const memberId = typeof body?.memberId === "string" ? body.memberId : null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[PRICE_ENV[`${tier}:${billing}`]];
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  if (!secret || !priceId) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  // Stripe wants application/x-www-form-urlencoded with bracketed nesting.
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", priceId);
  form.set("line_items[0][quantity]", "1");
  form.set("success_url", `${site}/?checkout=success`);
  form.set("cancel_url", `${site}/?checkout=cancel`);
  form.set("allow_promotion_codes", "true");
  // Carry the mapping so the webhook can attach the subscription to a member.
  form.set("metadata[tier]", tier);
  if (memberId) {
    form.set("client_reference_id", memberId);
    form.set("metadata[member_id]", memberId);
    form.set("subscription_data[metadata][member_id]", memberId);
  }
  form.set("subscription_data[metadata][tier]", tier);
  if (email) form.set("customer_email", email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return Response.json({ error: "stripe_error", detail: data?.error?.message ?? null }, { status: 502 });
  }

  return Response.json({ url: data.url });
}
