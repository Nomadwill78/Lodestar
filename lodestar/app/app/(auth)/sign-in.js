// ============================================================
// Sign-in. Email OTP (magic code) keeps it passwordless and simple.
// On success, AuthContext picks up the session and the root gate routes
// the member onward.
// ============================================================

import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { supabase } from "../../lib/supabaseClient";

const C = { night: "#0B1026", star: "#E8B04B", ink: "#EDEFF7", muted: "#8A93B8", line: "rgba(138,147,184,0.18)" };

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState("email"); // email | code
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function sendCode() {
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setBusy(false);
    if (error) setErr(error.message);
    else setStage("code");
  }

  async function verify() {
    setBusy(true); setErr("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) setErr("That code didn't match. Check it and try again.");
    // success -> AuthContext + root gate take over
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.night, justifyContent: "center", padding: 28 }}>
      <Text style={{ color: C.ink, fontSize: 30, fontWeight: "600", marginBottom: 8 }}>Lodestar</Text>
      <Text style={{ color: C.muted, fontSize: 16, marginBottom: 32, lineHeight: 22 }}>
        {stage === "email" ? "Enter your email to begin." : `We sent a code to ${email}.`}
      </Text>

      {stage === "email" ? (
        <TextInput value={email} onChangeText={setEmail} placeholder="you@company.com"
          placeholderTextColor={C.muted} autoCapitalize="none" keyboardType="email-address"
          style={input()} />
      ) : (
        <TextInput value={code} onChangeText={setCode} placeholder="6-digit code"
          placeholderTextColor={C.muted} keyboardType="number-pad" style={input()} />
      )}

      {err ? <Text style={{ color: "#E8848B", marginTop: 12 }}>{err}</Text> : null}

      <Pressable onPress={stage === "email" ? sendCode : verify} disabled={busy}
        style={{ backgroundColor: C.star, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 20, opacity: busy ? 0.6 : 1 }}>
        {busy ? <ActivityIndicator color={C.night} />
          : <Text style={{ color: C.night, fontWeight: "600", fontSize: 16 }}>
              {stage === "email" ? "Send code" : "Verify"}
            </Text>}
      </Pressable>

      {stage === "code" && (
        <Pressable onPress={() => setStage("email")} style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={{ color: C.muted }}>Use a different email</Text>
        </Pressable>
      )}
    </View>
  );
}

function input() {
  return {
    backgroundColor: "rgba(255,255,255,0.05)", color: C.ink, borderWidth: 1,
    borderColor: C.line, borderRadius: 14, padding: 16, fontSize: 16,
  };
}
