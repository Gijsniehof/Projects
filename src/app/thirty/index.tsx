import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MAX_TEAMS, MIN_TEAMS, validateSettings } from '@/games/thirty/logic';
import { TERM_POOLS } from '@/games/thirty/data/terms.nl';
import { EveningStats } from '@/games/thirty/components/EveningStats';
import { useThirty } from '@/games/thirty/store';
import type { PoolId, TeamSetup } from '@/games/thirty/types';
import { Button, Card, Chip, Screen, Section, Segmented } from '@/ui/components';
import { colors, radius, space, teamColor, type } from '@/ui/theme';

const TARGETS = [15, 20, 30, 40].map((v) => ({ value: v, label: `${v}` }));
const TIMES = [30, 45, 60].map((v) => ({ value: v, label: `${v} sec` }));

export default function ThirtySetup() {
  const { ready, settings, updateSettings, game, startGame, stats, resetStats } = useThirty();
  const error = validateSettings(settings);
  const teams = settings.teams;

  const setTeams = (next: TeamSetup[]) => updateSettings({ teams: next });
  const patchTeam = (i: number, patch: Partial<TeamSetup>) => setTeams(teams.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const addTeam = () => setTeams([...teams, { name: `Team ${teams.length + 1}`, players: ['', ''] }]);
  const removeTeam = (i: number) => setTeams(teams.filter((_, j) => j !== i));

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
        <View style={{ gap: space.md }}>
          {teams.map((team, i) => (
            <TeamEditor
              key={i}
              index={i}
              team={team}
              canRemove={teams.length > MIN_TEAMS}
              onChange={(patch) => patchTeam(i, patch)}
              onRemove={() => removeTeam(i)}
            />
          ))}
        </View>
        {teams.length < MAX_TEAMS ? <Button label="+ Team toevoegen" variant="secondary" onPress={addTeam} /> : null}
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

function TeamEditor({
  index,
  team,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  team: TeamSetup;
  canRemove: boolean;
  onChange: (patch: Partial<TeamSetup>) => void;
  onRemove: () => void;
}) {
  const setPlayer = (j: number, name: string) => onChange({ players: team.players.map((p, k) => (k === j ? name : p)) });
  const removePlayer = (j: number) => onChange({ players: team.players.filter((_, k) => k !== j) });

  return (
    <View style={styles.team}>
      <View style={styles.teamHeader}>
        <View style={[styles.dot, { backgroundColor: teamColor(index) }]} />
        <TextInput
          value={team.name}
          onChangeText={(name) => onChange({ name })}
          placeholder={`Team ${index + 1}`}
          placeholderTextColor={colors.muted}
          style={styles.teamName}
          maxLength={20}
          accessibilityLabel={`Naam team ${index + 1}`}
        />
        {canRemove ? (
          <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Verwijder ${team.name || `team ${index + 1}`}`}>
            <Text style={type.small}>Verwijder</Text>
          </Pressable>
        ) : null}
      </View>
      {team.players.map((p, j) => (
        <View key={j} style={styles.playerRow}>
          <TextInput
            value={p}
            onChangeText={(t) => setPlayer(j, t)}
            placeholder={`Speler ${j + 1}`}
            placeholderTextColor={colors.muted}
            style={styles.playerInput}
            maxLength={20}
            autoCapitalize="words"
            accessibilityLabel={`${team.name || `Team ${index + 1}`} speler ${j + 1}`}
          />
          <Pressable onPress={() => removePlayer(j)} hitSlop={8} style={styles.remove} accessibilityRole="button" accessibilityLabel="Verwijder speler">
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Pressable onPress={() => onChange({ players: [...team.players, ''] })} accessibilityRole="button" style={styles.addPlayer}>
        <Text style={[type.small, { color: colors.text }]}>+ Speler</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  team: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.sm,
  },
  teamHeader: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  dot: { width: 12, height: 12, borderRadius: 6 },
  teamName: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text, minHeight: 44 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingLeft: space.md,
  },
  playerInput: { flex: 1, fontSize: 16, color: colors.text, minHeight: 44 },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 20, color: colors.muted },
  addPlayer: { minHeight: 40, justifyContent: 'center', paddingHorizontal: space.md },
});
