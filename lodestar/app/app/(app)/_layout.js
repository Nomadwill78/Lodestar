// ============================================================
// Authenticated app layout. Two tabs for launch: Today (the morning
// brief) and Journal (the reframe flow). The Life Map dashboard slots
// in here as a third tab when built.
// ============================================================

import { Tabs } from "expo-router";
import { Text } from "react-native";

const C = { night: "#0B1026", star: "#E8B04B", muted: "#8A93B8", line: "rgba(138,147,184,0.18)" };

export default function AppLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: C.night, borderTopColor: C.line },
      tabBarActiveTintColor: C.star,
      tabBarInactiveTintColor: C.muted,
    }}>
      <Tabs.Screen name="today" options={{
        title: "Today",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✦</Text>,
      }} />
      <Tabs.Screen name="journal" options={{
        title: "Journal",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✎</Text>,
      }} />
      <Tabs.Screen name="map" options={{
        title: "Map",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✶</Text>,
      }} />
    </Tabs>
  );
}
