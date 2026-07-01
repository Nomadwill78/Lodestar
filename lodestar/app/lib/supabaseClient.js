// ============================================================
// Supabase client, configured for React Native.
// Session tokens persist in expo-secure-store (encrypted), not
// AsyncStorage, so a stolen device backup can't lift them.
// ============================================================

import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig.extra;

// SecureStore caps values at ~2KB; Supabase sessions fit comfortably.
const SecureStorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // no URL-based auth on native
  },
});
