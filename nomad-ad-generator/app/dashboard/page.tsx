"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import { createClient } from "../../lib/supabase/client";
import { PLANS, generationLimit, type PlanId } from "../../lib/plans";

interface Variant {
  hook_style: string;
  headline: string;
  primary_text: string;
  description: string;
  cta: string;
}

interface Generation {
  id: string;
  product: string;
  stage: string;
  tone: string;
  variants: Variant[];
  created_at: string;
}

const TONES = ["Bold & punchy", "Friendly & casual", "Professional", "Luxury & premium", "Urgent / FOMO"];
const STAGES = [
  { id: "TOF", label: "TOF · Cold" },
  { id: "MOF", label: "MOF · Warm" },
  { id: "BOF", label: "BOF · Hot" },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.5)",
  marginBottom: "6px",
};

export default function DashboardPage() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [stage, setStage] = useState("TOF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [copiedKey, setCopiedKey] = useState("");
  const [plan, setPlan] = useState<PlanId>("free");
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [history, setHistory] = useState<Generation[]>([]);
  const [upgrading, setUpgrading] = useState("");

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    if (profile?.plan) setPlan(profile.plan as PlanId);

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString());
    setUsedThisMonth(count ?? 0);

    const { data: rows } = await supabase
      .from("generations")
      .select("id, product, stage, tone, variants, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory((rows as Generation[]) ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsUpgrade(false);
    setLoading(true);
    setVariants([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, audience, tone, stage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNeedsUpgrade(Boolean(data.upgrade));
        throw new Error(data.error || "Generation failed. Please try again.");
      }
      setVariants(data.variants);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyVariant(v: Variant, key: string) {
    await navigator.clipboard.writeText(`${v.headline}\n\n${v.primary_text}\n\n${v.description}\nCTA: ${v.cta}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }

  async function upgrade(planId: string) {
    setUpgrading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setUpgrading("");
    }
  }

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  const limit = generationLimit(plan);
  const usageLabel = limit === -1 ? `${usedThisMonth} generations this month` : `${usedThisMonth} of ${limit} generations used this month`;

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
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <Logo size={32} />
          <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "0.04em" }}>NOMAD CONSULTING</span>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
            {plan === "free" ? "Free plan" : `${PLANS[plan as keyof typeof PLANS]?.name ?? plan} plan`} · {usageLabel}
          </span>
          <button className="btn-outline" onClick={signOut} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px" }}>
            Sign out
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>Generate ad copy</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "28px" }}>
          Describe your offer, pick a funnel stage, and get 3 ready-to-test variants.
        </p>

        <div className="card" style={{ padding: "28px", marginBottom: "32px" }}>
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>What are you selling?</label>
              <textarea
                className="input-field"
                rows={3}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. A cold-brew coffee subscription that ships fresh every week, $24/mo, first box free"
                required
                style={{ resize: "vertical" }}
              />
            </div>
            <div>
              <label style={labelStyle}>Target audience (optional)</label>
              <input
                className="input-field"
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Busy professionals 25-40 who already buy specialty coffee"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Tone</label>
                <select className="input-field" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Funnel stage</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`stage-btn${stage === s.id ? " active" : ""}`}
                      onClick={() => setStage(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
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
            <button type="submit" className="btn-gold" disabled={loading} style={{ padding: "13px", borderRadius: "9px", fontSize: "15px" }}>
              {loading ? "Generating…" : "Generate 3 Variants"}
            </button>
          </form>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="shimmer" style={{ height: "120px", borderRadius: "10px" }} />
            ))}
          </div>
        )}

        {variants.length > 0 && (
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>Your variants</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {variants.map((v, i) => {
                const key = `current-${i}`;
                return (
                  <div key={key} className="copy-block fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>
                        VARIANT {i + 1} · {v.hook_style.toUpperCase()}
                      </span>
                      <button className="btn-outline" style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "12px" }} onClick={() => copyVariant(v, key)}>
                        {copiedKey === key ? "Copied ✓" : "Copy"}
                      </button>
                    </div>
                    <p style={{ fontWeight: 700, color: "var(--white)", marginBottom: "8px" }}>{v.headline}</p>
                    <p style={{ marginBottom: "8px" }}>{v.primary_text}</p>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
                      {v.description} · CTA: <strong>{v.cta}</strong>
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(needsUpgrade || plan === "free") && (
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
              {needsUpgrade ? "Upgrade to keep generating" : "Upgrade your plan"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              {(Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][]).map(([id, p]) => (
                <div key={id} className="card" style={{ padding: "20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                    {p.name.toUpperCase()}
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <span style={{ fontSize: "26px", fontWeight: 800 }}>${p.price}</span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>/mo</span>
                  </div>
                  <button
                    className="btn-gold"
                    disabled={upgrading === id}
                    onClick={() => upgrade(id)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", fontSize: "13px" }}
                  >
                    {upgrading === id ? "Redirecting…" : `Get ${p.name}`}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {history.length > 0 && (
          <section>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>Recent generations</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {history.map((g) => (
                <details key={g.id} className="card" style={{ padding: "16px 20px" }}>
                  <summary style={{ cursor: "pointer", fontSize: "14px", display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {g.product}
                    </span>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      {g.stage} · {new Date(g.created_at).toLocaleDateString()}
                    </span>
                  </summary>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                    {(g.variants ?? []).map((v, i) => {
                      const key = `${g.id}-${i}`;
                      return (
                        <div key={key} className="copy-block">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>
                              VARIANT {i + 1}
                            </span>
                            <button className="btn-outline" style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px" }} onClick={() => copyVariant(v, key)}>
                              {copiedKey === key ? "Copied ✓" : "Copy"}
                            </button>
                          </div>
                          <p style={{ fontWeight: 700, color: "var(--white)", marginBottom: "6px" }}>{v.headline}</p>
                          <p>{v.primary_text}</p>
                        </div>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
