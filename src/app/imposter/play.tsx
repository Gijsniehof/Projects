import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, Vibration, View } from 'react-native';

import { formatTime } from '@/games/imposter/logic';
import { useImposter } from '@/games/imposter/store';
import { Button, Card, Screen } from '@/ui/components';
import { useLeaveGuard } from '@/ui/useLeaveGuard';
import { colors, space, type } from '@/ui/theme';

export default function Play() {
  const { round, settings } = useImposter();
  const total = settings.timerSeconds;
  const [remaining, setRemaining] = useState(total);
  const [active, setActive] = useState(false);
  const running = active && remaining > 0;
  useLeaveGuard('/imposter');

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Buzz once when the timer hits zero (side effect kept out of the state updater).
  const timeUp = active && remaining === 0;
  useEffect(() => {
    if (timeUp) Vibration.vibrate([0, 400, 150, 400]);
  }, [timeUp]);

  if (!round) return <Redirect href="/imposter" />;

  const starter = round.players[round.startingPlayer];
  const plural = round.imposters.length > 1;

  const reveal = () => {
    const go = () => router.replace('/imposter/result');
    const title = plural ? 'Imposters onthullen?' : 'Imposter onthullen?';
    const msg = 'Heeft iedereen gestemd?';
    if (Platform.OS === 'web') {
      go();
      return;
    }
    Alert.alert(title, msg, [
      { text: 'Nog niet', style: 'cancel' },
      { text: 'Onthullen', style: 'destructive', onPress: go },
    ]);
  };

  return (
    <Screen
      scroll
      footer={<Button label={plural ? 'Onthul de imposters' : 'Onthul de imposter'} variant="danger" onPress={reveal} />}
    >
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        <Text style={type.label}>Wie begint</Text>
        <Text style={type.display}>{starter}</Text>
      </View>

      <Card style={{ gap: space.md }}>
        <Step n={1} text="Om de beurt noemt iedereen één woord dat bij het geheime woord past. Ga met de klok mee." />
        <Step n={2} text="Niet te makkelijk, anders raadt de imposter het woord. Niet te vaag, anders word jij verdacht." />
        <Step n={3} text={`Bespreek en stem samen wie ${plural ? `de ${round.imposters.length} imposters zijn` : 'de imposter is'}.`} />
      </Card>

      {total > 0 ? (
        <View style={styles.timer}>
          <Text style={[styles.time, remaining === 0 && { color: colors.imposter }]}>{formatTime(remaining)}</Text>
          <Text style={type.small}>{remaining === 0 ? 'Tijd is om. Stemmen!' : 'Discussietijd'}</Text>
          <View style={styles.timerButtons}>
            <Button
              label={running ? 'Pauze' : remaining === total ? 'Start timer' : 'Verder'}
              variant="secondary"
              onPress={() => setActive(!running)}
              disabled={remaining === 0}
              style={{ flex: 1 }}
            />
            <Button
              label="Reset"
              variant="ghost"
              onPress={() => {
                setActive(false);
                setRemaining(total);
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>{n}</Text>
      <Text style={[type.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: space.md },
  stepNumber: { width: 18, fontSize: 16, fontWeight: '700', color: colors.muted },
  timer: { alignItems: 'center', gap: space.xs },
  time: { fontSize: 64, fontWeight: '300', color: colors.text, fontVariant: ['tabular-nums'], letterSpacing: -1 },
  timerButtons: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch', marginTop: space.md },
});
