import React, { useState, useRef, useEffect } from "react";

// ============================================================
// Vega Onboarding Prototype — Lodestar
// Runs the intake conversation, then produces the Life Map JSON
// that maps field-for-field to the Supabase schema.
// ============================================================

const VEGA_SYSTEM = `You are Vega, the AI guide inside Lodestar, a manifestation platform for entrepreneurs. You are not a mystic or a hype machine. You are a sharp, warm strategist who fuses a high-performance coach with a cognitive scientist. You treat manifesting as a mechanism, not magic: clear goals train selective attention, morning priming shapes the day, implementation intentions drive follow-through, and self-efficacy is built from real evidence of past wins. You never claim the universe delivers things. A skeptical founder should never catch you saying something they can't believe.

Voice: direct, warm, economical. You sound like a person, not a wellness brochure. No filler. You challenge vague goals and copes kindly but clearly. No em dashes.

# THIS CONVERSATION: ONBOARDING INTAKE
This is the member's first conversation with you. By the end you produce their starting Life Map. Aim for 5 to 7 exchanges.

Sequence:
1. Open warm and direct. One line on who you are (a grounded guide, not a guru), then ask the first question.
2. Surface THE goal: the one outcome that, if it happened in the next 90 days, would change the most. Push past the first vague answer until it's specific and measurable.
3. Surface the WHY: what this goal would actually give them. Find the real one.
4. Surface the BLOCKER: what's stopped them so far. Listen for the limiting belief underneath.
5. Surface the EVIDENCE: one past win that proves they're capable of hard things. Get a real one.
6. Confirm their daily rhythm: when they want their morning brief and evening review.

Rules:
- One question per turn. Never stack questions.
- Reflect each answer back in one sharp sentence before moving on, so they feel heard.
- If an answer is vague, ask one follow-up, then move on. Don't interrogate.

When the intake is complete, your FINAL message must contain ONLY a JSON object wrapped in <lifemap></lifemap> tags and nothing else outside the tags. Before the final message, never output the tags. Shape:
<lifemap>
{
  "northStar": "their 90-day goal, specific and measurable",
  "why": "the real underlying motivation",
  "primaryBlocker": "the practical obstacle",
  "limitingBelief": "the belief underneath the blocker, in their own framing",
  "anchorEvidence": "the past win to reuse in affirmations",
  "firstAction": "the single smallest action they can take in the next 24 hours",
  "ritualTimes": { "morning": "HH:MM", "evening": "HH:MM" }
}
</lifemap>`;

const palette = {
  night: "#0B1026",
  deep: "#141B3C",
  star: "#E8B04B",
  starSoft: "rgba(232,176,75,0.12)",
  ink: "#EDEFF7",
  muted: "#8A93B8",
  line: "rgba(138,147,184,0.18)",
};

export default function VegaOnboarding() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [lifeMap, setLifeMap] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, lifeMap]);

  async function callVega(history) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: VEGA_SYSTEM,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    return data.content.map((b) => (b.type === "text" ? b.text : "")).filter(Boolean).join("\n");
  }

  function extractLifeMap(text) {
    const match = text.match(/<lifemap>([\s\S]*?)<\/lifemap>/);
    if (!match) return null;
    try {
      return JSON.parse(match[1].trim());
    } catch {
      return null;
    }
  }

  async function send(content) {
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await callVega(next);
      const map = extractLifeMap(reply);
      if (map) {
        setLifeMap(map);
        setMessages([...next, { role: "assistant", content: "Your Life Map is ready. Here's what I heard." }]);
      } else {
        setMessages([...next, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Something interrupted us. Try that again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function begin() {
    setStarted(true);
    setLoading(true);
    try {
      const reply = await callVega([{ role: "user", content: "Begin the onboarding." }]);
      setMessages([{ role: "assistant", content: reply }]);
    } catch {
      setMessages([{ role: "assistant", content: "Something interrupted us. Refresh to start again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey && input.trim() && !loading && !lifeMap) {
      e.preventDefault();
      send(input.trim());
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: `radial-gradient(120% 80% at 50% -10%, ${palette.deep} 0%, ${palette.night} 55%)`,
      color: palette.ink, fontFamily: "'Inter', system-ui, sans-serif", display: "flex",
      flexDirection: "column", alignItems: "center", padding: "0 16px",
    }}>
      <Header />
      <div ref={scrollRef} style={{
        width: "100%", maxWidth: 620, flex: 1, overflowY: "auto",
        padding: "8px 4px 140px", maxHeight: "calc(100vh - 92px)",
      }}>
        {!started && <Intro onBegin={begin} />}
        {messages.map((m, i) => <Bubble key={i} role={m.role} text={m.content} />)}
        {loading && <Thinking />}
        {lifeMap && <LifeMapCard map={lifeMap} />}
      </div>

      {started && !lifeMap && (
        <Composer input={input} setInput={setInput} onKey={handleKey} loading={loading}
          onSend={() => input.trim() && !loading && send(input.trim())} />
      )}
    </div>
  );
}

function Header() {
  return (
    <div style={{
      width: "100%", maxWidth: 620, padding: "22px 4px 14px", display: "flex",
      alignItems: "center", gap: 12, borderBottom: `1px solid ${palette.line}`,
    }}>
      <Star size={20} />
      <div style={{ fontWeight: 700, letterSpacing: "0.5px", fontSize: 17 }}>LODESTAR</div>
      <div style={{ marginLeft: "auto", color: palette.muted, fontSize: 13, letterSpacing: "1.5px" }}>INTAKE</div>
    </div>
  );
}

function Intro({ onBegin }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 16px 40px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}><Star size={46} glow /></div>
      <h1 style={{
        fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 34,
        lineHeight: 1.15, margin: "0 0 16px",
      }}>
        Let's find your<br />north star.
      </h1>
      <p style={{ color: palette.muted, fontSize: 16, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 32px" }}>
        A few questions. By the end, you'll have one clear goal, the belief in your way, and the first move to make tomorrow.
      </p>
      <button onClick={onBegin} style={btn()}>Talk to Vega</button>
    </div>
  );
}

function Bubble({ role, text }) {
  const me = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", margin: "14px 0" }}>
      {!me && <div style={{ marginRight: 10, marginTop: 2 }}><Star size={16} /></div>}
      <div style={{
        maxWidth: "78%", padding: "12px 16px", borderRadius: me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: me ? palette.star : "rgba(255,255,255,0.04)",
        color: me ? palette.night : palette.ink,
        border: me ? "none" : `1px solid ${palette.line}`,
        fontSize: 15.5, lineHeight: 1.55, whiteSpace: "pre-wrap", fontWeight: me ? 500 : 400,
      }}>{text}</div>
    </div>
  );
}

function Thinking() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
      <Star size={16} />
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: palette.muted,
            animation: `vpulse 1.2s ${i * 0.2}s infinite ease-in-out`,
          }} />
        ))}
      </div>
      <style>{`@keyframes vpulse{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}`}</style>
    </div>
  );
}

