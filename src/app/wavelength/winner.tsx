import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Scoreboard } from '@/games/wavelength/Scoreboard';
import { useWave } from '@/games/wavelength/store';
import { Button, Screen } from '@/ui/components';
import { space, teamColor, type } from '@/ui/theme';

export default function WaveWinner() {
  const { game, startGame } = useWave();
  if (!game) return <Redirect href="/wavelength" />;
  if (game.winner === null) return <Redirect href="/wavelength/turn" />;
  const winner = game.teams[game.winner];
  const rounds = game.round - 1;

  return (
    <Screen
      scroll
      footer={
        <>
          <Button label="Nog een potje" onPress={() => startGame() && router.replace('/wavelength/turn')} />
          <Button label="Naar instellingen" variant="ghost" onPress={() => router.dismissTo('/wavelength')} />
        </>
      }
    >
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        <Text style={[type.label, { color: teamColor(game.winner) }]}>Winnaar</Text>
        <Text style={type.display}>{winner.name}</Text>
        <Text style={type.small}>
          {winner.score} punten in {rounds} {rounds === 1 ? 'ronde' : 'rondes'}
        </Text>
      </View>
      <Scoreboard game={game} />
    </Screen>
  );
}
