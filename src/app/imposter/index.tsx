import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { maxImposters, MIN_PLAYERS } from '@/games/imposter/logic';
import { useImposter } from '@/games/imposter/store';
import type { GameMode } from '@/games/imposter/types';
import { Button, Chip, Screen, Section, Segmented, Stepper } from '@/ui/components';
import { colors, radius, space, type } from '@/ui/theme';

const MODE_INFO: Record<GameMode, string> = {
  hint: 'De imposter weet dat hij de imposter is en krijgt één hintwoord om mee te bluffen.',
  undercover: 'De imposter krijgt een vergelijkbaar woord en weet zelf niet dat hij de imposter is.',
};

const TIMER_OPTIONS = [
  { value: 0, label: 'Uit' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
];

export default function ImposterSetup() {
  const { ready, players, setPlayers, settings, updateSettings, categories, startRound } = useImposter();

  const named = players.map((p) => p.trim()).filter(Boolean);
  const lowerNames = named.map((n) => n.toLowerCase());
  const hasDuplicates = new Set(lowerNames).size !== lowerNames.length;
  const canStart = ready && named.length >= MIN_PLAYERS && !hasDuplicates && settings.categoryIds.length > 0;
  const maxK = maxImposters(named.length);

  const updatePlayer = (i: number, name: string) => setPlayers(players.map((p, j) => (j === i ? name : p)));
  const removePlayer = (i: number) => setPlayers(players.filter((_, j) => j !== i));
  const addPlayer = () => setPlayers([...players, '']);

  const allSelected = settings.categoryIds.length === categories.length;
  const toggleCategory = (id: string) => {
    const has = settings.categoryIds.includes(id);
    updateSettings({ categoryIds: has ? settings.categoryIds.filter((c) => c !== id) : [...settings.categoryIds, id] });
  };

  const start = () => {
    if (startRound()) router.push('/imposter/reveal');
  };

  let footerNote = '';
  if (named.length < MIN_PLAYERS) footerNote = `Voeg minimaal ${MIN_PLAYERS} spelers toe`;
  else if (hasDuplicates) footerNote = 'Elke speler heeft een unieke naam nodig';
  else if (!settings.categoryIds.length) footerNote = 'Kies minimaal één categorie';

  return (
    <Screen
      scroll
      footer={
        <>
          {footerNote ? <Text style={[type.small, { textAlign: 'center' }]}>{footerNote}</Text> : null}
          <Button label="Start ronde" onPress={start} disabled={!canStart} />
        </>
      }
    >
      <View style={{ gap: space.xs }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={type.small}>‹ Spellen</Text>
        </Pressable>
        <Text style={type.title}>Imposter</Text>
      </View>

      <Section label={`Spelers · ${named.length}`}>
        <View style={{ gap: space.sm }}>
          {players.map((name, i) => (
            <View key={i} style={styles.playerRow}>
              <Text style={styles.playerNumber}>{i + 1}</Text>
              <TextInput
                value={name}
                onChangeText={(t) => updatePlayer(i, t)}
                placeholder={`Speler ${i + 1}`}
                placeholderTextColor={colors.muted}
                style={styles.input}
                maxLength={20}
                autoCapitalize="words"
                returnKeyType="done"
              />
              <Pressable
                onPress={() => removePlayer(i)}
                accessibilityRole="button"
                accessibilityLabel={`Verwijder ${name || `speler ${i + 1}`}`}
                hitSlop={8}
                style={styles.remove}
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <Button label="+ Speler toevoegen" variant="secondary" onPress={addPlayer} />
      </Section>

      <Section label="Modus" hint={MODE_INFO[settings.mode]}>
        <Segmented<GameMode>
          options={[
            { value: 'hint', label: 'Hint' },
            { value: 'undercover', label: 'Undercover' },
          ]}
          value={settings.mode}
          onChange={(mode) => updateSettings({ mode })}
        />
      </Section>

      {settings.mode === 'hint' ? (
        <View style={styles.switchRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={type.heading}>Toon categorie aan imposter</Text>
            <Text style={type.small}>Maakt het makkelijker voor de imposter.</Text>
          </View>
          <Switch
            value={settings.showCategory}
            onValueChange={(showCategory) => updateSettings({ showCategory })}
            trackColor={{ true: colors.accent, false: colors.border }}
          thumbColor="#FFFFFF"
          />
        </View>
      ) : null}

      <Section label="Aantal imposters" hint={named.length >= MIN_PLAYERS ? `Maximaal ${maxK} bij ${named.length} spelers.` : undefined}>
        <Stepper
          value={Math.min(settings.imposterCount, maxK)}
          min={1}
          max={maxK}
          onChange={(imposterCount) => updateSettings({ imposterCount })}
        />
      </Section>

      <Section label="Categorieën">
        <View style={styles.chips}>
          <Chip
            label="Alles"
            active={allSelected}
            onPress={() => updateSettings({ categoryIds: allSelected ? [] : categories.map((c) => c.id) })}
          />
          {categories.map((c) => (
            <Chip key={c.id} label={c.name} active={settings.categoryIds.includes(c.id)} onPress={() => toggleCategory(c.id)} />
          ))}
        </View>
      </Section>

      <Section label="Discussietimer">
        <Segmented options={TIMER_OPTIONS} value={settings.timerSeconds} onChange={(timerSeconds) => updateSettings({ timerSeconds })} />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingLeft: space.lg,
  },
  playerNumber: { width: 22, fontSize: 14, color: colors.muted, fontVariant: ['tabular-nums'] },
  input: { flex: 1, fontSize: 16, color: colors.text, minHeight: 50 },
  remove: { width: 48, height: 50, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 22, color: colors.muted },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
