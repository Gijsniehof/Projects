import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { validateWaveSettings } from '@/games/wavelength/logic';
import { useWave } from '@/games/wavelength/store';
import { Button, Card, Screen, Section, Segmented } from '@/ui/components';
import { TeamsEditor } from '@/ui/TeamsEditor';
import { colors, space, type } from '@/ui/theme';

const GOALS = [10, 15, 20].map((v) => ({ value: v, label: `${v}` }));

export default function WaveSetup() {
  const { ready, settings, updateSettings, game, startGame } = useWave();
  const error = validateWaveSettings(settings);
  const inProgress = game && game.winner === null ? game : null;

  const start = () => {
    const go = () => {
      if (startGame()) router.push('/wavelength/turn');
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
        <Text style={type.title}>Op dezelfde golflengte</Text>
      </View>

      {inProgress ? (
        <Card style={{ gap: space.md }}>
          <Text style={type.label}>Spel bezig · ronde {inProgress.round}</Text>
          <Text style={type.body}>{inProgress.teams.map((t) => `${t.name} ${t.score}`).join('  ·  ')}</Text>
          <Button label="Verder spelen" onPress={() => router.push('/wavelength/turn')} />
        </Card>
      ) : null}

      <Card style={{ gap: space.md }}>
        <Rule n={1} text="De hint-gever ziet stiekem waar het doel op de schaal ligt, bijvoorbeeld koud ↔ heet." />
        <Rule n={2} text="Hij geeft één hint die daar past. Ligt het doel bij 'heet'? Dan bijvoorbeeld 'soep'." />
        <Rule n={3} text="Zijn team draait de wijzer. Midden in de roos is 4 punten, ernaast 3, de rand 2." />
        <Rule n={4} text="Het volgende team gokt of het doel links of rechts van de wijzer ligt, voor 1 bonuspunt." />
      </Card>

      <Section label={`Teams · ${settings.teams.length}`} hint="Spelersnamen zijn optioneel. Als je ze invult, wisselt de hint-gever elke beurt.">
        <TeamsEditor teams={settings.teams} onChange={(teams) => updateSettings({ teams })} />
      </Section>

      <Section label="Punten om te winnen">
        <Segmented options={GOALS} value={settings.target} onChange={(target) => updateSettings({ target })} />
      </Section>
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
  n: { width: 18, fontSize: 16, fontWeight: '700', color: colors.muted },
});
