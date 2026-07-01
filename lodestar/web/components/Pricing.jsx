"use client";

import { useState } from "react";

const PLANS = [
  {
    name: "Free",
    monthly: 0,
    tagline: "Start the loop today.",
    features: [
      "Daily morning brief",
      "Journal with Vega's reframe",
      "Your Life Map and north star",
      "Vega's emotional presence",
    ],
    cta: "Join the waitlist",
    highlight: false,
  },
  {
    name: "Aligned",
    monthly: 19,
    tagline: "The full daily system.",
    features: [
      "Everything in Free",
      "Evening review and momentum view",
      "Pattern detection across your logs",
      "Smarter, context-aware briefs",
    ],
    cta: "Choose Aligned",
    highlight: true,
  },
  {
    name: "Founder",
    monthly: 49,
    tagline: "For the goal that defines the year.",
    features: [
      "Everything in Aligned",
      "Priority guidance from Vega",
      "Deeper goal and blocker mapping",
      "Early access to new mechanisms",
    ],
    cta: "Choose Founder",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="border-y border-white/5 bg-deep/40">
      <div className="mx-auto max-w-content px-6 py-20 md:py-28">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-star">Pricing</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Transparent. Start free, upgrade when it earns it.
          </h2>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-night/60 p-1 text-sm">
            <button
              onClick={() => setAnnual(false)}
              className={"rounded-full px-4 py-1.5 font-medium transition-colors " + (!annual ? "bg-star text-night" : "text-muted hover:text-ink")}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={"rounded-full px-4 py-1.5 font-medium transition-colors " + (annual ? "bg-star text-night" : "text-muted hover:text-ink")}
            >
              Annual
              <span className={"ml-1.5 " + (annual ? "text-night/70" : "text-star")}>2 months free</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} annual={annual} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan, annual }) {
  const [busy, setBusy] = useState(false);
  // Annual is billed at 10x the monthly rate (two months free); show the
  // effective per-month price so the comparison is honest.
  const effective = annual ? Math.round((plan.monthly * 10) / 12) : plan.monthly;

  // Free plan joins the waitlist; paid plans open Stripe Checkout when it is
  // configured, otherwise fall back to the waitlist (pre-launch).
  async function choose() {
    if (plan.monthly === 0) {
      window.location.href = "#waitlist";
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: plan.name.toLowerCase(), billing: annual ? "annual" : "monthly" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "#waitlist";
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={
        "relative rounded-3xl border p-7 " +
        (plan.highlight
          ? "border-star/60 bg-star/[0.07] shadow-2xl shadow-black/30"
          : "border-white/10 bg-night/40")
      }
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-7 rounded-full bg-star px-3 py-1 text-xs font-semibold text-night">
          Most chosen
        </span>
      )}
      <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-4xl font-semibold text-ink">${effective}</span>
        <span className="text-muted">/mo</span>
      </div>
      <p className="mt-1 h-4 text-xs text-muted">
        {plan.monthly > 0 && annual ? `Billed $${plan.monthly * 10} per year` : " "}
      </p>

      <button
        onClick={choose}
        disabled={busy}
        className={
          "mt-6 block w-full rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60 " +
          (plan.highlight ? "bg-star text-night" : "border border-white/15 text-ink hover:border-star/50")
        }
      >
        {busy ? "Opening checkout..." : plan.cta}
      </button>

      <ul className="mt-7 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2.5 text-muted">
            <span className="mt-0.5 text-star">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
