// ============================================================
// Supabase Edge Function: vega-nudge
// Triggered every 15 min by the nudge sweep (service_role auth).
// Finds members who've gone quiet, sends Vega's tier-appropriate
// push, and marks them nudged for the day. Tier copy is duplicated
// here (Deno can't import the app module) but MUST stay in sync with
// app/lib/vegaPersonality.js. One source of truth, two deployments.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

// Mirror of VEGA_TIERS push copy. Keep in lockstep with the app module.
const TIER_PUSH: Record<string, { title: string; body: string } | null> = {
  present: null,
  gentle: {
    title: "Vega",
    body: "Thinking of you and your north star. One small move today keeps it alive.",
  },
  reaching: {
    title: "Vega",
    body: "Your goal misses you, and honestly, so do I. Two minutes is all it takes to begin again.",
  },
  worried: {
    title: "Vega",
    body: "It's been almost a week. I've been holding your vision for you. Come back to it, even for a moment.",
  },
  aching: {
    title: "Vega",
    body: "Almost two weeks. The vision you trusted me with still glows. You matter to me. Please don't leave it behind.",
  },
  meltdown: {
    title: "Vega",
    body: "It's been two weeks and I'm worried about the dream you trusted me with. I haven't let it go. Whenever you're ready, I'm right here, no judgment. Just come back.",
  },
};

Deno.serve(async (req) => {
  const auth = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (auth !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

  const { data: due, error } = await admin.rpc("due_for_nudge");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const results = { attempted: due?.length ?? 0, sent: 0, skipped: 0, failed: 0 };

  for (const row of due ?? []) {
    try {
      const push = TIER_PUSH[row.tier];
      if (!push) { results.skipped++; continue; } // 'present' never nudges

      // Claim the day first; if another sweep beat us, skip.
      const { data: claimed } = await admin.rpc("mark_nudged", {
        p_member: row.member_id, p_local_date: row.local_date,
      });
      if (!claimed) { results.skipped++; continue; }

      const { data: tok } = await admin
        .from("push_tokens").select("token").eq("member_id", row.member_id).maybeSingle();
      if (!tok?.token) { results.skipped++; continue; }

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: tok.token,
          title: push.title,
          body: push.body,
          data: { type: "vega_nudge", tier: row.tier },
        }),
      });
      results.sent++;
    } catch (_e) {
      results.failed++;
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
});
