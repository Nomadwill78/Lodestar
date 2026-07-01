// ============================================================
// saveDeviceLocale: capture the member's region and timezone from the
// device and store them on the member record. Region (ISO country code)
// drives localized crisis resources; timezone makes the morning brief
// and nudge sweeps fire at the member's real local hour instead of UTC.
//
// Best-effort by design: it never throws and never blocks onboarding.
// Writes go through the member's own session, so RLS (members_update_own)
// still scopes the update to their row.
// ============================================================

import * as Localization from "expo-localization";
import { supabase } from "./supabaseClient";

export async function saveDeviceLocale() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const update = {};

    // ISO 3166-1 alpha-2 region (e.g. "US"). The column constraint wants
    // two uppercase letters, so validate before sending.
    const region = Localization.getLocales?.()?.[0]?.regionCode;
    if (region && /^[A-Za-z]{2}$/.test(region)) {
      update.country_code = region.toUpperCase();
    }

    // IANA timezone (e.g. "America/New_York").
    const tz = Localization.getCalendars?.()?.[0]?.timeZone;
    if (tz && typeof tz === "string") {
      update.timezone = tz;
    }

    if (Object.keys(update).length === 0) return;
    await supabase.from("members").update(update).eq("id", user.id);
  } catch {
    // Locale capture is a nicety, never a blocker. Ignore failures.
  }
}
