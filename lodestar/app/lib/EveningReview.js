// ============================================================
// EveningReview: a 60-second, member-initiated close to the day.
// Opened from Today. Two light prompts, one tap to save. On success
// it writes evidence and resets Vega's contact clock, then leaves
// the member with a warm, static Vega line (no AI, no spend).
// ============================================================

import { useState } from "react";
import {
  Modal, View, Text, TextInput, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { submitEveningReview } from "./submitEveningReview";

import { theme as C } from "./theme";
// Static, in-voice closers. No em dashes, never guilt.
const CLOSERS = [
  "Rest well. The day counted, and so did you. I'll be here in the morning.",
  "That's enough for today. You moved your star a little closer. Sleep easy.",
  "Logged and held. Tomorrow's one thing is waiting, not weighing. Goodnight.",
];

export default function EveningReview({ visible, onClose, onDone }) {
  const [moved, setMoved] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [closer, setCloser] = useState(null);

  function reset() {
    setMoved(""); setTomorrow(""); setErr(""); setCloser(null); setBusy(false);
  }

  async function save() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      await submitEveningReview({ moved, tomorrow });
      setCloser(CLOSERS[Math.floor(Math.random() * CLOSERS.length)]);
      onDone?.();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  function close() { reset(); onClose?.(); }

  const canSave = (moved.trim() || tomorrow.trim()) && !busy;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "rgba(5,8,20,0.7)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: C.deep, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, maxHeight: "88%" }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {closer ? (
              <View style={{ paddingVertical: 12 }}>
                <Text style={{ color: C.star, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Vega</Text>
                <Text style={{ color: C.ink, fontSize: 18, lineHeight: 27 }}>{closer}</Text>
                <Pressable onPress={close} style={{ backgroundColor: C.star, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 26 }}>
                  <Text style={{ color: C.night, fontWeight: "600", fontSize: 16 }}>Goodnight</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={{ color: C.ink, fontSize: 24, fontWeight: "600", marginBottom: 6 }}>Close the day</Text>
                <Text style={{ color: C.muted, fontSize: 15, lineHeight: 22, marginBottom: 22 }}>
                  A minute is plenty. Two lines and you're done.
                </Text>

                <Field label="What moved today" placeholder="Even one small thing counts."
                  value={moved} onChangeText={setMoved} />
                <Field label="Tomorrow's one thing" placeholder="The single move that matters most."
                  value={tomorrow} onChangeText={setTomorrow} />

                {err ? <Text style={{ color: C.setback, marginTop: 14 }}>{err}</Text> : null}

                <Pressable onPress={save} disabled={!canSave}
                  style={{ backgroundColor: C.star, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 20, opacity: canSave ? 1 : 0.5 }}>
                  {busy ? <ActivityIndicator color={C.night} /> : <Text style={{ color: C.night, fontWeight: "600", fontSize: 16 }}>Save my review</Text>}
                </Pressable>
                <Pressable onPress={close} style={{ alignItems: "center", marginTop: 16 }}>
                  <Text style={{ color: C.muted }}>Not tonight</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, placeholder, value, onChangeText }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ color: C.star, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={C.muted} multiline
        style={{ minHeight: 64, backgroundColor: "rgba(255,255,255,0.05)", color: C.ink, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, fontSize: 16, lineHeight: 23, textAlignVertical: "top" }} />
    </View>
  );
}
