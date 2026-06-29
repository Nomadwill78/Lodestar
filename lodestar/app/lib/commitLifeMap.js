// ============================================================
// Expo / React Native client helper
// Calls the commit-life-map Edge Function with the member's
// session token. This is what runs when onboarding finishes.
// ============================================================

import { supabase } from "./supabaseClient"; // your initialized client

/**
 * Commit a Life Map produced by Vega's onboarding to Supabase.
 * @param lifeMap the parsed JSON object from inside Vega's <lifemap> tags
 * @returns { lifeMapId, goalId } on success
 * @throws Error with a member-readable message on failure
 */
export async function commitLifeMap(lifeMap) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("You're signed out. Sign in to save your map.");

  const { data, error } = await supabase.functions.invoke("commit-life-map", {
    body: { lifeMap },
  });

  if (error) {
    // functions.invoke surfaces non-2xx as an error; read the body.
    let detail = "We couldn't save your map. Try once more.";
    try {
      const parsed = JSON.parse(await error.context?.text?.());
      if (parsed?.error) detail = parsed.error;
    } catch { /* keep default */ }
    throw new Error(detail);
  }

  return { lifeMapId: data.lifeMapId, goalId: data.goalId };
}

// ---- Usage inside the onboarding screen, after extractLifeMap() ----
//
// const map = extractLifeMap(vegaReply);
// if (map) {
//   try {
//     const { lifeMapId } = await commitLifeMap(map);
//     navigation.replace("Today", { lifeMapId });
//   } catch (e) {
//     setError(e.message);   // show in the UI, offer retry
//   }
// }
