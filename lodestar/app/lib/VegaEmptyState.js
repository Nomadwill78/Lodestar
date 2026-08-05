// ============================================================
// VegaEmptyState: a warm, on-brand blank state. Vega offering a small
// glowing star, with a short message. Used on first-run / empty screens
// so a member never lands on a cold, empty page.
// ============================================================

import { View, Text, Image } from "react-native";

import { theme as C } from "./theme";
export default function VegaEmptyState({ title, message, width = 232 }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 18 }}>
      <Image
        source={require("../assets/vega/empty-state.png")}
        style={{ width, height: width * 1.25, borderRadius: 20 }}
        resizeMode="contain"
      />
      {title ? (
        <Text style={{ color: C.ink, fontSize: 20, fontWeight: "600", marginTop: 18, textAlign: "center" }}>{title}</Text>
      ) : null}
      {message ? (
        <Text style={{ color: C.muted, fontSize: 15, lineHeight: 23, marginTop: 10, textAlign: "center", maxWidth: 320 }}>{message}</Text>
      ) : null}
    </View>
  );
}
