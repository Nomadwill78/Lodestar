// ============================================================
// Supabase Edge Function: commit-life-map
// Deno runtime. Deploy: supabase functions deploy commit-life-map
//
// Accepts Vega's Life Map JSON from the client, authenticates the
// member via their JWT, validates the shape, and commits all rows
// through the transactional commit_life_map RPC.
//
// The client NEVER touches the service key or the Anthropic key.
// This function runs with the member's own token, so RLS still
// guards every write.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const REQUIRED = ["northStar"];
const STRING_FIELDS = [
  "northStar", "why", "primaryBlocker",
  "limitingBelief", "anchorEvidence", "firstAction",
];

interface LifeMap {
  northStar: string;
  why?: string;
  primaryBlocker?: string;
  limitingBelief?: string;
  anchorEvidence?: string;
  firstAction?: string;
  ritualTimes?: { morning?: string; evening?: string };
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function validate(map: unknown): { ok: true; value: LifeMap } | { ok: false; error: string } {
  if (typeof map !== "object" || map === null) {
    return { ok: false, error: "payload must be a JSON object" };
  }
  const m = map as Record<string, unknown>;

  for (const f of REQUIRED) {
    if (typeof m[f] !== "string" || (m[f] as string).trim() === "") {
      return { ok: false, error: `${f} is required and must be a non-empty string` };
    }
  }
  for (const f of STRING_FIELDS) {
    if (f in m && m[f] != null && typeof m[f] !== "string") {
      return { ok: false, error: `${f} must be a string` };
    }
  }
  // Light sanity caps so a runaway model response can't bloat a row.
  for (const f of STRING_FIELDS) {
    if (typeof m[f] === "string" && (m[f] as string).length > 2000) {
      return { ok: false, error: `${f} exceeds 2000 characters` };
    }
  }
  const rt = m.ritualTimes as Record<string, unknown> | undefined;
  const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (rt) {
    for (const k of ["morning", "evening"]) {
      if (rt[k] != null && (typeof rt[k] !== "string" || !timeRe.test(rt[k] as string))) {
        return { ok: false, error: `ritualTimes.${k} must be HH:MM 24-hour` };
      }
    }
  }
  return { ok: true, value: m as unknown as LifeMap };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing Authorization header" }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const result = validate((body as Record<string, unknown>)?.lifeMap ?? body);
  if (!result.ok) return json({ error: result.error }, 422);

  // Client bound to the member's JWT, so commit_life_map runs as them
  // and RLS applies to every insert.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.rpc("commit_life_map", { payload: result.value });

  if (error) {
    // Surface auth/validation errors distinctly from server faults.
    const status = /not authenticated/i.test(error.message) ? 401
      : /required/i.test(error.message) ? 422
      : 500;
    return json({ error: error.message }, status);
  }

  return json({ success: true, ...data }, 201);
});
