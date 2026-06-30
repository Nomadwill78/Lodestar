// ============================================================
// Journal screen. The member writes freely. submitJournal classifies
// server-side and returns a lane. The UI renders each lane distinctly:
// crisis gets a calm support card with tappable resources and no
// coaching UI; setback gets Vega's reframe; neutral gets a quiet toast.
// ============================================================

import { useState } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Linking, KeyboardAvoidingView, Platform,
} from "react-native";
import { submitJournal } from "../../lib/submitJournal";
import { useVega } from "../../lib/useVega";

const C = { night: "#0B1026", star: "#E8B04B", ink: "#EDEFF7", muted: "#8A93B8", line: "rgba(138,147,184,0.18)", care: "#7FA8E8", careSoft: "rgba(127,168,232,0.10)" };

export default function Journal() {
  const { touch } = useVega();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { lane, message }
  const [err, setErr] = useState("");

  async function submit() {
    const entry = text.trim();
    if (!entry || busy) return;
    setBusy(true); setErr(""); setResult(null);
    try {
      const res = await submitJournal(entry);
      setResult(res);
      setText("");
      // Journaling is meaningful contact: reset Vega's clock so she
      // returns to warmth, same as opening Today.
      touch();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: C.night }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 64 }}>
        <Text style={{ color: C.ink, fontSize: 28, fontWeight: "600", marginBottom: 8 }}>What's on your mind</Text>
        <Text style={{ color: C.muted, fontSize: 15, marginBottom: 24, lineHeight: 22 }}>
          Write it out. If you're stuck or discouraged, Vega will help you look at it straight.
        </Text>

        <TextInput value={text} onChangeText={setText} multiline placeholder="Today I..."
          placeholderTextColor={C.muted}
          style={{ minHeight: 130, backgroundColor: "rgba(255,255,255,0.05)", color: C.ink, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16, fontSize: 16, lineHeight: 23, textAlignVertical: "top" }} />

        <Pressable onPress={submit} disabled={busy || !text.trim()}
          style={{ backgroundColor: C.star, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 16, opacity: busy || !text.trim() ? 0.5 : 1 }}>
          {busy ? <ActivityIndicator color={C.night} /> : <Text style={{ color: C.night, fontWeight: "600", fontSize: 16 }}>Talk it through</Text>}
        </Pressable>

        {err ? <Text style={{ color: "#E8848B", marginTop: 14 }}>{err}</Text> : null}

        {result?.lane === "crisis" && <CrisisCard message={result.message} resources={result.resources} />}
        {result?.lane === "setback" && <ReframeCard message={result.message} />}
        {result?.lane === "neutral" && (
          <Text style={{ color: C.muted, marginTop: 20, fontSize: 15 }}>{result.message}</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ReframeCard({ message }) {
  return (
    <View style={{ marginTop: 22, borderWidth: 1, borderColor: C.star, borderRadius: 16, backgroundColor: "rgba(232,176,75,0.08)", padding: 18 }}>
      <Text style={{ color: C.star, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Vega</Text>
      <Text style={{ color: C.ink, fontSize: 16, lineHeight: 24 }}>{message}</Text>
    </View>
  );
}

// Crisis card is deliberately calm and unbranded. Resources are tappable
// and localized by the member's region (returned by the reframe function).
// No streaks, no "next action", no coaching framing. Falls back to the US
// and international lines if the server sent no resources.
const FALLBACK_RESOURCES = [
  { label: "Call or text 988", action: "tel:988" },
  { label: "Find a helpline near you", action: "https://findahelpline.com" },
];

function CrisisCard({ message, resources }) {
  const list = Array.isArray(resources) && resources.length ? resources : FALLBACK_RESOURCES;
  return (
    <View style={{ marginTop: 22, borderWidth: 1, borderColor: C.care, borderRadius: 16, backgroundColor: C.careSoft, padding: 20 }}>
      <Text style={{ color: C.ink, fontSize: 16, lineHeight: 25 }}>{message}</Text>
      <View style={{ gap: 12, marginTop: 18 }}>
        {list.map((r) => (
          <Pressable key={r.action} onPress={() => Linking.openURL(r.action)}
            style={{ borderWidth: 1, borderColor: C.care, borderRadius: 12, padding: 14, alignItems: "center" }}>
            <Text style={{ color: C.care, fontWeight: "600" }}>{r.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
