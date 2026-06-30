// ============================================================
// Supabase Edge Function: vega-nudge
// Triggered every 15 min by the nudge sweep (service_role auth).
// Finds members who've gone quiet, sends Vega's tier-appropriate
// push, and marks them nudged for the day. The tier push copy comes
// from the shared canonical source (_shared/vegaTiers.json), the same
// file the app reads, so the two can no longer drift.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import VEGA_TIERS from "../_shared/vegaTiers.json" with { type: "json" };

type TierPush = { title: string; body: string } | null;
// JSON carries a "_comment" key too, so cast through unknown.
const TIERS = VEGA_TIERS as unknown as Record<string, { push?: TierPush }>;

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
      const push = TIERS[row.tier]?.push ?? null;
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
