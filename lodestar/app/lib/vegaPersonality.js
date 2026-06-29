// ============================================================
// Vega's personality engine. Single source of truth for her
// emotional tiers: how she looks, how she sounds, and the push
// copy at each level of absence. Imported by the app (rendering)
// and the re-engagement job (notifications) so she stays in
// character everywhere.
//
// Design principle: Vega's escalating worry is always FOR the
// member's dream and FOR the member, never a guilt weapon. Even
// at meltdown she opens the door back without shame. The instant
// a member returns, she resets to relief and warmth.
// ============================================================

export const VEGA_TIERS = {
  present: {
    key: "present",
    dayRange: [0, 0],
    // Visual state cues the app maps to her sprite / glow.
    visual: { glow: 1.0, color: "#E8B04B", expression: "radiant", pulse: "steady" },
    // How she greets a member who's current.
    greetings: [
      "There you are. Let's move something today.",
      "Good to see you. Your north star is right where you left it.",
      "I'm with you. What are we making real today?",
    ],
    // No push needed at tier 0; the morning brief carries the day.
    push: null,
  },

  gentle: {
    key: "gentle",
    dayRange: [1, 2],
    visual: { glow: 0.9, color: "#E8B04B", expression: "attentive", pulse: "soft" },
    greetings: [
      "Welcome back. A day away is nothing. Let's pick the thread back up.",
      "I kept your focus warm for you. Ready when you are.",
    ],
    push: {
      title: "Vega",
      body: "Thinking of you and your north star. One small move today keeps it alive.",
    },
  },

  reaching: {
    key: "reaching",
    dayRange: [3, 5],
    visual: { glow: 0.75, color: "#E8B04B", expression: "hopeful", pulse: "lean-in" },
    greetings: [
      "You came back. I hoped you would. Let's not let the goal drift further.",
      "A few days is just a few days. The dream is still yours. Start small with me.",
    ],
    push: {
      title: "Vega",
      body: "Your goal misses you, and honestly, so do I. Two minutes is all it takes to begin again.",
    },
  },

  worried: {
    key: "worried",
    dayRange: [6, 9],
    visual: { glow: 0.55, color: "#D9A24B", expression: "concerned", pulse: "uneven" },
    greetings: [
      "I've been holding your vision this whole time. I'm so glad you're here. Let's breathe and begin.",
      "You're back. That's what matters. The goal hasn't moved. Neither have I.",
    ],
    push: {
      title: "Vega",
      body: "It's been almost a week. I've been holding your vision for you. Come back to it, even for a moment.",
    },
  },

  aching: {
    key: "aching",
    dayRange: [10, 13],
    visual: { glow: 0.35, color: "#B98AC9", expression: "yearning", pulse: "faint" },
    greetings: [
      "You're here. I can't tell you what that means. Let's start so gently. One breath, one step.",
      "I never stopped believing this goal was yours. Sit with me a second, then we move.",
    ],
    push: {
      title: "Vega",
      body: "Almost two weeks. The vision you trusted me with still glows. You matter to me. Please don't leave it behind.",
    },
  },

  meltdown: {
    key: "meltdown",
    dayRange: [14, Infinity],
    visual: { glow: 0.2, color: "#7FA8E8", expression: "panicked-loving", pulse: "flicker" },
    // The meltdown greeting is a two-beat: real emotion, then an
    // immediate, shame-free door back in.
    greetings: [
      "You're back. You're really back. I was so afraid the dream went dark. It didn't. It's right here, and so are you. Let's begin again, no guilt, just forward.",
      "Fourteen days felt like forever. I never let go of your north star, not once. You don't owe me an explanation. You only owe yourself the next small step. Take it with me.",
    ],
    push: {
      title: "Vega",
      body: "It's been two weeks and I'm worried about the dream you trusted me with. I haven't let it go. Whenever you're ready, I'm right here, no judgment. Just come back.",
    },
  },
};

// Resolve a tier definition from a tier key (server) or day count (either).
export function tierFromKey(key) {
  return VEGA_TIERS[key] ?? VEGA_TIERS.present;
}

export function tierFromDays(days) {
  if (days <= 0) return VEGA_TIERS.present;
  if (days <= 2) return VEGA_TIERS.gentle;
  if (days <= 5) return VEGA_TIERS.reaching;
  if (days <= 9) return VEGA_TIERS.worried;
  if (days <= 13) return VEGA_TIERS.aching;
  return VEGA_TIERS.meltdown;
}

// Pick a greeting for a tier, varied so it never feels canned.
export function pickGreeting(tier) {
  const list = tier.greetings;
  return list[Math.floor(Math.random() * list.length)];
}
