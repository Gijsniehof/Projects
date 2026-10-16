import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { roleCardFor } from '@/games/imposter/logic';
import { useImposter } from '@/games/imposter/store';
import { Button, Screen } from '@/ui/components';
import { useLeaveGuard } from '@/ui/useLeaveGuard';
import { colors, radius, space, type } from '@/ui/theme';

export default function Reveal() {
  const { round } = useImposter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [fade] = useState(() => new Animated.Value(0));
  useLeaveGuard('/imposter');

  useEffect(() => {
    Animated.timing(fade, { toValue: revealed ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [revealed, fade]);

  if (!round) return <Redirect href="/imposter" />;

  const name = round.players[index];
  const isLast = index === round.players.length - 1;
  const card = roleCardFor(round, index);

  const next = () => {
    setRevealed(false);
    if (isLast) router.replace('/imposter/play');
    else setIndex(index + 1);
  };

  return (
    <Screen
      footer={
        revealed ? (
          <Button label={isLast ? 'Verbergen en beginnen' : 'Verbergen en doorgeven'} onPress={next} />
        ) : (
          <Button label={`Ik ben ${name}`} onPress={() => setRevealed(true)} />
        )
      }
    >
      <View style={styles.header}>
        <Text style={type.label}>
          Speler {index + 1} van {round.players.length}
        </Text>
        <Progress current={index} total={round.players.length} />
      </View>

      <View style={styles.center}>
        {!revealed ? (
          <Pressable onPress={() => setRevealed(true)} style={styles.hiddenCard} accessibilityRole="button">
            <Text style={type.small}>Geef de telefoon aan</Text>
            <Text style={[type.display, { textAlign: 'center' }]} numberOfLines={2}>
              {name}
            </Text>
            <Text style={[type.small, { marginTop: space.lg }]}>Tik om je woord te zien. Niet spieken!</Text>
          </Pressable>
        ) : (
          <Animated.View
            style={[
              styles.card,
              card.kind === 'imposter' && styles.imposterCard,
              { opacity: fade, transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] },
            ]}
          >
            {card.kind === 'word' ? (
              <>
                <Text style={type.label}>Het woord is</Text>
                <Text style={styles.word} adjustsFontSizeToFit numberOfLines={1}>
                  {card.word}
                </Text>
                <Text style={type.small}>{card.category}</Text>
              </>
            ) : (
              <>
                <Text style={[type.label, { color: colors.imposter }]}>Jij bent</Text>
                <Text style={[styles.word, { color: colors.imposter }]} adjustsFontSizeToFit numberOfLines={1}>
                  Imposter
                </Text>
                {card.hint ? (
                  <View style={styles.hintBox}>
                    <Text style={type.small}>Hint</Text>
                    <Text style={type.heading}>{card.hint}</Text>
                  </View>
                ) : null}
                {card.category ? <Text style={type.small}>Categorie: {card.category}</Text> : null}
                <Text style={[type.small, { textAlign: 'center' }]}>Doe alsof je het woord kent.</Text>
              </>
            )}
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progress}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i <= current && { backgroundColor: colors.text }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm },
  progress: { flexDirection: 'row', gap: 4 },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  center: { flex: 1, justifyContent: 'center' },
  hiddenCard: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 64,
    paddingHorizontal: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  card: {
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 56,
    paddingHorizontal: space.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imposterCard: { backgroundColor: colors.imposterSoft, borderColor: colors.imposterSoft },
  word: { fontSize: 44, fontWeight: '700', letterSpacing: -1, color: colors.text, textAlign: 'center' },
  hintBox: {
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.md,
  },
});
