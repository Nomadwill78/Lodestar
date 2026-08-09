/**
 * Heuristic scan for Meta ad-copy phrasing that commonly triggers manual
 * review or disapproval. Not a substitute for Meta's actual policy review —
 * it exists to catch the obvious, frequent offenders before a user submits
 * an ad and burns a review cycle waiting on a rejection they could have
 * avoided by rewording one line.
 */

export type PolicyCategory = "health" | "personal-attribute" | "before-after" | "superlative";

export interface PolicyFlag {
  category: PolicyCategory;
  label: string;
  match: string;
}

const CATEGORY_LABEL: Record<PolicyCategory, string> = {
  health: "Health claim",
  "personal-attribute": "Personal attribute",
  "before-after": "Before/after",
  superlative: "Superlative",
};

const HEALTH_TERMS = [
  "cure", "cures", "cured", "curing", "treat", "treats", "treated", "treatment",
  "heal", "heals", "healing", "diagnose", "diagnosis", "disease", "illness",
  "symptom", "symptoms", "clinically proven", "lose weight", "weight loss",
  "fat loss", "cholesterol", "diabetes", "doctor recommended", "pain relief",
  "cancer", "medication", "prescription",
];

const SENSITIVE_ATTRIBUTE_TERMS = [
  "debt", "bankrupt", "broke", "poor credit", "overweight", "obese",
  "depression", "depressed", "anxiety", "divorced", "lonely", "disabled",
  "disability", "pregnant", "hiv", "std", "addiction", "addicted",
];

const BEFORE_AFTER_PATTERNS = [
  /\bbefore\s*(?:and|&|\/)\s*after\b/i,
  /\btransformation\b/i,
  /\bresults?\s+in\s+(?:just\s+)?\d+\s*(?:days?|weeks?)\b/i,
];

const SUPERLATIVE_TERMS = [
  "best", "#1", "number one", "guarantee", "guaranteed", "miracle",
  "instantly", "100%", "risk-free", "proven", "world's best", "greatest",
];

function wordMatch(text: string, term: string): string | null {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = /^[a-z0-9]/i.test(term[0]) && /[a-z0-9]$/i.test(term[term.length - 1])
    ? new RegExp(`\\b${escaped}\\b`, "i")
    : new RegExp(escaped, "i");
  const m = text.match(pattern);
  return m ? m[0] : null;
}

export function scanPolicyRisk(text: string): PolicyFlag[] {
  const flags: PolicyFlag[] = [];

  for (const term of HEALTH_TERMS) {
    const match = wordMatch(text, term);
    if (match) {
      flags.push({ category: "health", label: CATEGORY_LABEL.health, match });
      break;
    }
  }

  const hasSecondPerson = /\byou(?:r|'re|'ve)?\b/i.test(text);
  if (hasSecondPerson) {
    for (const term of SENSITIVE_ATTRIBUTE_TERMS) {
      const match = wordMatch(text, term);
      if (match) {
        flags.push({ category: "personal-attribute", label: CATEGORY_LABEL["personal-attribute"], match: `you… ${match}` });
        break;
      }
    }
  }

  for (const pattern of BEFORE_AFTER_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      flags.push({ category: "before-after", label: CATEGORY_LABEL["before-after"], match: m[0] });
      break;
    }
  }

  for (const term of SUPERLATIVE_TERMS) {
    const match = wordMatch(text, term);
    if (match) {
      flags.push({ category: "superlative", label: CATEGORY_LABEL.superlative, match });
      break;
    }
  }

  return flags;
}

export function variantText(v: { headline: string; primary_text: string; description: string; cta: string }): string {
  return `${v.headline} ${v.primary_text} ${v.description} ${v.cta}`;
}
