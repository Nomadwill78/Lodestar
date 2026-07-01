// ============================================================
// AuthContext: single source of truth for session + whether the
// member has completed onboarding (has an active life_map). The
// root layout reads this to route between auth, onboarding, and app.
// ============================================================

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [hasLifeMap, setHasLifeMap] = useState(null); // null = unknown/loading
  const [loading, setLoading] = useState(true);

  async function checkLifeMap(userId) {
    if (!userId) { setHasLifeMap(false); return; }
    const { count } = await supabase
      .from("life_maps")
      .select("id", { count: "exact", head: true })
      .eq("member_id", userId)
      .eq("status", "active");
    setHasLifeMap((count ?? 0) > 0);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await checkLifeMap(session?.user?.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setSession(session);
      await checkLifeMap(session?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Called by onboarding once commitLifeMap succeeds, so routing updates
  // without waiting for a round trip.
  const markOnboarded = () => setHasLifeMap(true);

  return (
    <AuthContext.Provider value={{ session, hasLifeMap, loading, markOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
