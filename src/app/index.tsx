import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/ui/components';
import { colors, radius, space, type } from '@/ui/theme';

interface GameTile {
  title: string;
  description: string;
  players: string;
  href?: '/imposter' | '/thirty' | '/headsup' | '/wavelength';
}

/** Add new games here as they are built. */
const GAMES: GameTile[] = [
  {
    title: 'Imposter',
    description: 'Iedereen kent het woord, behalve de imposter. Wie bluft er?',
    players: '3+ spelers',
    href: '/imposter',
  },
  {
    title: '30 Seconds',
    description: 'Omschrijf zoveel mogelijk begrippen binnen 30 seconden.',
    players: '2+ teams',
    href: '/thirty',
  },
  {
    title: 'Wie ben ik?',
    description: 'Telefoon op je voorhoofd, de groep omschrijft. Kantel om te scoren.',
    players: '2+ spelers',
    href: '/headsup',
  },
  {
    title: 'Op dezelfde golflengte',
    description: 'Eén hint, één wijzer. Zit je team op dezelfde golflengte?',
    players: '2+ teams',
    href: '/wavelength',
  },
];

export default function Hub() {
  return (
    <Screen scroll>
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        <Text style={type.display}>Partyspellen</Text>
        <Text style={type.small}>Kies een spel. Eén telefoon, de hele groep.</Text>
      </View>

      <View style={{ gap: space.md }}>
        {GAMES.map((g) => {
          const available = Boolean(g.href);
          return (
            <Pressable
              key={g.title}
              accessibilityRole="button"
              accessibilityState={{ disabled: !available }}
              disabled={!available}
              onPress={() => g.href && router.push(g.href)}
              style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }, !available && { opacity: 0.5 }]}
            >
              <View style={styles.tileHeader}>
                <Text style={type.title}>{g.title}</Text>
                <Text style={styles.badge}>{available ? g.players : 'Binnenkort'}</Text>
              </View>
              <Text style={type.small}>{g.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.xl,
    gap: space.sm,
  },
  tileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    backgroundColor: colors.soft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
