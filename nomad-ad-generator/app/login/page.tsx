"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import { createClient } from "../../lib/supabase/client";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.5)",
  marginBottom: "6px",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your email and password.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--navy)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Logo style={{ margin: "0 auto 16px", display: "block" }} />
          </Link>
          <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "6px" }}>Welcome back</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Sign in to your Nomad Consulting account</p>
        </div>
        <div className="card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Email</label>
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
              <label style={labelStyle}>Password</label>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#fca5a5",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn-gold"
              disabled={loading}
              style={{ padding: "13px", borderRadius: "9px", fontSize: "15px", marginTop: "4px" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--white)", textDecoration: "none", fontWeight: 700 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
