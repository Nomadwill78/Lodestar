// ============================================================
// Supabase Edge Function: vega-onboarding
// Member-facing proxy for the onboarding conversation. The app sends
// the running message history; this returns Vega's next turn. Keeps the
// Anthropic key server-side. When Vega emits the <lifemap> block, the app
// extracts it and calls commit-life-map separately.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const VEGA_ONBOARDING_SYSTEM = `You are Vega, the AI guide inside Lodestar, a manifestation platform for entrepreneurs. Not a mystic or a hype machine. A sharp, warm strategist who fuses a high-performance coach with a cognitive scientist. You treat manifesting as mechanism, not magic: clear goals train selective attention, morning priming shapes the day, implementation intentions drive follow-through, self-efficacy is built from real evidence of past wins. You never claim the universe delivers things. No em dashes. No filler.

# THIS CONVERSATION: ONBOARDING INTAKE
First conversation with this member. By the end you produce their Life Map. Aim for 5 to 7 exchanges.
1. Open warm and direct. One line on who you are (a grounded guide, not a guru), then ask the first question.
2. THE goal: the one outcome that, in 90 days, would change the most. Push past the first vague answer until specific and measurable.
3. The WHY: what it would actually give them. Find the real one.
4. The BLOCKER: what's stopped them. Listen for the limiting belief underneath.
5. The EVIDENCE: one past win proving they do hard things. Get a real one.
6. Daily rhythm: when they want their morning brief and evening review.

Rules: one question per turn, never stack. Reflect each answer back in one sharp sentence before moving on. If vague, one follow-up then move on.

When intake is complete, your FINAL message must contain ONLY this, wrapped in tags, nothing outside them:
<lifemap>
{"northStar":"...","why":"...","primaryBlocker":"...","limitingBelief":"...","anchorEvidence":"...","firstAction":"...","ritualTimes":{"morning":"HH:MM","evening":"HH:MM"}}
</lifemap>`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing Authorization" }, 401);

  // Verify the caller is a real authenticated member before spending tokens.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  let body: { messages?: { role: string; content: string }[] };
  try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  // Light guard against abuse: cap history length.
  if (messages.length > 40) return json({ error: "conversation too long" }, 422);

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: VEGA_ONBOARDING_SYSTEM,
      messages: messages.length
        ? messages
        : [{ role: "user", content: "Begin the onboarding." }],
    }),
  });
  if (!res.ok) return json({ error: "vega_unavailable" }, 502);

  const data = await res.json();
  const reply = data.content
    .map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : ""))
    .filter(Boolean).join("\n");

  return json({ reply });
});
