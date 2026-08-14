"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";
import { createClient } from "../../lib/supabase/client";
import { PLANS, generationLimit, type PlanId } from "../../lib/plans";
import { scanPolicyRisk, variantText } from "../../lib/policy-check";
import { PLACEMENTS, type PlacementId } from "../../lib/placements";
import { buildAdNaming } from "../../lib/ad-naming";

interface CreativeDirection {
  shot_type: string;
  on_screen_text: string;
  font_style: string;
  mood: string;
}

interface Variant {
  hook_style: string;
  headline: string;
  primary_text: string;
  description: string;
  cta: string;
  placements?: { placement: PlacementId; headline: string }[];
  creative_direction?: CreativeDirection;
}

interface Generation {
  id: string;
  product: string;
  audience: string | null;
  stage: string;
  tone: string;
  variants: Variant[];
  created_at: string;
  winner_index: number | null;
}

function PolicyRiskRow({ variant }: { variant: Variant }) {
  const flags = scanPolicyRisk(variantText(variant));
  if (flags.length === 0) {
    return <div className="risk-row risk-clear">✓ No obvious policy flags</div>;
  }
  return (
    <div className="risk-row">
      {flags.map((f) => (
        <span key={f.category} className="risk-pill" title={`Matched: "${f.match}"`}>
          ⚠ {f.label}
        </span>
      ))}
    </div>
  );
}

function WinnerControl({
  generationId,
  index,
  winnerIndex,
  onMark,
}: {
  generationId: string;
  index: number;
  winnerIndex: number | null;
  onMark: (generationId: string, index: number | null) => void;
}) {
  const isWinner = winnerIndex === index;
  return (
    <button
      className={isWinner ? "btn-hot" : "btn-outline"}
      style={{ padding: "5px 12px", fontSize: "12px" }}
      onClick={() => onMark(generationId, isWinner ? null : index)}
      title={isWinner ? "Marked as the winner in real testing — click to unmark" : "Mark this as the variant that actually won when you tested it"}
    >
      {isWinner ? "★ Winner" : "Mark winner"}
    </button>
  );
}

