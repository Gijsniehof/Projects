import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { validateSettings } from '@/games/thirty/logic';
import { TERM_POOLS } from '@/games/thirty/data/terms.nl';
import { EveningStats } from '@/games/thirty/components/EveningStats';
import { useThirty } from '@/games/thirty/store';
import type { PoolId } from '@/games/thirty/types';
import { Button, Card, Chip, Screen, Section, Segmented } from '@/ui/components';
import { TeamsEditor } from '@/ui/TeamsEditor';
import { space, type } from '@/ui/theme';

const TARGETS = [15, 20, 30, 40].map((v) => ({ value: v, label: `${v}` }));
const TIMES = [30, 45, 60].map((v) => ({ value: v, label: `${v} sec` }));

export default function ThirtySetup() {
  const { ready, settings, updateSettings, game, startGame, stats, resetStats } = useThirty();
  const error = validateSettings(settings);
  const teams = settings.teams;


  const togglePool = (id: PoolId) => {
    const has = settings.pools.includes(id);
    updateSettings({ pools: has ? settings.pools.filter((p) => p !== id) : [...settings.pools, id] });
  };

  const inProgress = game && game.winner === null ? game : null;

  const start = () => {
    const go = () => {
      if (startGame()) router.push('/thirty/turn');
    };
    if (!inProgress || Platform.OS === 'web') return go();
    Alert.alert('Nieuw spel starten?', 'Het huidige spel wordt gewist.', [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Nieuw spel', style: 'destructive', onPress: go },
    ]);
  };

  return (
    <Screen
      scroll
      footer={
        <>
          {error ? <Text style={[type.small, { textAlign: 'center' }]}>{error}</Text> : null}
          <Button label={inProgress ? 'Nieuw spel starten' : 'Start spel'} onPress={start} disabled={!ready || !!error} />
        </>
      }
    >
      <View style={{ gap: space.xs }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={type.small}>‹ Spellen</Text>
        </Pressable>
        <Text style={type.title}>30 Seconds</Text>
      </View>

      {inProgress ? (
        <Card style={{ gap: space.md }}>
          <Text style={type.label}>Spel bezig · ronde {inProgress.round}</Text>
          <Text style={type.body}>{inProgress.teams.map((t) => `${t.name} ${t.score}`).join('  ·  ')}</Text>
          <Button label="Verder spelen" onPress={() => router.push('/thirty/scores')} />
        </Card>
      ) : null}

      <EveningStats stats={stats} onReset={resetStats} limit={3} />

      <Section label={`Teams · ${teams.length}`} hint="Spelersnamen zijn optioneel. Als je ze invult, wisselt de verteller elke beurt.">
        <TeamsEditor teams={teams} onChange={(next) => updateSettings({ teams: next })} />
      </Section>

      <Section label="Punten om te winnen">
        <Segmented options={TARGETS} value={settings.target} onChange={(target) => updateSettings({ target })} />
      </Section>

      <Section label="Tijd per beurt">
        <Segmented options={TIMES} value={settings.seconds} onChange={(seconds) => updateSettings({ seconds })} />
      </Section>

      <Section label="Begrippen" hint="Elke kaart mengt de gekozen soorten.">
        <View style={styles.chips}>
          {TERM_POOLS.map((p) => (
            <Chip key={p.id} label={p.name} active={settings.pools.includes(p.id)} onPress={() => togglePool(p.id)} />
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
