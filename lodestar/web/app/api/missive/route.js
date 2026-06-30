// ============================================================
// POST /api/missive  -  Missive newsletter signup.
// Server-side route handler. Validates the email and inserts it into the
// Supabase missive_subscribers table using the anon key. RLS on that
// table is insert-only, so this can add a subscriber but never read or
// leak the list. Duplicate emails are ignored and treated as success.
// ============================================================

import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });

  // Insert, ignoring duplicates so a repeat signup still reads as success.
  const { error } = await supabase
    .from("missive_subscribers")
    .upsert({ email, source: "website" }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
