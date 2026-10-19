import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MAX_TEAMS, MIN_TEAMS, type TeamSetup } from './teams';
import { colors, radius, space, teamColor, type } from './theme';

/** Editable list of teams with optional player names (shared by the team games). */
export function TeamsEditor({ teams, onChange }: { teams: TeamSetup[]; onChange: (teams: TeamSetup[]) => void }) {
  const patch = (i: number, p: Partial<TeamSetup>) => onChange(teams.map((t, j) => (j === i ? { ...t, ...p } : t)));
  return (
    <View style={{ gap: space.md }}>
      {teams.map((team, i) => (
        <TeamEditor
          key={i}
          index={i}
          team={team}
          canRemove={teams.length > MIN_TEAMS}
          onChange={(p) => patch(i, p)}
          onRemove={() => onChange(teams.filter((_, j) => j !== i))}
        />
      ))}
      {teams.length < MAX_TEAMS ? (
        <Pressable
          onPress={() => onChange([...teams, { name: `Team ${teams.length + 1}`, players: ['', ''] }])}
          accessibilityRole="button"
          style={({ pressed }) => [styles.addTeam, pressed && { opacity: 0.75 }]}
        >
          <Text style={styles.addTeamText}>+ Team toevoegen</Text>
        </Pressable>
      ) : null}
    </View>
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
  addTeam: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTeamText: { fontSize: 17, fontWeight: '600', color: colors.text },
});
