import { Stack } from 'expo-router';

import { WaveProvider } from '@/games/wavelength/store';
import { colors } from '@/ui/theme';

export default function WaveLayout() {
  return (
    <WaveProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="turn" options={{ gestureEnabled: false }} />
        <Stack.Screen name="winner" options={{ gestureEnabled: false }} />
      </Stack>
    </WaveProvider>
  );
}
