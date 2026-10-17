import { Stack } from 'expo-router';

import { HeadsUpProvider } from '@/games/headsup/store';
import { colors } from '@/ui/theme';

export default function HeadsUpLayout() {
  return (
    <HeadsUpProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="play" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="result" options={{ gestureEnabled: false }} />
      </Stack>
    </HeadsUpProvider>
  );
}
