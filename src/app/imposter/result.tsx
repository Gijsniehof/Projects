import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useImposter } from '@/games/imposter/store';
import { Button, Card, Screen } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function Result() {
  const { round, startRound } = useImposter();
  if (!round) return <Redirect href="/imposter" />;

  const names = round.imposters.map((i) => round.players[i]);
  const plural = names.length > 1;

  const again = () => {
    if (startRound()) router.replace('/imposter/reveal');
  };

  return (
    <Screen
      scroll
      footer={
        <>
          <Button label="Nieuwe ronde" onPress={again} />
          <Button label="Spelers en instellingen" variant="ghost" onPress={() => router.dismissTo('/imposter')} />
        </>
      }
    >
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        <Text style={[type.label, { color: colors.imposter }]}>{plural ? 'De imposters waren' : 'De imposter was'}</Text>
        {names.map((n) => (
          <Text key={n} style={type.display}>
            {n}
          </Text>
        ))}
      </View>

      <Card style={{ gap: space.lg }}>
        <Row label="Het woord" value={round.secretWord} />
        <Row label="Categorie" value={round.categoryName} />
        {round.mode === 'hint' && round.hint ? <Row label="Hint van de imposter" value={round.hint} /> : null}
        {round.mode === 'undercover' && round.undercoverWord ? (
          <Row label={plural ? 'Woord van de undercovers' : 'Woord van de undercover'} value={round.undercoverWord} />
        ) : null}
      </Card>

      <Text style={type.small}>
        {round.mode === 'hint'
          ? `Gepakt? Dan mag de imposter nog één keer het woord raden. Goed geraden betekent dat de imposter alsnog wint.`
          : plural
            ? `Hadden de undercovers door dat ze een ander woord hadden? In undercover-modus weten de imposters het zelf niet.`
            : `Had de undercover door dat hij een ander woord had? In undercover-modus weet de imposter het zelf niet.`}
      </Text>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={type.small}>{label}</Text>
      <Text style={type.heading}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.lg },
});
