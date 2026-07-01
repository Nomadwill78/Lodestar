// ============================================================
// useTier: loads the member's subscription tier ('free' | 'aligned' |
// 'founder') so the UI can show or hide upgrade prompts. RLS scopes the
// select to the caller's own row.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";

export function useTier() {
  const [tier, setTier] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("members").select("tier").maybeSingle();
    setTier(data?.tier ?? null);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { tier, isFree: tier === "free", reload: load };
}
