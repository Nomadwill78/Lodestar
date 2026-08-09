/**
 * Deterministic Ads Manager naming + UTM builder. Nothing here calls the
 * model — it's derived straight from the inputs the user already typed and
 * the variant Claude already wrote, so it costs nothing to generate and is
 * always in sync with what's on screen.
 *
 * Two casings on purpose: Ads Manager names read like a media buyer would
 * type them (PascalCase, underscore-separated fields). UTM values follow
 * analytics convention (lowercase, hyphen-separated, URL-safe) — the two
 * are never interchangeable in practice, so we don't pretend they are.
 */

const STOPWORDS = new Set(["a", "an", "the", "for", "of", "with", "to", "your"]);

function extractWords(input: string, maxWords: number): string[] {
  return input
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
    .slice(0, maxWords);
}

function toManagerField(input: string, maxWords: number, fallback = "General"): string {
  const words = extractWords(input, maxWords);
  if (words.length === 0) return fallback;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function toUtmField(input: string, maxWords: number, fallback = "general"): string {
  const words = extractWords(input, maxWords).map((w) => w.toLowerCase());
  if (words.length === 0) return fallback;
  return words.join("-");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export interface AdNamingInput {
  product: string;
  audience: string;
  tone: string;
  stage: string;
  hookStyle: string;
  variantIndex: number; // 1-based
  date: Date;
}

export interface AdNaming {
  campaignName: string;
  adSetName: string;
  adName: string;
  utmQuery: string;
}

export function buildAdNaming(input: AdNamingInput): AdNaming {
  const { product, audience, tone, stage, hookStyle, variantIndex, date } = input;
  const yyyymm = `${date.getFullYear()}${pad(date.getMonth() + 1)}`;
  const yyyymmdd = `${yyyymm}${pad(date.getDate())}`;

  const mProduct = toManagerField(product, 4);
  const mAudience = toManagerField(audience, 3, "BroadAudience");
  const mTone = toManagerField(tone, 3);
  const mHook = toManagerField(hookStyle, 3);

  const uProduct = toUtmField(product, 4);
  const uAudience = toUtmField(audience, 3, "broad-audience");
  const uHook = toUtmField(hookStyle, 3);

  const campaignName = `${stage}_${mProduct}_${yyyymm}`;
  const adSetName = `${mProduct}_${mAudience}_${mTone}`;
  const adName = `${mHook}_V${variantIndex}_${yyyymmdd}`;

  const utmParams = new URLSearchParams([
    ["utm_source", "facebook"],
    ["utm_medium", "paid-social"],
    ["utm_campaign", `${stage.toLowerCase()}-${uProduct}-${yyyymm}`],
    ["utm_content", `${uHook}-v${variantIndex}`],
    ["utm_term", uAudience],
  ]);

  return { campaignName, adSetName, adName, utmQuery: `?${utmParams.toString()}` };
}
