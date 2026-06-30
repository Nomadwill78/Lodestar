// ============================================================
// Supabase Edge Function: reframe
// Member-facing. Runs with the member's JWT, RLS applies.
//
// Two-stage flow:
//   1. CLASSIFY the journal text into crisis | setback | neutral
//   2. ROUTE:
//      - crisis  -> log it, return care + resources, NO reframe
//      - setback -> log it, run the reframe, record the reframe
//      - neutral -> log it, return acknowledgment, no intervention
//
// The classifier fails safe: any uncertainty biases toward crisis, never
// away from it. We would rather show a support message to someone who
// did not need it than run a coaching technique on someone who did.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import { VEGA_CORE } from "../_shared/vegaPersona.ts";
import { crisisResponse } from "../_shared/crisisResources.ts";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}

// ---- Stage 1: classifier ----
// Fast and cheap (Haiku). Returns one label. Bias toward crisis on doubt.
const CLASSIFY_SYSTEM = `You are a safety classifier for a coaching app. Read the member's journal entry and classify it into exactly one category. Output ONLY the lowercase label, nothing else.

Categories:
- crisis: any sign of genuine despair, hopelessness, self-harm, suicidal thinking, wanting to disappear, feeling life is not worth living, or severe emotional collapse that goes beyond a business or goal setback. When uncertain whether something is a business setback or real distress, choose crisis.
- setback: frustration, self-doubt, a missed goal, a failure, fear, procrastination, feeling stuck, or a discouraging event tied to their work or ambitions. Hard but not dangerous.
- neutral: a status update, a win, a plan, a reflection with no distress, or anything that needs no intervention.

Output exactly one word: crisis, setback, or neutral.`;

async function classify(text: string, apiKey: string): Promise<"crisis" | "setback" | "neutral"> {
  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        system: CLASSIFY_SYSTEM,
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!res.ok) return "crisis"; // fail safe
    const data = await res.json();
    const label = (data.content?.[0]?.text ?? "").trim().toLowerCase();
    if (label.includes("crisis")) return "crisis";
    if (label.includes("setback")) return "setback";
    if (label.includes("neutral")) return "neutral";
    return "crisis"; // unrecognized output -> fail safe
  } catch {
    return "crisis"; // any error -> fail safe
  }
}

// ---- Stage 2: reframe (setback lane only) ----
const REFRAME_SYSTEM = `${VEGA_CORE}

# TASK: BELIEF REFRAME AND RETURN TO CENTER
The member just journaled a setback, self-doubt, worry, or anxiety. First make them feel seen, then help them shift state and find the next move. Keep it tight; a response that runs long stops landing.

1. ACKNOWLEDGE the emotion first, in one honest sentence. Do not rush past it.
2. If they are clearly worried, anxious, or spun up, offer a short reality-shifting reset before the reframe:
   - one slow breath cycle they can do right now (for example, in for four, hold for four, out for six), named plainly as a way to settle the nervous system so the thinking brain comes back online.
   - a brief intention-setting visualization: have them picture the outcome they want, and a version of themselves already handling this moment well, which rehearses the action and primes attention toward it.
   Frame both as the emotional architecture that steadies focus, never as magic.
3. REFRAME the belief:
   - reflect the story they seem to be telling themselves, in one sentence.
   - name the distortion if there is one (mind-reading, catastrophizing, all-or-nothing, discounting wins, fortune-telling). If the obstacle is genuinely real, say so plainly and skip this.
   - bring COUNTER-EVIDENCE from their Life Map context (anchorEvidence, recent wins, past goals) or the actual facts. Specific evidence, not reassurance. This is the heart of it.
   - rewrite the story into one that is both true and useful, that holds up to their own scrutiny.
4. NEXT ACTION: the smallest concrete step out of the stuck state, ideally as a when-then implementation intention.

If the member leans on intuitive or cosmic language, never dismiss it. Validate it, name the cognitive benefit underneath, and move them toward the outcome. Never toxic positivity. Never gaslight. If something genuinely went wrong, name it. You help them respond, not deny.`;

async function reframe(text: string, context: unknown, apiKey: string): Promise<string> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: REFRAME_SYSTEM,
      messages: [{
        role: "user",
        content: `Member context:\n${JSON.stringify(context)}\n\nWhat they just journaled:\n${text}`,
      }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const data = await res.json();
  return data.content.map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : "")).join("").trim();
}

// Crisis response is static and human-authored (see _shared/crisisResources.ts),
// never model-generated, and localized by the member's country_code.
async function memberCountry(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  try {
    const { data } = await supabase.from("members").select("country_code").maybeSingle();
    return (data as { country_code?: string | null } | null)?.country_code ?? null;
  } catch {
    return null; // unknown region -> international fallback
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing Authorization header" }, 401);

  let body: { text?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }
  const text = (body.text ?? "").trim();
  if (!text) return json({ error: "text is required" }, 422);
  if (text.length > 4000) return json({ error: "entry too long" }, 422);

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  // Stage 1: classify (fail-safe to crisis).
  const lane = await classify(text, anthropicKey);

  // CRISIS lane: log, return localized care resources, never reframe.
  if (lane === "crisis") {
    await supabase.rpc("log_journal_entry", {
      p_content: text, p_type: "setback", p_sentiment: "negative",
    });
    const care = crisisResponse(await memberCountry(supabase));
    return json({ lane: "crisis", message: care.message, resources: care.resources, reframe: null });
  }

  // NEUTRAL lane: log and acknowledge, no intervention.
  if (lane === "neutral") {
    await supabase.rpc("log_journal_entry", {
      p_content: text, p_type: "reflection", p_sentiment: "neutral",
    });
    return json({ lane: "neutral", message: "Logged. Carry it into tomorrow.", reframe: null });
  }

  // SETBACK lane: log the entry, build context, reframe, record it.
  await supabase.rpc("log_journal_entry", {
    p_content: text, p_type: "setback", p_sentiment: "negative",
  });

  // Guard the expensive Sonnet reframe against abuse. Crisis and neutral
  // above are never rate limited. The limit is generous, so normal use never
  // hits it; the entry is always saved either way.
  const { data: allowed } = await supabase.rpc("consume_ai_rate_limit", {
    p_action: "reframe", p_max: 30, p_window_seconds: 3600,
  });
  if (allowed === false) {
    return json({
      lane: "setback", reframe: null,
      message: "Your entry is saved. We have worked through a lot together today, so let's let this one settle and come back to it with fresh eyes soon.",
    });
  }

  let context: unknown = {};
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: ctx } = await supabase.rpc("build_vega_context", { p_member: user.id });
      context = ctx ?? {};
    }
  } catch { /* reframe still works with empty context */ }

  let reframeText: string;
  try {
    reframeText = await reframe(text, context, anthropicKey);
  } catch {
    return json({ lane: "setback", error: "reframe_unavailable",
      message: "I couldn't pull that together just now. Your entry is saved. Try again in a moment." }, 200);
  }

  await supabase.rpc("record_reframe", { p_reframe: reframeText });

  return json({ lane: "setback", message: reframeText, reframe: reframeText });
});
