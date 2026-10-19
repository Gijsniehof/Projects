import { StyleSheet, Text, View } from 'react-native';

import { colors, space, teamColor, type } from '@/ui/theme';

import type { WaveGame } from './logic';

export function Scoreboard({ game }: { game: WaveGame }) {
  return (
    <View style={{ gap: space.lg }}>
      {game.teams.map((t, i) => (
        <View key={t.name} style={{ gap: space.xs }}>
          <View style={styles.scoreRow}>
            <View style={styles.teamRow}>
              <View style={[styles.dot, { backgroundColor: teamColor(i) }]} />
              <Text style={type.heading}>{t.name}</Text>
            </View>
            <Text style={styles.score}>
              {t.score}
              <Text style={type.small}> / {game.goal}</Text>
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${Math.min(1, t.score / game.goal) * 100}%`, backgroundColor: teamColor(i) }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.md },
  score: { fontSize: 22, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.soft, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
});
