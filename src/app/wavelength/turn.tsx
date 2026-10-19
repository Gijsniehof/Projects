import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { bonusTeamOf, clueGiverOf, waveNotice, type Side, type WaveGame } from '@/games/wavelength/logic';
import { Dial } from '@/games/wavelength/Dial';
import { Scoreboard } from '@/games/wavelength/Scoreboard';
import { useWave } from '@/games/wavelength/store';
import { Button, Card, Screen } from '@/ui/components';
import { colors, radius, space, teamColor, type } from '@/ui/theme';
import { useLeaveGuard } from '@/ui/useLeaveGuard';

type Phase = 'handoff' | 'secret' | 'guess' | 'bonus' | 'reveal';

export default function WaveTurn() {
  const { game, startTurn, newScale, submitTurn } = useWave();
  const [phase, setPhase] = useState<Phase>('handoff');
  const [guess, setGuess] = useState(50);
  useLeaveGuard('/wavelength', 'Het spel wordt bewaard. Je kunt later verder spelen.');

  if (!game) return <Redirect href="/wavelength" />;
  if (game.winner !== null && phase !== 'reveal') return <Redirect href="/wavelength/winner" />;

  const team = game.teams[game.current];
  const color = teamColor(game.current);
  const clueGiver = clueGiverOf(game);
  const bonusTeam = bonusTeamOf(game);

  const lockGuess = () => setPhase('bonus');
  const bonus = (side: Side | null) => {
    submitTurn(guess, side);
    setPhase('reveal');
  };
  const nextTurn = () => {
    if (game.winner !== null) {
      router.replace('/wavelength/winner');
      return;
    }
    setGuess(50);
    setPhase('handoff');
  };

  // 1. Hand the phone to the clue-giver.
  if (phase === 'handoff') {
    return (
      <Screen
        scroll
        footer={
          <Button
            label={clueGiver ? `Ik ben ${clueGiver}, toon het doel` : 'Toon het doel'}
            onPress={() => {
              startTurn();
              setPhase('secret');
            }}
          />
        }
      >
        <TeamHeader game={game} />
        <View style={{ gap: space.sm }}>
          <Text style={type.label}>Hint-gever</Text>
          <Text style={type.display}>{clueGiver ?? `Iemand van ${team.name}`}</Text>
          <Text style={type.body}>Alleen de hint-gever mag het volgende scherm zien.</Text>
        </View>
        <Scoreboard game={game} />
        {waveNotice(game) ? <Text style={[type.body, { color: colors.imposter }]}>{waveNotice(game)}</Text> : null}
      </Screen>
    );
  }

  const scale = game.turn?.scale;

  // 2. Clue-giver sees the target and thinks of a clue.
  if (phase === 'secret' && game.turn && scale) {
    return (
      <Screen
        footer={
          <>
            <Button label="Verberg en geef de telefoon aan je team" onPress={() => setPhase('guess')} />
            <Button label="Andere schaal" variant="ghost" onPress={newScale} />
          </>
        }
      >
        <View style={{ gap: space.xs }}>
          <Text style={[type.label, { color }]}>Alleen voor {clueGiver ?? 'de hint-gever'}</Text>
          <Text style={type.title}>Bedenk één hint</Text>
          <Text style={type.small}>Iets dat precies op die plek tussen de twee woorden past. Zeg hem hardop als je team de telefoon heeft.</Text>
        </View>
        <View style={styles.dialWrap}>
          <Dial leftLabel={scale.left} rightLabel={scale.right} value={null} target={game.turn.target} />
        </View>
      </Screen>
    );
  }

  // 3. Team turns the dial.
  if (phase === 'guess' && scale) {
    return (
      <Screen footer={<Button label="Vastzetten" onPress={lockGuess} />}>
        <View style={{ gap: space.xs }}>
          <Text style={[type.label, { color }]}>{team.name}</Text>
          <Text style={type.title}>Draai de wijzer</Text>
          <Text style={type.small}>Waar op de schaal past de hint? Sleep de wijzer, overleg, en zet hem vast.</Text>
        </View>
        <View style={styles.dialWrap}>
          <Dial leftLabel={scale.left} rightLabel={scale.right} value={guess} target={null} onChange={setGuess} />
          <View style={styles.nudges}>
            <Nudge label="‹" onPress={() => setGuess((g) => Math.max(0, g - 1))} accessibilityLabel="Wijzer iets naar links" />
            <Nudge label="›" onPress={() => setGuess((g) => Math.min(100, g + 1))} accessibilityLabel="Wijzer iets naar rechts" />
          </View>
        </View>
      </Screen>
    );
  }

  // 4. Next team guesses left or right.
  if (phase === 'bonus' && scale) {
    const other = game.teams[bonusTeam];
    return (
      <Screen
        footer={
          <View style={styles.sides}>
            <Button label="← Links" variant="secondary" onPress={() => bonus('left')} style={{ flex: 1 }} />
            <Button label="Rechts →" variant="secondary" onPress={() => bonus('right')} style={{ flex: 1 }} />
          </View>
        }
      >
        <View style={{ gap: space.xs }}>
          <Text style={[type.label, { color: teamColor(bonusTeam) }]}>Bonus voor {other.name}</Text>
          <Text style={type.title}>Links of rechts?</Text>
          <Text style={type.small}>Ligt het echte doel links of rechts van de wijzer? Goed gegokt is 1 punt (niet als het in de roos is).</Text>
        </View>
        <View style={styles.dialWrap}>
          <Dial leftLabel={scale.left} rightLabel={scale.right} value={guess} target={null} />
        </View>
      </Screen>
    );
  }

  // 5. Reveal.
  const last = game.lastTurn;
  if (phase === 'reveal' && last) {
    const scoringTeam = game.teams[last.team];
    const bonusName = game.teams[last.bonusTeam].name;
    const verdict = ['Helemaal mis', '', 'Net op de rand', 'Dichtbij!', 'In de roos!'][last.points];
    return (
      <Screen scroll footer={<Button label={game.winner !== null ? 'Naar de uitslag' : 'Volgende beurt'} onPress={nextTurn} />}>
        <View style={{ gap: space.xs }}>
          <Text style={[type.label, { color: teamColor(last.team) }]}>{scoringTeam.name}</Text>
          <Text style={type.title}>{verdict}</Text>
        </View>
        <View style={styles.dialWrap}>
          <Dial leftLabel={last.scale.left} rightLabel={last.scale.right} value={last.guess} target={last.target} />
        </View>
        <Card style={{ gap: space.sm }}>
          <ResultRow label={scoringTeam.name} value={`+${last.points}`} color={teamColor(last.team)} />
          <ResultRow
            label={`${bonusName} gokte ${last.bonusGuess === 'left' ? 'links' : 'rechts'}`}
            value={last.points === 4 ? 'telt niet' : last.bonusPoints ? '+1' : 'fout'}
            color={last.bonusPoints ? teamColor(last.bonusTeam) : colors.muted}
          />
        </Card>
        <Scoreboard game={game} />
        {waveNotice(game) ? <Text style={[type.body, { color: colors.imposter }]}>{waveNotice(game)}</Text> : null}
      </Screen>
    );
  }

  return <Redirect href="/wavelength" />;
}

function TeamHeader({ game }: { game: WaveGame }) {
  return (
    <View style={styles.teamRow}>
      <View style={[styles.dot, { backgroundColor: teamColor(game.current) }]} />
      <Text style={type.label}>
        {game.teams[game.current].name} · ronde {game.round}
      </Text>
    </View>
  );
}

function ResultRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.scoreRow}>
      <Text style={type.body}>{label}</Text>
      <Text style={[type.heading, { color }]}>{value}</Text>
    </View>
  );
}

function Nudge({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [styles.nudge, pressed && { opacity: 0.6 }]}>
      <Text style={styles.nudgeText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dialWrap: { flex: 1, justifyContent: 'center', gap: space.lg },
  nudges: { flexDirection: 'row', justifyContent: 'center', gap: space.xl },
  nudge: {
    width: 64,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeText: { fontSize: 26, color: colors.text },
  sides: { flexDirection: 'row', gap: space.sm },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.md },
});
