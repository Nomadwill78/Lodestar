// ============================================================
// Onboarding screen. Chats with Vega through the vega-onboarding
// Edge Function (key stays server-side), extracts the <lifemap> block,
// and commits it via commit-life-map. On success, routes into the app.
// ============================================================

import { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { supabase } from "../lib/supabaseClient";
import { commitLifeMap } from "../lib/commitLifeMap";
import { saveDeviceLocale } from "../lib/saveDeviceLocale";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

const C = { night: "#0B1026", star: "#E8B04B", ink: "#EDEFF7", muted: "#8A93B8", line: "rgba(138,147,184,0.18)" };

function extractLifeMap(text) {
  const m = text.match(/<lifemap>([\s\S]*?)<\/lifemap>/);
  if (!m) return null;
  try { return JSON.parse(m[1].trim()); } catch { return null; }
}

export default function Onboarding() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [err, setErr] = useState("");
  const scrollRef = useRef(null);
  const { markOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => { begin(); }, []);
  useEffect(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, [messages, busy]);

  async function callVega(history) {
    const { data, error } = await supabase.functions.invoke("vega-onboarding", { body: { messages: history } });
    if (error) throw error;
    return data.reply;
  }

  async function begin() {
    setBusy(true);
    try {
      const reply = await callVega([]);
      setMessages([{ role: "assistant", content: reply }]);
    } catch { setErr("Couldn't reach Vega. Pull to retry."); }
    finally { setBusy(false); }
  }

  async function send() {
    const content = input.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next); setInput(""); setBusy(true); setErr("");
    try {
      const reply = await callVega(next);
      const map = extractLifeMap(reply);
      if (map) {
        setMessages([...next, { role: "assistant", content: "Your Life Map is ready. Saving it now." }]);
        await commit(map);
      } else {
        setMessages([...next, { role: "assistant", content: reply }]);
      }
    } catch { setErr("Something interrupted us. Try that again."); }
    finally { setBusy(false); }
  }

  async function commit(map) {
    setCommitting(true);
    try {
      await commitLifeMap(map);
      // Capture region + timezone from the device (best-effort, non-blocking)
      // so crisis resources localize and briefs fire at the right local hour.
      saveDeviceLocale();
      markOnboarded();
      router.replace("/(app)/today");
    } catch (e) {
      setErr(e.message || "Couldn't save your map. Try once more.");
      setCommitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: C.night }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Text style={{ color: C.ink, fontSize: 17, fontWeight: "700", letterSpacing: 0.5 }}>LODESTAR</Text>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {messages.map((m, i) => (
          <View key={i} style={{ alignItems: m.role === "user" ? "flex-end" : "flex-start", marginVertical: 7 }}>
            <View style={{
              maxWidth: "82%", padding: 13, borderRadius: 16,
              backgroundColor: m.role === "user" ? C.star : "rgba(255,255,255,0.04)",
              borderWidth: m.role === "user" ? 0 : 1, borderColor: C.line,
            }}>
              <Text style={{ color: m.role === "user" ? C.night : C.ink, fontSize: 15.5, lineHeight: 22 }}>{m.content}</Text>
            </View>
          </View>
        ))}
        {(busy || committing) && <ActivityIndicator color={C.star} style={{ marginTop: 12 }} />}
        {err ? <Text style={{ color: "#E8848B", marginTop: 12 }}>{err}</Text> : null}
      </ScrollView>

      {!committing && (
        <View style={{ flexDirection: "row", gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: C.line }}>
          <TextInput value={input} onChangeText={setInput} placeholder="Type your answer..."
            placeholderTextColor={C.muted} multiline
            style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", color: C.ink, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 13, fontSize: 15.5, maxHeight: 120 }} />
          <Pressable onPress={send} disabled={busy || !input.trim()}
            style={{ backgroundColor: C.star, borderRadius: 14, paddingHorizontal: 20, justifyContent: "center", opacity: busy || !input.trim() ? 0.5 : 1 }}>
            <Text style={{ color: C.night, fontWeight: "600" }}>Send</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
