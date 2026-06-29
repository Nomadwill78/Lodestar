// ============================================================
// Expo / React Native client helper: journal + reframe
// The member journals freely. This sends the entry, the server
// classifies it, and the response tells the UI which lane to render.
// ============================================================

import { supabase } from "./supabaseClient";

/**
 * Send a journal entry. The server logs it, classifies it, and returns
 * one of three lanes the UI must render differently:
 *   - "crisis":  show the support message prominently. No coaching UI.
 *   - "setback": show Vega's reframe.
 *   - "neutral": show a quiet acknowledgment.
 *
 * @param {string} text the member's free-text entry
 * @returns {{ lane: "crisis"|"setback"|"neutral", message: string, reframe: string|null }}
 */
export async function submitJournal(text) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("You're signed out. Sign in to journal.");

  const { data, error } = await supabase.functions.invoke("reframe", {
    body: { text },
  });

  if (error) {
    throw new Error("We couldn't save that just now. Try again in a moment.");
  }
  return data; // { lane, message, reframe }
}

// ---- Rendering guidance for the journal screen ----
//
// const res = await submitJournal(entry);
// switch (res.lane) {
//   case "crisis":
//     // Render res.message in a calm, high-contrast card. Make 988 and
//     // 741741 tappable (tel: / sms:). Do NOT show the reframe UI,
//     // streak counters, or any "next action" prompt here.
//     showSupportCard(res.message);
//     break;
//   case "setback":
//     // Render res.reframe as a Vega message in the chat thread.
//     appendVegaMessage(res.reframe);
//     break;
//   case "neutral":
//     // Quiet confirmation. The entry is saved; nothing else needed.
//     showToast(res.message);
//     break;
// }
