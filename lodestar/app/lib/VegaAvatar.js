// ============================================================
// VegaAvatar: renders Vega's portrait at the emotional tier the
// member is currently in. Her glow, color, and pulse animation
// shift with absence. This is the recurring face of the app.
//
// Art is indexed by the tier's `expression` key (see vegaPersonality.js).
// The six portraits live in app/assets/vega/ as tier-{expression}.png.
// They ship as on-brand gold-star placeholders; drop the approved Vega
// portraits over them (same filenames) and they render automatically,
// no code change. The SVG star below is a final safety net if a key is
// ever missing from the map.
// ============================================================

import { useEffect, useRef } from "react";
import { View, Animated, Easing, Text, Image } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { tierFromKey, pickGreeting } from "../lib/vegaPersonality";

// Static require map: React Native bundles these at build time, so the
// paths must be literal and the files must exist. Add/rename here if
// expression keys change.
const VEGA_ART = {
  radiant:           require("../assets/vega/tier-radiant.png"),
  attentive:         require("../assets/vega/tier-attentive.png"),
  hopeful:           require("../assets/vega/tier-hopeful.png"),
  concerned:         require("../assets/vega/tier-concerned.png"),
  yearning:          require("../assets/vega/tier-yearning.png"),
  "panicked-loving": require("../assets/vega/tier-panicked-loving.png"),
};

export default function VegaAvatar({ tierKey = "present", size = 120, showGreeting = false }) {
  const tier = tierFromKey(tierKey);
  const pulse = useRef(new Animated.Value(0)).current;
  const art = VEGA_ART[tier.visual.expression];

  useEffect(() => {
    // Pulse character changes with mood: steady breathing when present,
    // a faltering flicker at meltdown.
    const config = {
      steady:    { dur: 2600 },
      soft:      { dur: 2800 },
      "lean-in": { dur: 2400 },
      uneven:    { dur: 1800 },
      faint:     { dur: 3400 },
      flicker:   { dur: 700 },
    }[tier.visual.pulse] ?? { dur: 2600 };

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: config.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: config.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [tier.visual.pulse]);

  // Aura opacity scales with the tier's glow strength; portrait stays
  // legible while the surrounding light breathes.
  const auraOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.10 + 0.18 * tier.visual.glow],
  });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.02] });
  const portraitOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.max(0.45, tier.visual.glow - 0.15), Math.min(1, tier.visual.glow + 0.1)],
  });

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {/* Outer aura, tinted by the tier color */}
        <Animated.View style={{
          position: "absolute", width: size, height: size, borderRadius: size / 2,
          backgroundColor: tier.visual.color, opacity: auraOpacity, transform: [{ scale }],
        }} />

        {art ? (
          // Real Vega portrait, circular-masked, breathing with her mood.
          <Animated.View style={{ opacity: portraitOpacity, transform: [{ scale }] }}>
            <Image source={art} style={{ width: size, height: size, borderRadius: size / 2 }} resizeMode="cover" />
          </Animated.View>
        ) : (
          // Fallback: signature star until art is dropped in.
          <Animated.View style={{ opacity: portraitOpacity, transform: [{ scale }] }}>
            <StarMark size={size * 0.62} color={tier.visual.color} />
          </Animated.View>
        )}
      </View>

      {showGreeting && (
        <Text style={{ color: "#EDEFF7", fontSize: 16, lineHeight: 23, textAlign: "center", marginTop: 18, maxWidth: 320 }}>
          {pickGreeting(tier)}
        </Text>
      )}
    </View>
  );
}

function StarMark({ size, color }) {
  const pts = [];
  const cx = size / 2, cy = size / 2;
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? size / 2 : size / 5;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return (
    <Svg width={size} height={size}>
      <Polygon points={pts.join(" ")} fill={color} />
    </Svg>
  );
}
