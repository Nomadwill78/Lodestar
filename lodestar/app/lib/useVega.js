// ============================================================
// useVega: loads Vega's current emotional state for this member
// and exposes touch() to reset the contact clock. Call touch()
// on any meaningful engagement (opening the app's Today screen,
// submitting a journal entry, finishing onboarding).
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";

export function useVega() {
  const [tierKey, setTierKey] = useState("present");
  const [daysQuiet, setDaysQuiet] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.rpc("my_vega_state");
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      setTierKey(row.tier);
      setDaysQuiet(row.days_quiet);
    }
    setLoading(false);
  }, []);

  // Reset the clock, then reload so her greeting flips to relief at once.
  const touch = useCallback(async () => {
    await supabase.rpc("touch_contact");
    await load();
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return { tierKey, daysQuiet, loading, touch, reload: load };
}
