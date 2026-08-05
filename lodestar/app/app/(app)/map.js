// ============================================================
// Life Map dashboard. The member's stable identity made visible:
// north star, the goals moving under it, the blockers in the way,
// momentum from their own evidence, and the patterns Vega has
// surfaced. Read-only and AI-free. Every select is RLS-scoped, so
// Supabase only ever returns this member's rows.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { supabase } from "../../lib/supabaseClient";
import VegaEmptyState from "../../lib/VegaEmptyState";
import Paywall from "../../lib/Paywall";
import { useTier } from "../../lib/useTier";

import { theme as C } from "../../lib/theme";
const MOMENTUM_DAYS = 14;

export default function MapScreen() {
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [goals, setGoals] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const { isFree } = useTier();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    // The one active life map anchors everything below it.
    const { data: lifeMap } = await supabase
      .from("life_maps")
      .select("id, north_star, why, vision, anchor_evidence, limiting_belief")
      .eq("status", "active")
      .maybeSingle();
    setMap(lifeMap ?? null);

    if (lifeMap) {
      const sinceIso = new Date(Date.now() - MOMENTUM_DAYS * 86400000).toISOString();
      const [g, b, l, p] = await Promise.all([
        supabase.from("goals")
          .select("id, title, metric, current_value, target_date, status")
          .eq("life_map_id", lifeMap.id).eq("status", "active")
          .order("created_at", { ascending: true }),
        supabase.from("blockers")
          .select("id, practical_obstacle, underlying_belief")
          .eq("life_map_id", lifeMap.id).eq("status", "active")
          .order("created_at", { ascending: true }),
        supabase.from("log_entries")
          .select("id, type, created_at")
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false }),
        supabase.from("patterns")
          .select("id, observation, category, evidence_count")
          .eq("active", true)
          .order("last_seen", { ascending: false }),
      ]);
      setGoals(g.data ?? []);
      setBlockers(b.data ?? []);
      setLogs(l.data ?? []);
      setPatterns(p.data ?? []);
    } else {
      setGoals([]); setBlockers([]); setLogs([]); setPatterns([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && !map) {
    return (
      <View style={{ flex: 1, backgroundColor: C.night, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={C.star} />
      </View>
    );
  }

  // A map that exists but has no activity yet (just onboarded): show a warm
  // welcome instead of a wall of empty sections.
  const isFresh = !!map && goals.length === 0 && blockers.length === 0 && patterns.length === 0 && logs.length === 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.night }}
      contentContainerStyle={{ padding: 22, paddingTop: 64, paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={C.star} />}>

      <Text style={{ color: C.muted, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase" }}>Your Life Map</Text>

      {!map ? (
        <VegaEmptyState
          title="Your map starts here"
          message="Once you set your north star with Vega, this is where it lives and grows."
        />
      ) : (
        <>
          {/* North star hero */}
          <View style={{ borderWidth: 1, borderColor: C.star, backgroundColor: C.starSoft, borderRadius: 18, padding: 22, marginTop: 14 }}>
            <Text style={{ color: C.star, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>North star</Text>
            <Text style={{ color: C.ink, fontSize: 23, fontWeight: "600", lineHeight: 31 }}>{map.north_star}</Text>
            {map.why ? (
              <Text style={{ color: C.muted, fontSize: 15, lineHeight: 23, marginTop: 14 }}>{map.why}</Text>
            ) : null}
          </View>

          {isFresh ? (
            <VegaEmptyState
              title="The map is set. Now we fill it in."
              message="As you log wins, set goals, and talk things through, your momentum and the patterns underneath show up right here."
            />
          ) : (
            <>
              <Momentum logs={logs} />

              <Section title="Goals">
                {goals.length === 0
                  ? <Empty text="No active goals yet. Vega will help you set the first." />
                  : goals.map((g) => <GoalCard key={g.id} goal={g} />)}
              </Section>

              <Section title="Blockers">
                {blockers.length === 0
                  ? <Empty text="Nothing in the way right now." />
                  : blockers.map((b) => <BlockerCard key={b.id} blocker={b} />)}
              </Section>

              <Section title="Patterns Vega sees">
                {patterns.length === 0
                  ? <Empty text="As you log, Vega surfaces the patterns underneath." />
                  : patterns.map((p) => <PatternCard key={p.id} pattern={p} />)}
              </Section>
            </>
          )}

          {isFree ? (
            <Pressable onPress={() => setPaywallOpen(true)}
              style={{ marginTop: 30, borderWidth: 1, borderColor: C.star, backgroundColor: C.starSoft, borderRadius: 16, padding: 18 }}>
              <Text style={{ color: C.star, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Aligned</Text>
              <Text style={{ color: C.ink, fontSize: 16, lineHeight: 23 }}>
                Unlock unlimited reframes, the evening review, and pattern detection.
              </Text>
              <Text style={{ color: C.star, fontSize: 14, fontWeight: "600", marginTop: 10 }}>See upgrade options</Text>
            </Pressable>
          ) : null}
        </>
      )}

      <Paywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </ScrollView>
  );
}

// ---- Momentum: a 14-day view of evidence over time ----
function Momentum({ logs }) {
  // Bucket the last MOMENTUM_DAYS days, oldest -> newest, tallying type.
  const days = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = MOMENTUM_DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    days.push({ key: d.toISOString().slice(0, 10), wins: 0, setbacks: 0, total: 0 });
  }
  const byKey = Object.fromEntries(days.map((d) => [d.key, d]));
  let wins = 0, setbacks = 0;
  for (const e of logs) {
    const k = new Date(e.created_at).toISOString().slice(0, 10);
    const bucket = byKey[k];
    if (!bucket) continue;
    bucket.total += 1;
    if (e.type === "win") { bucket.wins += 1; wins += 1; }
    else if (e.type === "setback") { bucket.setbacks += 1; setbacks += 1; }
  }
  const max = Math.max(1, ...days.map((d) => d.total));

  return (
    <Section title={`Momentum, last ${MOMENTUM_DAYS} days`}>
      <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 64, gap: 4 }}>
          {days.map((d) => {
            const h = 8 + (d.total / max) * 48;
            const color = d.setbacks > d.wins ? C.setback : d.wins > 0 ? C.win : C.line;
            return (
              <View key={d.key} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                <View style={{ width: "100%", height: h, borderRadius: 3, backgroundColor: d.total === 0 ? C.line : color }} />
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
          <Tally color={C.win} label="wins" n={wins} />
          <Tally color={C.setback} label="setbacks" n={setbacks} />
          <Tally color={C.muted} label="entries" n={logs.length} />
        </View>
      </View>
    </Section>
  );
}

function Tally({ color, label, n }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color, fontSize: 20, fontWeight: "700" }}>{n}</Text>
      <Text style={{ color: C.muted, fontSize: 12, letterSpacing: 0.5, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function GoalCard({ goal }) {
  const due = goal.target_date
    ? new Date(goal.target_date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;
  return (
    <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <Text style={{ color: C.ink, fontSize: 17, fontWeight: "600", lineHeight: 24 }}>{goal.title}</Text>
      {goal.metric ? (
        <Text style={{ color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 8 }}>
          {goal.current_value ? `${goal.current_value} -> ` : ""}{goal.metric}
        </Text>
      ) : null}
      {due ? (
        <Text style={{ color: C.star, fontSize: 12.5, letterSpacing: 0.5, marginTop: 10 }}>Target {due}</Text>
      ) : null}
    </View>
  );
}

function BlockerCard({ blocker }) {
  return (
    <View style={{ borderWidth: 1, borderColor: C.care, backgroundColor: C.careSoft, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <Text style={{ color: C.ink, fontSize: 16, lineHeight: 23 }}>{blocker.practical_obstacle}</Text>
      {blocker.underlying_belief ? (
        <Text style={{ color: C.care, fontSize: 13.5, lineHeight: 21, marginTop: 10, fontStyle: "italic" }}>
          Underneath: {blocker.underlying_belief}
        </Text>
      ) : null}
    </View>
  );
}

function PatternCard({ pattern }) {
  return (
    <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <Text style={{ color: C.ink, fontSize: 15.5, lineHeight: 23 }}>{pattern.observation}</Text>
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 10 }}>
        Seen {pattern.evidence_count} {pattern.evidence_count === 1 ? "time" : "times"}
      </Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginTop: 26 }}>
      <Text style={{ color: C.ink, fontSize: 18, fontWeight: "600", marginBottom: 14 }}>{title}</Text>
      {children}
    </View>
  );
}

function Empty({ text }) {
  return (
    <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16, borderStyle: "dashed" }}>
      <Text style={{ color: C.muted, fontSize: 14.5, lineHeight: 22 }}>{text}</Text>
    </View>
  );
}
