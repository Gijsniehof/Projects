import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { currentDescriber, finalRoundNotice } from '@/games/thirty/logic';
import { EveningStats } from '@/games/thirty/components/EveningStats';
import { useThirty } from '@/games/thirty/store';
import type { Game } from '@/games/thirty/types';
import { Button, Card, Screen } from '@/ui/components';
import { colors, space, teamColor, type } from '@/ui/theme';
import { useLeaveGuard } from '@/ui/useLeaveGuard';

export default function Scores() {
  const { game, startGame, stats, resetStats } = useThirty();
  useLeaveGuard('/thirty', 'Het spel wordt bewaard. Je kunt later verder spelen.');
  if (!game) return <Redirect href="/thirty" />;

  const toSetup = () => router.dismissTo('/thirty');

  if (game.winner !== null) {
    const winner = game.teams[game.winner];
    const again = () => {
      if (startGame()) router.replace('/thirty/turn');
    };
    return (
      <Screen
        scroll
        footer={
          <>
            <Button label="Nog een potje" onPress={again} />
            <Button label="Naar instellingen" variant="ghost" onPress={toSetup} />
          </>
        }
      >
        <View style={{ gap: space.xs, marginTop: space.lg }}>
          <Text style={[type.label, { color: teamColor(game.winner) }]}>Winnaar</Text>
          <Text style={type.display}>{winner.name}</Text>
          <Text style={type.small}>
            {winner.score} punten in {game.round - 1} {game.round - 1 === 1 ? 'ronde' : 'rondes'}
          </Text>
        </View>
        <Scoreboard game={game} />
        <EveningStats stats={stats} onReset={resetStats} />
      </Screen>
    );
  }

  const next = game.teams[game.current];
  const describer = currentDescriber(game);
  const notice = finalRoundNotice(game);
  const last = game.lastTurn;

  return (
    <Screen
      scroll
      footer={
        <>
          <Button label={`Start beurt ${next.name}`} onPress={() => router.replace('/thirty/turn')} />
          <Button label="Naar instellingen" variant="ghost" onPress={toSetup} />
        </>
      }
    >
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        <Text style={type.label}>Ronde {game.round}</Text>
        <Text style={type.title}>Tussenstand</Text>
      </View>

      {last ? (
        <Card style={{ gap: space.sm }}>
          <View style={styles.lastHeader}>
            <Text style={type.heading}>{game.teams[last.team].name}</Text>
            <Text style={[type.heading, { color: teamColor(last.team) }]}>+{last.points}</Text>
          </View>
          <View style={styles.lastTerms}>
            {last.terms.map((t, i) => (
              <Text
                key={t}
                style={[type.small, last.guessed[i] ? { color: colors.text } : styles.missed]}
                accessibilityLabel={`${t}, ${last.guessed[i] ? 'geraden' : 'niet geraden'}`}
              >
                {last.guessed[i] ? '✓' : '✗'} {t}
              </Text>
            ))}
          </View>
        </Card>
      ) : null}

      <Scoreboard game={game} />

      {notice ? <Text style={[type.body, { color: colors.imposter }]}>{notice}</Text> : null}

      <EveningStats stats={stats} limit={3} />

      <View style={{ gap: space.xs }}>
        <Text style={type.label}>Aan de beurt</Text>
        <View style={styles.nextRow}>
          <View style={[styles.dot, { backgroundColor: teamColor(game.current) }]} />
          <Text style={type.heading}>
            {next.name}
            {describer ? ` · ${describer} vertelt` : ''}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function Scoreboard({ game }: { game: Game }) {
  return (
    <View style={{ gap: space.lg }}>
      {game.teams.map((t, i) => {
        const fraction = Math.min(1, t.score / game.target);
        return (
          <View key={t.name} style={{ gap: space.xs }}>
            <View style={styles.scoreRow}>
              <View style={styles.nextRow}>
                <View style={[styles.dot, { backgroundColor: teamColor(i) }]} />
                <Text style={type.heading}>{t.name}</Text>
              </View>
              <Text style={styles.score}>
                {t.score}
                <Text style={type.small}> / {game.target}</Text>
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${fraction * 100}%`, backgroundColor: teamColor(i) }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lastTerms: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.lg, rowGap: space.xs },
  missed: { textDecorationLine: 'line-through' },
  lastHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  score: { fontSize: 22, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.soft, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
});
