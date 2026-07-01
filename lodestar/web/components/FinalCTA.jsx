"use client";

import { useState } from "react";

export default function FinalCTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/missive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error === "invalid_email" ? "That email does not look right." : "Something went wrong. Try again in a moment.");
      }
      setSent(true);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-starfield relative overflow-hidden">
      <div className="mx-auto max-w-content px-6 py-24 md:py-32">
        <div className="grid items-center gap-14 md:grid-cols-[1.2fr_1fr]">
          {/* CTA + founder note */}
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Your north star is already yours. Let's make it daily.
            </h2>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#waitlist"
                className="rounded-full bg-star px-7 py-3.5 text-base font-semibold text-night transition-transform hover:scale-[1.03]"
              >
                Join the waitlist
              </a>
              <a
                href="#vega"
                className="rounded-full border border-white/15 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-star/50 hover:text-star"
              >
                Meet Vega
              </a>
            </div>

            {/* Founder's note + Missive capture */}
            <div className="mt-12 rounded-2xl border border-white/10 bg-deep/50 p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-star">The Missive</p>
              <p className="mt-3 leading-relaxed text-muted">
                A short founder's note, now and then. The thinking behind
                Lodestar, the science we are building on, and what we are
                learning from people doing the work. No noise, no selling.
              </p>

              {sent ? (
                <p className="mt-5 font-medium text-care">
                  You are on the list. Watch for the first Missive soon.
                </p>
              ) : (
                <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    aria-label="Email address"
                    disabled={busy}
                    className="flex-1 rounded-full border border-white/15 bg-night/60 px-5 py-3 text-ink outline-none placeholder:text-muted focus:border-star/60 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-full bg-star px-6 py-3 font-semibold text-night transition-transform hover:scale-[1.03] disabled:opacity-60"
                  >
                    {busy ? "Joining..." : "Subscribe"}
                  </button>
                </form>
              )}
              {err ? <p className="mt-3 text-sm text-care">{err}</p> : null}
            </div>
          </div>

          {/* Art */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 mx-auto h-64 w-64 animate-breathe rounded-full bg-star/20 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vega/empty-state.png"
              alt="Vega offering a small glowing star"
              className="relative z-10 w-full max-w-xs rounded-3xl border border-white/10 shadow-2xl shadow-black/40"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
