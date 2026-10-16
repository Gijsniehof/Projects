import { Stack } from 'expo-router';

import { ImposterProvider } from '@/games/imposter/store';
import { colors } from '@/ui/theme';

export default function ImposterLayout() {
  return (
    <ImposterProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        {/* No swipe-back mid-round: it would spoil the reveal. */}
        <Stack.Screen name="reveal" options={{ gestureEnabled: false }} />
        <Stack.Screen name="play" options={{ gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ gestureEnabled: false }} />
      </Stack>
    </ImposterProvider>
  );
}
