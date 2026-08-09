import Link from "next/link";
import Logo from "./components/Logo";
import { PLANS } from "../lib/plans";

const swipeFile: { heat: "cold" | "warm" | "hot"; tag: string; headline: string }[] = [
  { heat: "cold", tag: "TOF · Hook", headline: "Your coffee is getting cold. Ours never does." },
  { heat: "cold", tag: "TOF · Hook", headline: "73% of DTC brands are wasting ad spend on this one mistake." },
  { heat: "warm", tag: "MOF · Retarget", headline: "Still thinking it over? Here's what 4,200 customers already know." },
  { heat: "warm", tag: "MOF · Retarget", headline: "You added it to cart. It's still waiting. So is 15% off." },
  { heat: "hot", tag: "BOF · Convert", headline: "Last call: your cart expires at midnight." },
  { heat: "hot", tag: "BOF · Convert", headline: "Join 12,000 subscribers — first box free, cancel anytime." },
  { heat: "cold", tag: "TOF · Hook", headline: "The $24 subscription replacing $6 coffee-shop runs." },
  { heat: "warm", tag: "MOF · Retarget", headline: "You watched the demo. Here's the 2-minute version of why it works." },
];

const specs = [
  { k: "Targeting", v: "TOF / MOF / BOF, priced by stage" },
  { k: "Output", v: "3 variants per generation" },
  { k: "Turnaround", v: "Under 10 seconds" },
  { k: "Export", v: "One-click copy, full history" },
  { k: "Trained on", v: "$50M+ in Meta ad spend" },
  { k: "Built for", v: "DTC & Shopify offers" },
];

const steps = [
  {
    n: "01",
    title: "Describe your offer",
    body: "What you're selling, who it's for, and the tone you want. More detail in, sharper hooks out.",
  },
  {
    n: "02",
    title: "Pick a funnel stage",
    body: "Cold, warm, or hot — each gets a completely different angle, not just a different label.",
  },
  {
    n: "03",
    title: "Get 3 winning variants",
    body: "Different hooks, different angles, different CTAs. Ready to load into Ads Manager and test.",
  },
];

