import { Pressable, StyleSheet, Text, View } from 'react-native';

import { rankDescribers, type EveningStats as Stats } from '../logic';
import { Card } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

const fmt = (n: number) => n.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** "Vertellers vanavond": ranking of describers across all games tonight. Hidden when no player names are used. */
export function EveningStats({ stats, onReset, limit = 5 }: { stats: Stats; onReset?: () => void; limit?: number }) {
  const ranking = rankDescribers(stats);
  if (!ranking.length) return null;
  const shown = ranking.slice(0, limit);

  return (
    <Card style={{ gap: space.md }}>
      <View style={styles.header}>
        <Text style={type.label}>Vertellers vanavond</Text>
        {onReset ? (
          <Pressable onPress={onReset} hitSlop={10} accessibilityRole="button" accessibilityLabel="Statistieken wissen">
            <Text style={type.small}>Wissen</Text>
          </Pressable>
        ) : null}
      </View>
      {shown.map((d, i) => (
        <View key={d.name} style={styles.row} accessibilityLabel={`${i + 1}. ${d.name}, gemiddeld ${fmt(d.average)} per beurt, ${d.points} punten in ${d.turns} beurten`}>
          <Text style={[styles.rank, i === 0 && { color: colors.text }]}>{i === 0 ? '★' : i + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[type.heading, i === 0 && styles.best]}>{d.name}</Text>
            <Text style={type.small}>
              {d.points} {d.points === 1 ? 'punt' : 'punten'} in {d.turns} {d.turns === 1 ? 'beurt' : 'beurten'}
            </Text>
          </View>
          <Text style={styles.avg}>{fmt(d.average)}</Text>
        </View>
      ))}
      <Text style={type.small}>Gemiddeld aantal geraden begrippen per beurt.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rank: { width: 20, fontSize: 16, fontWeight: '700', color: colors.muted, textAlign: 'center' },
  best: { fontWeight: '700' },
  avg: { fontSize: 20, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
});