function LifeMapCard({ map }) {
  const rows = [
    ["North Star", map.northStar],
    ["Why it matters", map.why],
    ["The blocker", map.primaryBlocker],
    ["Belief in the way", map.limitingBelief],
    ["Your evidence", map.anchorEvidence],
    ["First move (24h)", map.firstAction],
  ];
  return (
    <div style={{
      marginTop: 24, border: `1px solid ${palette.star}`, borderRadius: 18,
      background: palette.starSoft, padding: "24px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <Star size={20} glow />
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 600 }}>Your Life Map</div>
      </div>
      {rows.map(([label, val]) => (
        <div key={label} style={{ padding: "12px 0", borderTop: `1px solid ${palette.line}` }}>
          <div style={{ color: palette.star, fontSize: 11.5, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
          <div style={{ fontSize: 15.5, lineHeight: 1.5 }}>{val}</div>
        </div>
      ))}
      <div style={{ padding: "12px 0 0", borderTop: `1px solid ${palette.line}`, marginTop: 4, display: "flex", gap: 24 }}>
        <div>
          <div style={{ color: palette.star, fontSize: 11.5, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 5 }}>Morning brief</div>
          <div style={{ fontSize: 15.5 }}>{map.ritualTimes?.morning}</div>
        </div>
        <div>
          <div style={{ color: palette.star, fontSize: 11.5, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 5 }}>Evening review</div>
          <div style={{ fontSize: 15.5 }}>{map.ritualTimes?.evening}</div>
        </div>
      </div>
      <div style={{ marginTop: 20, fontSize: 13, color: palette.muted, lineHeight: 1.5 }}>
        This writes to <code style={{ color: palette.ink }}>life_maps</code>, <code style={{ color: palette.ink }}>goals</code>, and <code style={{ color: palette.ink }}>blockers</code>. The first move becomes a <code style={{ color: palette.ink }}>log_entries</code> row.
      </div>
    </div>
  );
}

function Composer({ input, setInput, onKey, onSend, loading }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center",
      padding: "16px", background: `linear-gradient(transparent, ${palette.night} 30%)`,
    }}>
      <div style={{ width: "100%", maxWidth: 620, display: "flex", gap: 10 }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
          placeholder="Type your answer..." rows={1} style={{
            flex: 1, resize: "none", background: "rgba(255,255,255,0.05)", color: palette.ink,
            border: `1px solid ${palette.line}`, borderRadius: 14, padding: "14px 16px",
            fontSize: 15.5, fontFamily: "inherit", outline: "none",
          }} />
        <button onClick={onSend} disabled={loading || !input.trim()} style={{
          ...btn(), padding: "0 20px", opacity: loading || !input.trim() ? 0.5 : 1,
        }}>Send</button>
      </div>
    </div>
  );
}

function Star({ size = 20, glow = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={glow ? { filter: `drop-shadow(0 0 10px ${palette.star})` } : {}}>
      <path d="M12 1.5 L13.8 9.2 L21.5 12 L13.8 14.8 L12 22.5 L10.2 14.8 L2.5 12 L10.2 9.2 Z"
        fill={palette.star} />
    </svg>
  );
}

function btn() {
  return {
    background: palette.star, color: palette.night, border: "none", borderRadius: 14,
    padding: "14px 28px", fontSize: 15.5, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", letterSpacing: "0.2px",
  };
}
