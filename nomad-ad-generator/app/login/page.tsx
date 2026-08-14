"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your email and password.");
      setLoading(false);
    }
  }

  return (
    <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Logo style={{ margin: "0 auto 16px", display: "block" }} />
          </Link>
          <h1 className="display" style={{ fontSize: "28px", marginBottom: "10px" }}>Welcome back</h1>
          <p style={{ color: "var(--paper-45)", fontSize: "14px" }}>Sign in to your Nomad Consulting account</p>
        </div>
        <div className="card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                placeholder="••••••••"
                required
              />
            </div>
            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="btn-hot" disabled={loading} style={{ padding: "13px", fontSize: "15px", marginTop: "4px" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--paper-45)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--paper)", textDecoration: "none", fontWeight: 700 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
