import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { scoreOf } from '@/games/headsup/logic';
import { useHeadsUp } from '@/games/headsup/store';
import { Button, Card, Screen } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function HeadsUpResult() {
  const { result, startRound } = useHeadsUp();
  if (!result) return <Redirect href="/headsup" />;
  const score = scoreOf(result);
  const passed = result.words.length - score;

  const again = () => {
    startRound();
    router.replace('/headsup/play');
  };

  return (
    <Screen
      scroll
      footer={
        <>
          <Button label="Volgende speler" onPress={again} />
          <Button label="Instellingen" variant="ghost" onPress={() => router.dismissTo('/headsup')} />
        </>
      }
    >
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        <Text style={type.label}>Geraden in {result.seconds} seconden</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={type.small}>
          {passed} {passed === 1 ? 'keer' : 'keer'} gepast
        </Text>
      </View>

      {result.words.length ? (
        <Card style={{ gap: space.sm }}>
          {result.words.map((w, i) => {
            const ok = w.answer === 'correct';
            return (
              <View key={`${w.word}-${i}`} style={styles.row} accessibilityLabel={`${w.word}, ${ok ? 'geraden' : 'gepast'}`}>
                <Text style={[styles.mark, { color: ok ? '#15803D' : colors.muted }]}>{ok ? '✓' : '–'}</Text>
                <Text style={[type.heading, !ok && styles.passed]}>{w.word}</Text>
              </View>
            );
          })}
        </Card>
      ) : (
        <Text style={type.body}>Geen woorden gespeeld.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  score: { fontSize: 72, fontWeight: '800', color: colors.text, letterSpacing: -2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  mark: { width: 20, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  passed: { color: colors.muted, fontWeight: '500' },
});