export default function Home() {
  return (
    <div className="shell">
      <nav className="nav">
        <Link href="/" className="nav-brand">
          <Logo size={36} />
          <div>
            <div className="nav-word">NOMAD</div>
            <div className="nav-sub">CONSULTING</div>
          </div>
        </Link>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/login" style={{ color: "var(--paper-60)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Log in
          </Link>
          <Link href="/signup" className="btn-hot" style={{ padding: "9px 20px", fontSize: "14px", textDecoration: "none", display: "inline-block" }}>
            Start Free
          </Link>
        </div>
      </nav>

      <section className="center-wrap" style={{ padding: "88px 24px 48px", textAlign: "center" }}>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: "28px" }}>
          Meta Ad Copy Generator
        </div>
        <h1 className="display" style={{ fontSize: "clamp(48px, 9vw, 92px)" }}>
          Stop the scroll.
          <br />
          Start <span style={{ color: "var(--hot)" }}>converting.</span>
        </h1>
        <p style={{ fontSize: "18px", color: "var(--paper-60)", lineHeight: 1.7, maxWidth: "560px", margin: "28px auto 40px" }}>
          Generate scroll-stopping Facebook &amp; Instagram ad copy for every stage of your funnel — in seconds. Built on
          $50M+ in Meta ad expertise.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" className="btn-primary" style={{ padding: "15px 32px", fontSize: "16px", textDecoration: "none", display: "inline-block" }}>
            Generate Your First Ad →
          </Link>
          <a href="#pricing" className="btn-outline" style={{ padding: "15px 32px", fontSize: "16px", textDecoration: "none", display: "inline-block" }}>
            See Rate Card
          </a>
        </div>
        <p className="mono" style={{ marginTop: "18px", fontSize: "12px", color: "var(--paper-30)", letterSpacing: "0.04em" }}>
          NO CREDIT CARD REQUIRED · CANCEL ANYTIME
        </p>
      </section>

      <section style={{ padding: "24px 0 72px" }}>
        <div className="marquee">
          <div className="marquee-track">
            {[...swipeFile, ...swipeFile].map((item, i) => (
              <div key={i} className="tear-card" data-heat={item.heat}>
                <span className="tear-tag">{item.tag}</span>
                <p className="tear-headline">{item.headline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: "72px" }}>
        <div className="heat-gauge" style={{ marginBottom: "32px", maxWidth: "280px", margin: "0 auto 32px" }}>
          <span className="seg-cold" />
          <span className="seg-warm" />
          <span className="seg-hot" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1px", background: "var(--paper-08)", border: "1px solid var(--paper-08)", borderRadius: "12px", overflow: "hidden" }}>
          {specs.map((s) => (
            <div key={s.k} style={{ background: "var(--ink-2)", padding: "20px 22px" }}>
              <div className="mono" style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--paper-45)", marginBottom: "8px" }}>
                {s.k}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ padding: "56px 24px 72px" }}>
        <h2 className="display" style={{ textAlign: "center", fontSize: "clamp(28px, 4vw, 40px)", marginBottom: "12px" }}>
          How It Works
        </h2>
        <p style={{ textAlign: "center", color: "var(--paper-45)", marginBottom: "48px", fontSize: "16px" }}>
          From blank page to high-converting ad copy in 3 steps
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {steps.map((step) => (
            <div key={step.n} className="card" style={{ padding: "28px" }}>
              <div className="mono" style={{ fontSize: "13px", fontWeight: 700, color: "var(--paper-30)", letterSpacing: "0.1em", marginBottom: "16px" }}>
                {step.n}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>{step.title}</h3>
              <p style={{ color: "var(--paper-60)", fontSize: "14px", lineHeight: 1.6, marginBottom: step.n === "02" ? "18px" : 0 }}>
                {step.body}
              </p>
              {step.n === "02" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <span className="mono" data-heat="cold" style={{ fontSize: "11px", fontWeight: 700, padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--cold)", color: "var(--cold)" }}>
                    TOF
                  </span>
                  <span className="mono" data-heat="warm" style={{ fontSize: "11px", fontWeight: 700, padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--warm)", color: "var(--warm)" }}>
                    MOF
                  </span>
                  <span className="mono" data-heat="hot" style={{ fontSize: "11px", fontWeight: 700, padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--hot)", color: "var(--hot)" }}>
                    BOF
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "40px 24px", borderTop: "1px solid var(--paper-08)", borderBottom: "1px solid var(--paper-08)", textAlign: "center", background: "var(--ink-2)" }}>
        <p className="mono" style={{ fontSize: "12px", color: "var(--paper-45)", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "24px" }}>
          TRUSTED BY DTC BRANDS, AGENCIES &amp; SOLOPRENEURS
        </p>
        <div style={{ display: "flex", gap: "48px", justifyContent: "center", flexWrap: "wrap" }}>
          {["Shopify Brands", "DTC Agencies", "Media Buyers", "Solopreneurs", "E-commerce Coaches"].map((label) => (
            <span key={label} style={{ color: "var(--paper)", fontWeight: 600, fontSize: "14px", opacity: 0.5 }}>
              {label}
            </span>
          ))}
        </div>
      </section>

      <section id="pricing" className="wrap" style={{ padding: "80px 24px" }}>
        <h2 className="display" style={{ textAlign: "center", fontSize: "clamp(28px, 4vw, 40px)", marginBottom: "12px" }}>
          Rate Card
        </h2>
        <p style={{ textAlign: "center", color: "var(--paper-45)", marginBottom: "48px", fontSize: "16px" }}>
          Start free. Scale when you&apos;re ready.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {(Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][]).map(([id, plan]) => {
            const popular = id === "pro";
            return (
              <div key={id} className={`rate-card card-hover${popular ? " featured" : ""}`}>
                {popular && <div className="rate-stamp">MOST BOOKED</div>}
                <div className="mono" style={{ fontSize: "12px", fontWeight: 700, color: "var(--paper-45)", marginBottom: "10px", letterSpacing: "0.08em" }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ marginBottom: "20px", display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span className="mono" style={{ fontSize: "40px", fontWeight: 700 }}>
                    ${plan.price}
                  </span>
                  <span style={{ color: "var(--paper-45)", fontSize: "14px" }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", marginBottom: "28px" }}>
                  {plan.features.map((feature) => (
                    <li key={feature} style={{ fontSize: "14px", color: "var(--paper-60)", padding: "6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--hot)" }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={popular ? "btn-hot" : "btn-outline"}
                  style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "15px", textDecoration: "none" }}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: "72px 24px", textAlign: "center", background: "var(--ink-2)", borderTop: "1px solid var(--paper-08)" }}>
        <h2 className="display" style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: "16px" }}>
          Ready to write ads that actually convert?
        </h2>
        <p style={{ color: "var(--paper-45)", marginBottom: "32px", fontSize: "16px" }}>
          Join the brands scaling their Meta ROAS with AI-powered copy.
        </p>
        <Link href="/signup" className="btn-hot" style={{ padding: "15px 36px", fontSize: "16px", textDecoration: "none", display: "inline-block" }}>
          Start Generating Free →
        </Link>
      </section>

      <footer style={{ padding: "32px 24px", borderTop: "1px solid var(--paper-08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.06em" }}>NOMAD CONSULTING</span>
        <p style={{ color: "var(--paper-30)", fontSize: "13px" }}>© {new Date().getFullYear()} Nomad Consulting. All rights reserved.</p>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy", "Terms", "Contact"].map((label) => (
            <a key={label} href="#" style={{ color: "var(--paper-30)", fontSize: "13px", textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
