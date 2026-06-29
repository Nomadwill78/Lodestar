// ============================================================
// Push registration. Called once after sign-in. Asks permission,
// gets the Expo push token, and upserts it to push_tokens so the
// morning-brief function can reach this device.
// ============================================================

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "./supabaseClient";

// Foreground briefs show as a banner rather than silently landing.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPush(memberId) {
  if (!Device.isDevice) return; // simulators can't get a token
  if (!memberId) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return; // member declined; app still works

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  if (!token) return;

  // Upsert: one row per member, refreshed on each launch.
  await supabase
    .from("push_tokens")
    .upsert({ member_id: memberId, token }, { onConflict: "member_id" });
}
