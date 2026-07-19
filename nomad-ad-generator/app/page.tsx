import Link from "next/link";
import Logo from "./components/Logo";
import { PLANS } from "../lib/plans";

const featurePills = [
  "🎯 TOF / MOF / BOF Targeting",
  "✍️ 3 Copy Variants Per Generation",
  "📋 One-Click Copy",
  "📚 Full Generation History",
  "⚡ Results in Under 10 Seconds",
  "🔥 DTC & Shopify Optimized",
];

const steps = [
  {
    n: "01",
    title: "Describe Your Product",
    body: "Tell us what you're selling, who it's for, and the tone you want. The more detail, the better the output.",
  },
  {
    n: "02",
    title: "Pick Your Funnel Stage",
    body: "TOF for cold audiences, MOF for warm retargeting, BOF for people ready to buy. Each gets a completely different strategy.",
  },
  {
    n: "03",
    title: "Get 3 Winning Variants",
    body: "Claude generates 3 distinct ad copy options using different hook styles, angles, and CTAs — ready to test immediately.",
  },
];

export default function Home() {
  return (
    <div style={{ background: "var(--navy)", minHeight: "100vh", color: "var(--white)" }}>
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(27,42,74,0.97)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Logo size={36} />
          <div>
            <div style={{ fontWeight: 800, fontSize: "15px", letterSpacing: "0.04em" }}>NOMAD</div>
            <div style={{ fontWeight: 400, fontSize: "11px", letterSpacing: "0.12em", opacity: 0.6, marginTop: "-2px" }}>
              CONSULTING
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/login" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 700,
              background: "var(--white)",
              color: "var(--navy)",
              textDecoration: "none",
            }}
          >
            Start Free
          </Link>
        </div>
      </nav>

      <section style={{ padding: "80px 24px 60px", textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--white)",
            marginBottom: "24px",
            letterSpacing: "0.04em",
          }}
        >
          AI-Powered Meta Ad Copy
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.1, marginBottom: "24px" }}>
          Stop the Scroll.
          <br />
          Start Converting.
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.7,
            maxWidth: "580px",
            margin: "0 auto 40px",
          }}
        >
          Generate scroll-stopping Facebook &amp; Instagram ad copy for every stage of your funnel — in seconds. Built on
          $50M+ in Meta ad expertise.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/signup"
            style={{
              padding: "14px 32px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 700,
              background: "var(--white)",
              color: "var(--navy)",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Generate Your First Ad →
          </Link>
          <a
            href="#pricing"
            style={{
              padding: "14px 32px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.3)",
              color: "var(--white)",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            See Pricing
          </a>
        </div>
        <p style={{ marginTop: "16px", fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
          No credit card required · Cancel anytime
        </p>
      </section>

      <section style={{ padding: "0 24px 64px", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          {featurePills.map((pill) => (
            <div
              key={pill}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>How It Works</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: "48px", fontSize: "16px" }}>
          From blank page to high-converting ad copy in 3 steps
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {steps.map((step) => (
            <div key={step.n} className="card" style={{ padding: "28px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  marginBottom: "12px",
                }}
              >
                {step.n}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>{step.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: 1.6 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "40px 24px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
          background: "var(--navy-light)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          TRUSTED BY DTC BRANDS, AGENCIES &amp; SOLOPRENEURS
        </p>
        <div style={{ display: "flex", gap: "48px", justifyContent: "center", flexWrap: "wrap" }}>
          {["Shopify Brands", "DTC Agencies", "Media Buyers", "Solopreneurs", "E-commerce Coaches"].map((label) => (
            <span key={label} style={{ color: "var(--white)", fontWeight: 600, fontSize: "14px", opacity: 0.5 }}>
              {label}
            </span>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ padding: "80px 24px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
          Simple, Transparent Pricing
        </h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: "48px", fontSize: "16px" }}>
          Start free. Scale when you&apos;re ready.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {(Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][]).map(([id, plan]) => {
            const popular = id === "pro";
            return (
              <div
                key={id}
                className="card card-hover"
                style={{
                  padding: "32px",
                  ...(popular ? { border: "1px solid rgba(255,255,255,0.5)", position: "relative" as const } : {}),
                }}
              >
                {popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--white)",
                      color: "var(--navy)",
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 14px",
                      borderRadius: "999px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "8px",
                    letterSpacing: "0.08em",
                  }}
                >
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "42px", fontWeight: 800 }}>${plan.price}</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", marginBottom: "28px" }}>
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      style={{
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.65)",
                        padding: "6px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "var(--white)", opacity: 0.8 }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "15px",
                    textDecoration: "none",
                    ...(popular
                      ? { background: "var(--white)", color: "var(--navy)" }
                      : { border: "1px solid rgba(255,255,255,0.3)", color: "var(--white)" }),
                  }}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section
        style={{
          padding: "64px 24px",
          textAlign: "center",
          background: "var(--navy-light)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          Ready to write ads that actually convert?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "32px", fontSize: "16px" }}>
          Join the brands scaling their Meta ROAS with AI-powered copy.
        </p>
        <Link
          href="/signup"
          style={{
            padding: "14px 36px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 700,
            background: "var(--white)",
            color: "var(--navy)",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Start Generating Free →
        </Link>
      </section>

      <footer
        style={{
          padding: "32px 24px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.06em" }}>NOMAD CONSULTING</span>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          © {new Date().getFullYear()} Nomad Consulting. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy", "Terms", "Contact"].map((label) => (
            <a key={label} href="#" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
