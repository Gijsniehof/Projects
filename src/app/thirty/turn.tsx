import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, Vibration, View } from 'react-native';

import { currentDescriber } from '@/games/thirty/logic';
import { useThirty } from '@/games/thirty/store';
import { Button, Card, Screen } from '@/ui/components';
import { colors, radius, space, teamColor, type } from '@/ui/theme';
import { useLeaveGuard } from '@/ui/useLeaveGuard';

const TICK_MS = 100;

export default function Turn() {
  const { game, startTurn } = useThirty();
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useLeaveGuard('/thirty', 'Het spel wordt bewaard. Je kunt later verder spelen.');

  const running = endsAt !== null;
  const remainingMs = endsAt === null ? 0 : Math.max(0, endsAt - now);
  const timeUp = running && remainingMs === 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!timeUp) return;
    Vibration.vibrate([0, 500]);
    router.replace('/thirty/check');
  }, [timeUp]);

  if (!game) return <Redirect href="/thirty" />;
  if (game.winner !== null) return <Redirect href="/thirty/scores" />;

  const team = game.teams[game.current];
  const describer = currentDescriber(game);
  const color = teamColor(game.current);

  const begin = () => {
    startTurn();
    const t = Date.now();
    setNow(t);
    setEndsAt(t + game.seconds * 1000);
  };

  if (!running || !game.card) {
    return (
      <Screen scroll footer={<Button label={`Start ${game.seconds} seconden`} onPress={begin} />}>
        <View style={{ gap: space.xs, marginTop: space.lg }}>
          <View style={styles.teamRow}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={type.label}>
              {team.name} · ronde {game.round}
            </Text>
          </View>
          <Text style={type.display}>{describer ?? 'Wie vertelt?'}</Text>
          <Text style={type.small}>
            {describer
              ? `Geef de telefoon aan ${describer}. De rest van ${team.name} mag het scherm niet zien.`
              : `Kies iemand uit ${team.name} om te vertellen. De rest mag het scherm niet zien.`}
          </Text>
        </View>

        <Card style={{ gap: space.md }}>
          <Rule text="Omschrijf de 5 begrippen zo snel mogelijk aan je team." />
          <Rule text="Niet zeggen: het woord zelf, een deel ervan, rijmwoorden of een vertaling." />
          <Rule text="Lastig begrip? Sla het over en kom er later op terug." />
          <Rule text="Na de tijd vink je samen af wat geraden is." />
        </Card>
      </Screen>
    );
  }

  const seconds = Math.ceil(remainingMs / 1000);
  const fraction = remainingMs / (game.seconds * 1000);
  const urgent = seconds <= 5;

  return (
    <Screen footer={<Button label="Klaar, alles geraden" variant="secondary" onPress={() => router.replace('/thirty/check')} />}>
      <View style={styles.timerHeader}>
        <Text style={[styles.seconds, urgent && { color: colors.imposter }]} accessibilityLiveRegion="polite">
          {seconds}
        </Text>
        <View style={styles.track}>
          <View style={[styles.bar, { width: `${fraction * 100}%`, backgroundColor: urgent ? colors.imposter : color }]} />
        </View>
      </View>

      <View style={styles.terms}>
        {game.card.map((term) => (
          <View key={term} style={styles.term}>
            <Text style={styles.termText} adjustsFontSizeToFit numberOfLines={1}>
              {term}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function Rule({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.md }}>
      <Text style={[type.body, { color: colors.muted }]}>•</Text>
      <Text style={[type.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  timerHeader: { gap: space.md, alignItems: 'center' },
  seconds: { fontSize: 72, fontWeight: '300', color: colors.text, fontVariant: ['tabular-nums'], letterSpacing: -2 },
  track: { alignSelf: 'stretch', height: 6, borderRadius: 3, backgroundColor: colors.soft, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
  terms: { flex: 1, justifyContent: 'center', gap: space.md },
  term: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
  },
  termText: { fontSize: 24, fontWeight: '600', color: colors.text, textAlign: 'center' },
});
