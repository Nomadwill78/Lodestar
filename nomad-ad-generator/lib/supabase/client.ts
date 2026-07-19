"use client";

import { createBrowserClient } from "@supabase/ssr";
import { clean } from "../env";

export function createClient() {
  // NEXT_PUBLIC_* values are inlined at build time; clean() strips any BOM or
  // zero-width characters that snuck into the configured values.
  return createBrowserClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}
