import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
    const { session, loading } = useAuthStore();

  // Still checking stored session — render nothing to avoid a flash
  if (loading) return null;
    // Already signed in — send straight to the app
  if (session) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
