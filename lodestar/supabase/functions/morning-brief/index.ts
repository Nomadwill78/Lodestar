// ============================================================
// Supabase Edge Function: morning-brief
// Triggered every 15 min by the pg_cron sweep (service_role auth).
// For each member whose local morning time just arrived:
//   1. build their Vega context (build_vega_context RPC)
//   2. generate the 3-line brief through Vega's morning sub-prompt
//   3. record it (record_morning_brief RPC, deduped)
//   4. send the push notification
//
// Runs with the service key, so it can read across members. It is NOT
// member-facing; the cron Authorization header gates it.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import { VEGA_CORE } from "../_shared/vegaPersona.ts";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// ---- Vega base + morning-brief task layer ----
const MORNING_SYSTEM = `${VEGA_CORE}

# TASK: MORNING BRIEF
This brief is the member's morning priming: the first words that aim their attention for the day, so make every line concrete enough to act on.
Generate today's intention brief. It is a push notification and an in-app card. Exactly 3 lines. No preamble, no greeting, no sign-off.

The 3 lines, in order:
1. FOCUS: the one thing today that moves their north star. If a calendar is provided, anchor it to a real event or block. Concrete, not abstract.
2. IMPLEMENTATION INTENTION: a "when X, I will Y" statement tied to a likely moment in their actual day. Specific to today.
3. AFFIRMATION: grounded in their anchorEvidence or a recent logged win. Something they can actually believe because evidence backs it. Never generic hype.

Rules:
- If a pattern shows they keep stalling on a task type, aim today's focus at the smallest version of that task.
- Vary the language. Never sound like a template they tune out.

Output ONLY a JSON object, no other text:
{"focus":"...","intention":"...","affirmation":"..."}`;

interface BriefLines { focus: string; intention: string; affirmation: string; }

async function generateBrief(context: unknown, apiKey: string): Promise<BriefLines> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: MORNING_SYSTEM,
      messages: [{
        role: "user",
        content: `Generate today's brief from this member context:\n${JSON.stringify(context)}`,
      }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const data = await res.json();
  const text = data.content
    .map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : ""))
    .join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON in model output");
  const parsed = JSON.parse(match[0]);
  if (!parsed.focus || !parsed.intention || !parsed.affirmation) {
    throw new Error("brief missing a line");
  }
  return parsed;
}

async function sendPush(
  admin: ReturnType<typeof createClient>,
  memberId: string,
  lines: BriefLines,
) {
  // Look up the member's Expo push token (assumes a push_tokens table).
  const { data: tok } = await admin
    .from("push_tokens").select("token").eq("member_id", memberId).maybeSingle();
  if (!tok?.token) return; // no token yet; in-app card still shows on open

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: tok.token,
      title: "Your focus today",
      body: lines.focus,
      data: { type: "morning_brief" },
    }),
  });
}

Deno.serve(async (req) => {
  // Gate: only the cron sweep (service key) may call this.
  const auth = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (auth !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  }

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

  // Who is due right now?
  const { data: due, error: dueErr } = await admin.rpc("due_for_morning_brief");
  if (dueErr) return new Response(JSON.stringify({ error: dueErr.message }), { status: 500 });

  const results = { attempted: due?.length ?? 0, sent: 0, skipped: 0, failed: 0 };

  for (const row of due ?? []) {
    try {
      // Build this member's lean context.
      const { data: ctx, error: ctxErr } = await admin
        .rpc("build_vega_context", { p_member: row.member_id });
      if (ctxErr) throw new Error(ctxErr.message);

      const lines = await generateBrief(ctx, anthropicKey);

      // Record (deduped). false => another sweep beat us; skip the push.
      const { data: recorded, error: recErr } = await admin.rpc("record_morning_brief", {
        p_member: row.member_id,
        p_local_date: row.local_date,
        p_focus: lines.focus,
        p_intention: lines.intention,
        p_affirmation: lines.affirmation,
      });
      if (recErr) throw new Error(recErr.message);
      if (!recorded) { results.skipped++; continue; }

      await sendPush(admin, row.member_id, lines);
      results.sent++;
    } catch (_e) {
      results.failed++;
      // One member's failure never blocks the rest of the sweep.
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
});
