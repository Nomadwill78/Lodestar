import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { clean, requireEnv } from "../../../lib/env";
import { PLANS } from "../../../lib/plans";

// Stripe is initialized lazily (inside the handler) so a missing key breaks the
// request, not the build.
function stripeClient() {
  return new Stripe(requireEnv(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY"));
}

const PRICE_ENV: Record<keyof typeof PLANS, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  agency: process.env.STRIPE_PRICE_AGENCY,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const plan = body?.plan as keyof typeof PLANS | undefined;
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const price = clean(PRICE_ENV[plan]);
  if (!price) {
    return NextResponse.json({ error: `Price for ${plan} is not configured` }, { status: 500 });
  }

  const siteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) || new URL(request.url).origin;

  const session = await stripeClient().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/dashboard?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
