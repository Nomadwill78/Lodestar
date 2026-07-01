// ============================================================
// Today screen. Now led by Vega herself: she appears at her current
// emotional tier and greets the member. Opening this screen counts as
// contact, so her clock resets and she returns to warmth. Below her,
// the morning brief's three lines.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { supabase } from "../../lib/supabaseClient";
import VegaAvatar from "../../lib/VegaAvatar";
import { useVega } from "../../lib/useVega";
import EveningReview from "../../lib/EveningReview";

const C = { night: "#0B1026", star: "#E8B04B", starSoft: "rgba(232,176,75,0.10)", ink: "#EDEFF7", muted: "#8A93B8", line: "rgba(138,147,184,0.18)" };

export default function Today() {
  const { tierKey, touch, loading: vegaLoading } = useVega();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greetTier, setGreetTier] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const loadBrief = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("daily_briefs")
      .select("id, focus_line, intention_line, affirmation_line, opened, sent_at")
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setBrief(data ?? null);
    setLoading(false);
    if (data && !data.opened) {
      supabase.from("daily_briefs").update({ opened: true }).eq("id", data.id);
    }
  }, []);

  // Capture the tier she greets at BEFORE touch() resets it, so a returning
  // member sees the relief greeting for their real absence.
  useEffect(() => {
    if (!vegaLoading && greetTier === null) {
      setGreetTier(tierKey);
      touch();          // arriving counts as contact; resets her clock
      loadBrief();
    }
  }, [vegaLoading, tierKey, greetTier, touch, loadBrief]);

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.night }}
      contentContainerStyle={{ padding: 22, paddingTop: 56, alignItems: "center" }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBrief} tintColor={C.star} />}>

      <VegaAvatar tierKey={greetTier ?? "present"} size={130} showGreeting />

      <View style={{ alignSelf: "stretch", marginTop: 34 }}>
        <Text style={{ color: C.muted, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase" }}>{today}</Text>
        <Text style={{ color: C.ink, fontSize: 26, fontWeight: "600", marginTop: 6, marginBottom: 22 }}>Your focus today</Text>

        {!brief && !loading && (
          <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 22 }}>
            <Text style={{ color: C.ink, fontSize: 16, lineHeight: 24 }}>
              Your first brief arrives at your chosen morning time. I'm already holding your north star.
            </Text>
          </View>
        )}

        {brief && (
          <View style={{ gap: 14 }}>
            <Line label="Focus" text={brief.focus_line} accent />
            <Line label="When, then" text={brief.intention_line} />
            <Line label="True about you" text={brief.affirmation_line} />
          </View>
        )}

        {/* Evening review: member-initiated close to the day. */}
        <Pressable onPress={() => setReviewOpen(true)}
          style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 18, marginTop: 26, alignItems: "center" }}>
          <Text style={{ color: C.star, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Evening</Text>
          <Text style={{ color: C.ink, fontSize: 16 }}>Close the day with Vega</Text>
        </Pressable>
      </View>

      <EveningReview
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onDone={touch}
      />
    </ScrollView>
  );
}

function Line({ label, text, accent }) {
  return (
    <View style={{
      borderWidth: 1, borderColor: accent ? C.star : C.line, borderRadius: 16,
      backgroundColor: accent ? C.starSoft : "transparent", padding: 18,
    }}>
      <Text style={{ color: C.star, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>{label}</Text>
      <Text style={{ color: C.ink, fontSize: 17, lineHeight: 25 }}>{text}</Text>
    </View>
  );
}
