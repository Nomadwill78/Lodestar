/**
 * Environment variable access with sanitization.
 *
 * Values pasted into the Vercel dashboard (or copied from files saved as
 * UTF-8-with-BOM) can carry invisible characters — most notably U+FEFF, the
 * byte-order mark. Browsers require HTTP header values to be ISO-8859-1, so a
 * BOM inside e.g. the Supabase anon key makes every fetch throw:
 *   "Failed to read the 'headers' property from 'RequestInit':
 *    String contains non ISO-8859-1 code point."
 * This took the production signup flow down once; sanitize every env value so
 * a bad paste can never do that again.
 */
const INVISIBLE = /^[\s﻿​‌‍⁠]+|[\s﻿​‌‍⁠]+$/g;

export function clean(value: string | undefined): string {
  return (value ?? "").replace(INVISIBLE, "");
}

export function requireEnv(value: string | undefined, name: string): string {
  const v = clean(value);
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}
