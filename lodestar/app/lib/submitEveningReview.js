// ============================================================
// Evening review submit. Mirror of the morning brief, but member-
// initiated and effortless: a couple of lines about what moved and
// what's next. It writes append-only evidence (source evening_review)
// and counts as contact, so Vega resets to warmth.
//
// All writes are RLS-scoped: log_entries.member_id must equal the
// caller's auth.uid(), and touch_contact() runs as the member.
// ============================================================

import { supabase } from "./supabaseClient";

/**
 * Save an evening review.
 * @param {{ moved?: string, tomorrow?: string }} fields
 *   moved    - what moved today (logged as a win, fuels momentum)
 *   tomorrow - the one thing for tomorrow (logged as a reflection)
 */
export async function submitEveningReview({ moved = "", tomorrow = "" }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("You're signed out. Sign in to review your day.");
  const memberId = session.user.id;

  const m = moved.trim();
  const t = tomorrow.trim();
  if (!m && !t) throw new Error("Add a line about today or tomorrow first.");

  const rows = [];
  if (m) rows.push({ member_id: memberId, type: "win", content: m, sentiment: "positive", source: "evening_review" });
  if (t) rows.push({ member_id: memberId, type: "reflection", content: `Tomorrow: ${t}`, source: "evening_review" });

  const { error } = await supabase.from("log_entries").insert(rows);
  if (error) throw new Error("We couldn't save that just now. Try again in a moment.");

  // Reviewing the day is meaningful contact; reset Vega's clock.
  await supabase.rpc("touch_contact");
}
