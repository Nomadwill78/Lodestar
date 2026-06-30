// ============================================================
// Root layout. Wraps the app in AuthProvider and routes based on
// auth + onboarding state:
//   no session       -> (auth)/sign-in
//   session, no map  -> onboarding
//   session + map    -> (app)/today
// ============================================================

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { registerForPush } from "../lib/registerForPush";
import { configurePurchases } from "../lib/purchases";
import { supabase } from "../lib/supabaseClient";

const NIGHT = "#0B1026";

function RouterGate() {
  const { session, hasLifeMap, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!session) {
      if (!inAuth) router.replace("/(auth)/sign-in");
    } else if (hasLifeMap === false) {
      if (!inOnboarding) router.replace("/onboarding");
    } else if (hasLifeMap === true) {
      if (inAuth || inOnboarding) router.replace("/(app)/today");
    }
  }, [session, hasLifeMap, loading, segments]);

  // Register for push, configure billing, and reconcile any web-first
  // purchase once a session exists.
  useEffect(() => {
    if (session?.user?.id) {
      registerForPush(session.user.id);
      configurePurchases(session.user.id);
      supabase.rpc("reconcile_my_entitlements").catch(() => {});
    }
  }, [session?.user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: NIGHT, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#E8B04B" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: NIGHT } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouterGate />
    </AuthProvider>
  );
}
