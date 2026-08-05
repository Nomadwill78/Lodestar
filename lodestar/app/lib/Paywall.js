// ============================================================
// Paywall: the in-app upgrade screen, shown as a modal so it can open from
// anywhere (the journal limit card, the Life Map). When RevenueCat is
// configured it lists the live offering packages with localized store
// prices; otherwise it shows a static plan comparison so the screen is
// still useful in dev and communicates the value.
//
// The tier flip happens server-side via the RevenueCat webhook after a
// successful purchase; here we just drive the store sheet and confirm.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import {
  Modal, View, Text, Pressable, ScrollView, ActivityIndicator, Image,
} from "react-native";
import { getUpgradeOptions, purchasePackageById, restorePurchases } from "./purchases";

import { theme as C } from "./theme";
// Static value props, shown alongside live prices or as the dev fallback.
const PLANS = [
  {
    name: "Aligned",
    price: "$19", cadence: "per month",
    highlight: true,
    features: [
      "Unlimited reframes with Vega",
      "Evening review and momentum view",
      "Pattern detection across your logs",
      "Smarter, context-aware morning briefs",
    ],
  },
  {
    name: "Founder",
    price: "$49", cadence: "per month",
    highlight: false,
    features: [
      "Everything in Aligned",
      "Priority guidance from Vega",
      "Deeper goal and blocker mapping",
      "Early access to new mechanisms",
    ],
  },
];

export default function Paywall({ visible, onClose, onPurchased }) {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({ available: false, packages: [] });
  const [busyId, setBusyId] = useState(null);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const opts = await getUpgradeOptions();
    setOptions(opts);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (visible) { setDone(false); setNote(""); load(); }
  }, [visible, load]);

  async function buy(id) {
    if (busyId) return;
    setBusyId(id); setNote("");
    const res = await purchasePackageById(id);
    setBusyId(null);
    if (res.ok) {
      setDone(true);
      onPurchased?.();
    } else if (res.reason === "cancelled") {
      // silent
    } else if (res.reason === "unavailable") {
      setNote("Upgrades are opening soon. Thank you for your patience.");
    } else {
      setNote("We couldn't complete that just now. Please try again.");
    }
  }

  async function restore() {
    setNote("");
    const res = await restorePurchases();
    setNote(res.ok ? "Purchases restored. Any active plan is now active here." : "Nothing to restore on this account.");
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.scrim, justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: C.deep, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 34, maxHeight: "92%" }}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22 }}>
            {done ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <Image source={require("../assets/vega/tier-radiant.png")}
                  style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 18 }} />
                <Text style={{ color: C.ink, fontSize: 22, fontWeight: "600", textAlign: "center" }}>You're in. Thank you.</Text>
                <Text style={{ color: C.muted, fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 10, maxWidth: 300 }}>
                  Your plan unlocks in a moment. Let's keep building your north star together.
                </Text>
                <Pressable onPress={onClose} style={{ backgroundColor: C.star, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 40, marginTop: 24 }}>
                  <Text style={{ color: C.night, fontWeight: "600", fontSize: 16 }}>Continue</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={{ alignItems: "center" }}>
                  <Image source={require("../assets/vega/headshot.png")}
                    style={{ width: 72, height: 72, borderRadius: 36, marginBottom: 14 }} />
                  <Text style={{ color: C.ink, fontSize: 24, fontWeight: "600", textAlign: "center" }}>Go further with Vega</Text>
                  <Text style={{ color: C.muted, fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 8, maxWidth: 320 }}>
                    Unlimited reframes, the evening review, and the patterns underneath your progress.
                  </Text>
                </View>

                {loading ? (
                  <ActivityIndicator color={C.star} style={{ marginVertical: 40 }} />
                ) : options.available && options.packages.length ? (
                  // Live: render the current offering's packages straight from
                  // RevenueCat, so display names, prices, and durations are
                  // whatever is configured in the dashboard.
                  <View style={{ marginTop: 22, gap: 14 }}>
                    {options.packages.map((pkg) => (
                      <LivePackageCard
                        key={pkg.id}
                        pkg={pkg}
                        busy={busyId === pkg.id}
                        onBuy={() => buy(pkg.id)}
                      />
                    ))}
                  </View>
                ) : (
                  // Fallback (dev / before keys): static plan comparison.
                  <View style={{ marginTop: 22, gap: 14 }}>
                    {PLANS.map((plan) => (
                      <PlanCard
                        key={plan.name}
                        plan={plan}
                        priceLabel={plan.price}
                        canBuy={false}
                        busy={false}
                        onBuy={() => setNote("Upgrades are opening soon. Thank you for your patience.")}
                      />
                    ))}
                    <Text style={{ color: C.muted, fontSize: 13, textAlign: "center", marginTop: 4 }}>
                      Upgrades are opening soon.
                    </Text>
                  </View>
                )}

                {note ? <Text style={{ color: C.star, fontSize: 14, textAlign: "center", marginTop: 16 }}>{note}</Text> : null}

                <View style={{ flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 22 }}>
                  <Pressable onPress={restore}><Text style={{ color: C.muted, fontSize: 14 }}>Restore purchases</Text></Pressable>
                  <Pressable onPress={onClose}><Text style={{ color: C.muted, fontSize: 14 }}>Not now</Text></Pressable>
                </View>

                <Text style={{ color: C.muted, fontSize: 11.5, lineHeight: 17, textAlign: "center", marginTop: 18 }}>
                  Subscriptions renew automatically until canceled. Manage or cancel anytime in your app store account.
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Renders a single live RevenueCat package. Annual packages are highlighted
// as the best value.
function LivePackageCard({ pkg, busy, onBuy }) {
  const annual = String(pkg.packageType || "").toUpperCase() === "ANNUAL";
  return (
    <View style={{
      borderWidth: 1, borderColor: annual ? C.star : C.line,
      backgroundColor: annual ? C.starSoft : "transparent",
      borderRadius: 18, padding: 18,
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ color: C.ink, fontSize: 17, fontWeight: "700", flex: 1, paddingRight: 12 }}>{pkg.title}</Text>
        <Text style={{ color: C.ink, fontSize: 17, fontWeight: "600" }}>{pkg.priceString}</Text>
      </View>
      {pkg.description ? (
        <Text style={{ color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 8 }}>{pkg.description}</Text>
      ) : null}
      {annual ? (
        <Text style={{ color: C.star, fontSize: 12, fontWeight: "600", marginTop: 8 }}>Best value</Text>
      ) : null}
      <Pressable onPress={onBuy} disabled={busy}
        style={{
          marginTop: 14, borderRadius: 12, paddingVertical: 14, alignItems: "center",
          backgroundColor: annual ? C.star : "transparent",
          borderWidth: annual ? 0 : 1, borderColor: C.star,
          opacity: busy ? 0.6 : 1,
        }}>
        {busy
          ? <ActivityIndicator color={annual ? C.night : C.star} />
          : <Text style={{ color: annual ? C.night : C.star, fontWeight: "600", fontSize: 15 }}>Choose this plan</Text>}
      </Pressable>
    </View>
  );
}

