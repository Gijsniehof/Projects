import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThirty } from '@/games/thirty/store';
import { Button, Screen } from '@/ui/components';
import { colors, radius, space, teamColor, type } from '@/ui/theme';
import { useLeaveGuard } from '@/ui/useLeaveGuard';

export default function Check() {
  const { game, submitTurn } = useThirty();
  // Snapshot the card: submitting clears it in the store, and this screen
  // shouldn't redirect while it navigates away.
  const [terms] = useState(() => game?.card ?? null);
  const [teamIndex] = useState(() => game?.current ?? 0);
  const [guessed, setGuessed] = useState<boolean[]>(() => (terms ?? []).map(() => false));
  useLeaveGuard('/thirty', 'Het spel wordt bewaard. Je kunt later verder spelen.');

  if (!game || !terms) return <Redirect href="/thirty" />;

  const team = game.teams[teamIndex];
  const points = guessed.filter(Boolean).length;
  const toggle = (i: number) => setGuessed(guessed.map((g, j) => (j === i ? !g : g)));

  const confirm = () => {
    submitTurn(guessed);
    router.replace('/thirty/scores');
  };

  return (
    <Screen
      scroll
      footer={<Button label={`Bevestig: ${points} ${points === 1 ? 'punt' : 'punten'}`} onPress={confirm} />}
    >
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        <View style={styles.teamRow}>
          <View style={[styles.dot, { backgroundColor: teamColor(teamIndex) }]} />
          <Text style={type.label}>{team.name}</Text>
        </View>
        <Text style={type.title}>Tijd is om!</Text>
        <Text style={type.small}>Tik de begrippen aan die je team geraden heeft.</Text>
      </View>

      <View style={{ gap: space.sm }}>
        {terms.map((term, i) => {
          const on = guessed[i];
          return (
            <Pressable
              key={term}
              onPress={() => toggle(i)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && { opacity: 0.8 }]}
            >
              <View style={[styles.box, on && styles.boxOn]}>{on ? <Text style={styles.tick}>✓</Text> : null}</View>
              <Text style={[styles.term, on && { color: colors.accentText }]}>{term}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    minHeight: 60,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { borderColor: colors.accentText, backgroundColor: colors.accentText },
  tick: { fontSize: 16, fontWeight: '700', color: colors.accent },
  term: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text },
});
