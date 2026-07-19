import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { clean, requireEnv } from "../../../lib/env";

// Writes bypass RLS via the service-role key — this endpoint is only reachable
// with a valid Stripe signature.
function serviceClient() {
  return createServiceClient(
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
  );
}

export async function POST(request: Request) {
  const stripe = new Stripe(requireEnv(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY"));
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      requireEnv(process.env.STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = serviceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id ?? session.client_reference_id;
      const plan = session.metadata?.plan;
      if (userId && plan) {
        await supabase
          .from("profiles")
          .update({ plan, stripe_customer_id: clean(String(session.customer ?? "")) || null })
          .eq("id", userId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;
      if (userId) {
        await supabase.from("profiles").update({ plan: "free" }).eq("id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