function PlanCard({ plan, priceLabel, canBuy, busy, onBuy }) {
  return (
    <View style={{
      borderWidth: 1, borderColor: plan.highlight ? C.star : C.line,
      backgroundColor: plan.highlight ? C.starSoft : "transparent",
      borderRadius: 18, padding: 18,
    }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Text style={{ color: C.ink, fontSize: 18, fontWeight: "700" }}>{plan.name}</Text>
        <Text style={{ color: C.ink, fontSize: 18, fontWeight: "600" }}>
          {priceLabel}
          <Text style={{ color: C.muted, fontSize: 13, fontWeight: "400" }}>  {plan.cadence}</Text>
        </Text>
      </View>
      <View style={{ marginTop: 12, gap: 8 }}>
        {plan.features.map((f) => (
          <View key={f} style={{ flexDirection: "row", gap: 8 }}>
            <Text style={{ color: C.star, fontSize: 14 }}>✓</Text>
            <Text style={{ color: C.muted, fontSize: 14.5, lineHeight: 20, flex: 1 }}>{f}</Text>
          </View>
        ))}
      </View>
      <Pressable onPress={onBuy} disabled={busy}
        style={{
          marginTop: 16, borderRadius: 12, paddingVertical: 14, alignItems: "center",
          backgroundColor: plan.highlight ? C.star : "transparent",
          borderWidth: plan.highlight ? 0 : 1, borderColor: C.star,
          opacity: busy ? 0.6 : 1,
        }}>
        {busy
          ? <ActivityIndicator color={plan.highlight ? C.night : C.star} />
          : <Text style={{ color: plan.highlight ? C.night : C.star, fontWeight: "600", fontSize: 15 }}>
              {canBuy ? `Choose ${plan.name}` : `${plan.name} coming soon`}
            </Text>}
      </Pressable>
    </View>
  );
}
