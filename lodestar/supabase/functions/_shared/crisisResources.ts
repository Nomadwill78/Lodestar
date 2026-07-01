// ============================================================
// Crisis resources, localized by member region. EVERY message and every
// resource here is static and human-authored, never model-generated, so
// the wording cannot drift. The reframe function selects a set by the
// member's country_code and falls back to an international list when the
// region is unknown. The app renders the returned resources as tappable
// actions.
//
// Hard rule: this path is the fail-safe. It never runs a coaching
// technique. Keep it calm, unbranded, and short.
// ============================================================

export interface CrisisResource {
  label: string;   // what the button says
  action: string;  // tel:, sms:, or https: target the app can open
}

export interface CrisisResponse {
  message: string;
  resources: CrisisResource[];
}

// Shared opening and closing beats, kept identical across regions so only
// the resources change by locale.
const OPENING =
  "I want to pause our usual rhythm for a moment, because what you wrote sounds heavier than a setback, and you deserve real support, not a coaching exercise.\n\n" +
  "You don't have to carry this alone.";

const CLOSING =
  "\n\nI'm still here when you're ready. But right now, reaching out to one of these, or to someone you trust, matters more than anything we would work on together.";

// Region sets. Add locales here as the member base grows.
const BY_COUNTRY: Record<string, CrisisResponse> = {
  US: {
    message:
      OPENING +
      " If you're in the US, you can call or text 988 anytime to reach the Suicide and Crisis Lifeline, or text HOME to 741741 for the Crisis Text Line." +
      CLOSING,
    resources: [
      { label: "Call or text 988", action: "tel:988" },
      { label: "Text HOME to 741741", action: "sms:741741?body=HOME" },
    ],
  },
  CA: {
    message:
      OPENING +
      " In Canada, you can call or text 988 anytime to reach the Suicide Crisis Helpline." +
      CLOSING,
    resources: [{ label: "Call or text 988", action: "tel:988" }],
  },
  GB: {
    message:
      OPENING +
      " In the UK, you can call Samaritans free on 116 123 anytime, or text SHOUT to 85258." +
      CLOSING,
    resources: [
      { label: "Call Samaritans 116 123", action: "tel:116123" },
      { label: "Text SHOUT to 85258", action: "sms:85258?body=SHOUT" },
    ],
  },
  AU: {
    message:
      OPENING +
      " In Australia, you can call Lifeline on 13 11 14 anytime, or text 0477 13 11 14." +
      CLOSING,
    resources: [{ label: "Call Lifeline 13 11 14", action: "tel:131114" }],
  },
  IE: {
    message:
      OPENING +
      " In Ireland, you can call Samaritans free on 116 123 anytime, or text 50808." +
      CLOSING,
    resources: [
      { label: "Call Samaritans 116 123", action: "tel:116123" },
      { label: "Text 50808", action: "sms:50808" },
    ],
  },
};

// International fallback when the region is unknown. Names the major English
// lines plus a global directory so no one is left without a door.
const INTERNATIONAL: CrisisResponse = {
  message:
    OPENING +
    " If you're in the US or Canada, call or text 988. In the UK or Ireland, call Samaritans on 116 123. In Australia, call Lifeline on 13 11 14. Anywhere else, findahelpline.com lists a free, trained line for your country." +
    CLOSING,
  resources: [
    { label: "Call or text 988 (US, Canada)", action: "tel:988" },
    { label: "Find a helpline near you", action: "https://findahelpline.com" },
  ],
};

export function crisisResponse(countryCode?: string | null): CrisisResponse {
  if (!countryCode) return INTERNATIONAL;
  return BY_COUNTRY[countryCode.toUpperCase()] ?? INTERNATIONAL;
}
