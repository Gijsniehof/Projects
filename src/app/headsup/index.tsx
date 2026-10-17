import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useHeadsUp } from '@/games/headsup/store';
import { Button, Card, Chip, Screen, Section, Segmented } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

const TIMES = [60, 90, 120].map((v) => ({ value: v, label: `${v} sec` }));

export default function HeadsUpSetup() {
  const { ready, pools, settings, updateSettings, startRound } = useHeadsUp();
  const canStart = ready && settings.pools.length > 0;

  const toggle = (id: string) => {
    const has = settings.pools.includes(id);
    updateSettings({ pools: has ? settings.pools.filter((p) => p !== id) : [...settings.pools, id] });
  };

  const start = () => {
    startRound();
    router.push('/headsup/play');
  };

  return (
    <Screen
      scroll
      footer={
        <>
          {!settings.pools.length ? <Text style={[type.small, { textAlign: 'center' }]}>Kies minimaal één soort woorden</Text> : null}
          <Button label="Start" onPress={start} disabled={!canStart} />
        </>
      }
    >
      <View style={{ gap: space.xs }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={type.small}>‹ Spellen</Text>
        </Pressable>
        <Text style={type.title}>Wie ben ik?</Text>
      </View>

      <Card style={{ gap: space.md }}>
        <Rule n={1} text="Houd de telefoon liggend tegen je voorhoofd, met het scherm naar de groep." />
        <Rule n={2} text="De groep omschrijft het woord. Jij raadt." />
        <Rule
          n={3}
          text={settings.tilt ? 'Geraden? Kantel de telefoon omlaag. Overslaan? Kantel omhoog.' : 'Geraden? Tik rechts. Overslaan? Tik links.'}
        />
      </Card>

      <Section label="Woorden">
        <View style={styles.chips}>
          {pools.map((p) => (
            <Chip key={p.id} label={p.name} active={settings.pools.includes(p.id)} onPress={() => toggle(p.id)} />
          ))}
        </View>
      </Section>

      <Section label="Tijd">
        <Segmented options={TIMES} value={settings.seconds} onChange={(seconds) => updateSettings({ seconds })} />
      </Section>

      <View style={styles.switchRow}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={type.heading}>Kantelen</Text>
          <Text style={type.small}>Uit: tik op het scherm in plaats van kantelen.</Text>
        </View>
        <Switch
          value={settings.tilt}
          onValueChange={(tilt) => updateSettings({ tilt })}
          trackColor={{ true: colors.accent, false: colors.border }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Kantelen"
        />
      </View>
    </Screen>
  );
}

function Rule({ n, text }: { n: number; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.md }}>
      <Text style={styles.n}>{n}</Text>
      <Text style={[type.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  n: { width: 18, fontSize: 16, fontWeight: '700', color: colors.muted },
});
