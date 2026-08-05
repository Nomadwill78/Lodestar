// ============================================================
// Authenticated app layout. Two tabs for launch: Today (the morning
// brief) and Journal (the reframe flow). The Life Map dashboard slots
// in here as a third tab when built.
// ============================================================

import { Tabs } from "expo-router";
import { Text } from "react-native";

import { theme as C } from "../../lib/theme";
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