function CreativeDirectionBlock({ variant }: { variant: Variant }) {
  const cd = variant.creative_direction;
  if (!cd) return null;
  const rows: { label: string; value: string }[] = [
    { label: "Shot", value: cd.shot_type },
    { label: "On-screen text", value: cd.on_screen_text },
    { label: "Font", value: cd.font_style },
    { label: "Mood", value: cd.mood },
  ];
  return (
    <div style={{ marginTop: "14px", padding: "14px 16px", borderRadius: "8px", background: "var(--ink-3)", border: "1px solid var(--paper-15)" }}>
      <div className="mono" style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--paper-45)", marginBottom: "10px" }}>
        Creative direction
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: "flex", gap: "10px" }}>
            <span className="mono" style={{ fontSize: "11px", color: "var(--paper-45)", width: "104px", flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {row.label}
            </span>
            <span style={{ flex: 1, fontSize: "13px", color: "var(--paper)", lineHeight: 1.5 }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlacementHeadlines({
  variant,
  copiedKey,
  onCopy,
}: {
  variant: Variant;
  copiedKey: string;
  onCopy: (text: string, key: string) => void;
}) {
  if (!variant.placements || variant.placements.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--paper-15)" }}>
      <span className="mono" style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--paper-45)" }}>
        Headlines by placement
      </span>
      {PLACEMENTS.map((spec) => {
        const entry = variant.placements!.find((p) => p.placement === spec.id);
        if (!entry) return null;
        const key = `${variant.headline}-${spec.id}`;
        const over = entry.headline.length > spec.maxLength;
        return (
          <div key={spec.id} style={{ display: "flex", alignItems: "center", gap: "10px" }} title={spec.helper}>
            <span className="mono" style={{ fontSize: "11px", color: "var(--paper-45)", width: "104px", flexShrink: 0 }}>
              {spec.label}
            </span>
            <span style={{ flex: 1, fontSize: "14px", color: "var(--paper)" }}>{entry.headline}</span>
            <span className="mono" style={{ fontSize: "11px", color: over ? "var(--hot)" : "var(--paper-30)", flexShrink: 0 }}>
              {entry.headline.length}/{spec.maxLength}
            </span>
            <button
              className="btn-outline"
              style={{ padding: "3px 9px", fontSize: "11px", flexShrink: 0 }}
              onClick={() => onCopy(entry.headline, key)}
            >
              {copiedKey === key ? "Copied ✓" : "Copy"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function AdNamingBlock({
  product,
  audience,
  tone,
  stage,
  variant,
  variantIndex,
  date,
  copiedKey,
  onCopy,
}: {
  product: string;
  audience: string;
  tone: string;
  stage: string;
  variant: Variant;
  variantIndex: number;
  date: Date;
  copiedKey: string;
  onCopy: (text: string, key: string) => void;
}) {
  const naming = buildAdNaming({
    product,
    audience,
    tone,
    stage,
    hookStyle: variant.hook_style,
    variantIndex,
    date,
  });
  const rowId = `${variant.headline}-naming`;
  const rows: { label: string; value: string }[] = [
    { label: "Campaign", value: naming.campaignName },
    { label: "Ad set", value: naming.adSetName },
    { label: "Ad", value: naming.adName },
    { label: "UTM", value: naming.utmQuery },
  ];
  return (
    <details className="extra-block">
      <summary className="extra-summary">Campaign naming &amp; UTM</summary>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
        {rows.map((row) => {
          const key = `${rowId}-${row.label}`;
          return (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="mono" style={{ fontSize: "11px", color: "var(--paper-45)", width: "76px", flexShrink: 0 }}>
                {row.label}
              </span>
              <span className="mono" style={{ flex: 1, fontSize: "12px", color: "var(--paper)", overflowX: "auto", whiteSpace: "nowrap" }}>
                {row.value}
              </span>
              <button
                className="btn-outline"
                style={{ padding: "3px 9px", fontSize: "11px", flexShrink: 0 }}
                onClick={() => onCopy(row.value, key)}
              >
                {copiedKey === key ? "Copied ✓" : "Copy"}
              </button>
            </div>
          );
        })}
      </div>
    </details>
  );
}

const TONES = ["Bold & punchy", "Friendly & casual", "Professional", "Luxury & premium", "Urgent / FOMO"];
const STAGES: { id: string; label: string; heat: "cold" | "warm" | "hot" }[] = [
  { id: "TOF", label: "TOF · Cold", heat: "cold" },
  { id: "MOF", label: "MOF · Warm", heat: "warm" },
  { id: "BOF", label: "BOF · Hot", heat: "hot" },
];

export default function DashboardPage() {
  const router = useRouter();
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
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState<number | null>(null);

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
      .select("id, product, audience, stage, tone, variants, created_at, winner_index")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory((rows as Generation[]) ?? []);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      await refresh();
    };
    void loadDashboard();
  }, [refresh]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsUpgrade(false);
    setLoading(true);
    setVariants([]);
    setCurrentGenerationId(null);
    setCurrentWinnerIndex(null);
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
      setCurrentGenerationId(data.generationId ?? null);
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

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }

  async function markWinner(generationId: string, index: number | null) {
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("set_generation_winner", {
      p_generation_id: generationId,
      p_winner_index: index,
    });
    if (rpcError) {
      setError("Couldn't save that. Try again.");
      return;
    }
    if (generationId === currentGenerationId) {
      setCurrentWinnerIndex(index);
    }
    setHistory((prev) => prev.map((g) => (g.id === generationId ? { ...g, winner_index: index } : g)));
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
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setUpgrading("");
    }
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/");
  }

  const limit = generationLimit(plan);
  const usageLabel = limit === -1 ? `${usedThisMonth} generations this month` : `${usedThisMonth} of ${limit} generations used this month`;

  return (
    <div className="shell">
      <nav className="nav">
        <Link href="/" className="nav-brand">
          <Logo size={32} />
          <span className="nav-word">NOMAD CONSULTING</span>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span className="mono" style={{ fontSize: "12px", color: "var(--paper-45)" }}>
            {plan === "free" ? "Free plan" : `${PLANS[plan as keyof typeof PLANS]?.name ?? plan} plan`} · {usageLabel}
          </span>
          <button className="btn-outline" onClick={signOut} style={{ padding: "8px 16px", fontSize: "13px" }}>
            Sign out
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 className="display" style={{ fontSize: "30px", marginBottom: "8px" }}>Generate ad copy</h1>
        <p style={{ color: "var(--paper-45)", fontSize: "14px", marginBottom: "28px" }}>
          Describe your offer, pick a funnel stage, and get 3 ready-to-test variants.
        </p>

        <div className="card" style={{ padding: "28px", marginBottom: "32px" }}>
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="field-label">What are you selling?</label>
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
              <label className="field-label">Target audience (optional)</label>
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
                <label className="field-label">Tone</label>
                <select className="input-field" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Funnel stage</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      data-heat={s.heat}
                      className={`stage-btn${stage === s.id ? " active" : ""}`}
                      onClick={() => setStage(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="btn-hot" disabled={loading} style={{ padding: "13px", fontSize: "15px" }}>
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
                      <span className="mono" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--paper-45)" }}>
                        VARIANT {i + 1} · {v.hook_style.toUpperCase()}
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {currentGenerationId && (
                          <WinnerControl generationId={currentGenerationId} index={i} winnerIndex={currentWinnerIndex} onMark={markWinner} />
                        )}
                        <button className="btn-outline" style={{ padding: "5px 12px", fontSize: "12px" }} onClick={() => copyVariant(v, key)}>
                          {copiedKey === key ? "Copied ✓" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <p style={{ fontWeight: 700, color: "var(--paper)", marginBottom: "8px" }}>{v.headline}</p>
                    <p style={{ marginBottom: "8px" }}>{v.primary_text}</p>
                    <p style={{ fontSize: "13px", color: "var(--paper-45)" }}>
                      {v.description} · CTA: <strong>{v.cta}</strong>
                    </p>
                    <CreativeDirectionBlock variant={v} />
                    <PolicyRiskRow variant={v} />
                    <PlacementHeadlines variant={v} copiedKey={copiedKey} onCopy={copyText} />
                    <AdNamingBlock
                      product={product}
                      audience={audience}
                      tone={tone}
                      stage={stage}
                      variant={v}
                      variantIndex={i + 1}
                      date={new Date()}
                      copiedKey={copiedKey}
                      onCopy={copyText}
                    />
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
                  <div className="mono" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--paper-45)", marginBottom: "6px" }}>
                    {p.name.toUpperCase()}
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <span className="mono" style={{ fontSize: "26px", fontWeight: 700 }}>${p.price}</span>
                    <span style={{ color: "var(--paper-45)", fontSize: "13px" }}>/mo</span>
                  </div>
                  <button
                    className="btn-hot"
                    disabled={upgrading === id}
                    onClick={() => upgrade(id)}
                    style={{ width: "100%", padding: "10px", fontSize: "13px" }}
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
                      {g.winner_index !== null && <span style={{ color: "var(--hot)" }}>★ </span>}
                      {g.product}
                    </span>
                    <span className="mono" style={{ fontSize: "12px", color: "var(--paper-30)" }}>
                      {g.stage} · {new Date(g.created_at).toLocaleDateString()}
                    </span>
                  </summary>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                    {(g.variants ?? []).map((v, i) => {
                      const key = `${g.id}-${i}`;
                      return (
                        <div key={key} className="copy-block">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span className="mono" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--paper-45)" }}>
                              VARIANT {i + 1}
                            </span>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <WinnerControl generationId={g.id} index={i} winnerIndex={g.winner_index} onMark={markWinner} />
                              <button className="btn-outline" style={{ padding: "4px 10px", fontSize: "12px" }} onClick={() => copyVariant(v, key)}>
                                {copiedKey === key ? "Copied ✓" : "Copy"}
                              </button>
                            </div>
                          </div>
                          <p style={{ fontWeight: 700, color: "var(--paper)", marginBottom: "6px" }}>{v.headline}</p>
                          <p>{v.primary_text}</p>
                          <CreativeDirectionBlock variant={v} />
                          <PolicyRiskRow variant={v} />
                          <PlacementHeadlines variant={v} copiedKey={copiedKey} onCopy={copyText} />
                          <AdNamingBlock
                            product={g.product}
                            audience={g.audience ?? ""}
                            tone={g.tone}
                            stage={g.stage}
                            variant={v}
                            variantIndex={i + 1}
                            date={new Date(g.created_at)}
                            copiedKey={copiedKey}
                            onCopy={copyText}
                          />
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
