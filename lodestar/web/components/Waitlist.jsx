"use client";

import { useState } from "react";
import StarMark from "./StarMark";

// Waitlist capture. The primary CTA while the app is pre-launch: "Start
// free" scrolls here. Posts to /api/missive with source "waitlist".
export default function Waitlist() {
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
        body: JSON.stringify({ email: email.trim(), source: "waitlist" }),
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
    <section id="waitlist" className="border-y border-white/5 bg-deep/40">
      <div className="mx-auto max-w-content px-6 py-20 text-center md:py-24">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-star/30 bg-star/10">
          <StarMark size={22} />
        </div>
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Be first when Lodestar opens.
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted">
          We are onboarding founders in small groups. Join the waitlist and we
          will send your invite the moment your spot is ready.
        </p>

        {sent ? (
          <p className="mt-8 text-lg font-medium text-care">
            You are on the list. Watch your inbox for your invite.
          </p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
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
              {busy ? "Joining..." : "Join the waitlist"}
            </button>
          </form>
        )}
        {err ? <p className="mt-3 text-sm text-care">{err}</p> : null}
        <p className="mt-4 text-xs text-muted">No spam. Just your invite and the occasional founder note.</p>
      </div>
    </section>
  );
}
