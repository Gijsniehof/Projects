import { Stack } from 'expo-router';

import { ThirtyProvider } from '@/games/thirty/store';
import { colors } from '@/ui/theme';

export default function ThirtyLayout() {
  return (
    <ThirtyProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="turn" options={{ gestureEnabled: false }} />
        <Stack.Screen name="check" options={{ gestureEnabled: false }} />
        <Stack.Screen name="scores" options={{ gestureEnabled: false }} />
      </Stack>
    </ThirtyProvider>
  );
}
