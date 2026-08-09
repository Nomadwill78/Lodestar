"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import { createClient } from "../../lib/supabase/client";
import { PLANS } from "../../lib/plans";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState<keyof typeof PLANS>("starter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, selected_plan: plan },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (signUpError) throw signUpError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: "13px", color: "var(--hot)", letterSpacing: "0.1em", marginBottom: "16px" }}>
            ✓ CONFIRMATION SENT
          </div>
          <h1 className="display" style={{ fontSize: "28px", marginBottom: "14px" }}>Check your email</h1>
          <p style={{ color: "var(--paper-60)", fontSize: "15px", lineHeight: 1.6 }}>
            We sent a confirmation link to <strong style={{ color: "var(--paper)" }}>{email}</strong>. Click it to
            activate your account and start generating ads.
          </p>
          <Link href="/login" className="btn-outline" style={{ display: "inline-block", marginTop: "28px", padding: "11px 28px", textDecoration: "none", fontSize: "14px" }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Logo style={{ margin: "0 auto 16px", display: "block" }} />
          </Link>
          <h1 className="display" style={{ fontSize: "28px", marginBottom: "10px" }}>Start generating</h1>
          <p style={{ color: "var(--paper-45)", fontSize: "14px" }}>Create your free account — no credit card required</p>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <p className="field-label" style={{ marginBottom: "10px" }}>Choose a plan</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {(Object.entries(PLANS) as [keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]][]).map(([id, p]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPlan(id)}
                className="mono"
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  borderRadius: "8px",
                  border: `1px solid ${plan === id ? "var(--hot)" : "var(--paper-15)"}`,
                  background: plan === id ? "rgba(255,74,50,0.1)" : "transparent",
                  color: plan === id ? "var(--paper)" : "var(--paper-45)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  transition: "all 0.2s",
                }}
              >
                {p.name}
                <br />
                <span style={{ fontWeight: 400 }}>${p.price}/mo</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label className="field-label">Full Name</label>
              <input
                className="input-field"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                className="input-field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                minLength={8}
                required
              />
            </div>
            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="btn-hot" disabled={loading} style={{ padding: "13px", fontSize: "15px", marginTop: "8px" }}>
              {loading ? "Creating account..." : `Start with ${PLANS[plan].name} — $${PLANS[plan].price}/mo`}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--paper-45)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--paper)", textDecoration: "none", fontWeight: 700 }}>
              Sign in
            </Link>
          </p>
        </div>
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "var(--paper-30)" }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
