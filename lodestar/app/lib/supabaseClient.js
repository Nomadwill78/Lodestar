// ============================================================
// Supabase client, configured for React Native.
// Session tokens persist in expo-secure-store (encrypted), not
// AsyncStorage, so a stolen device backup can't lift them.
// ============================================================

import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig.extra;

// Session persistence differs by platform:
//  - native: encrypted SecureStore (a stolen backup can't lift the token)
//  - web:    localStorage (SecureStore is native-only)
// SecureStore caps values at ~2KB; Supabase sessions fit comfortably.
const SecureStorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const WebStorageAdapter = {
  getItem: (key) => {
    try { return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null); }
    catch { return Promise.resolve(null); }
  },
  setItem: (key, value) => {
    try { globalThis.localStorage?.setItem(key, value); } catch { /* private mode */ }
    return Promise.resolve();
  },
  removeItem: (key) => {
    try { globalThis.localStorage?.removeItem(key); } catch { /* private mode */ }
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? WebStorageAdapter : SecureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // OTP code flow, not URL-based
  },
});
