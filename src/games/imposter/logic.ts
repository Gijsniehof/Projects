import type { Category, ImposterSettings, RoleCard, Round, WordEntry } from './types';

export type Rng = () => number;

export const MIN_PLAYERS = 3;

/** Imposters must stay a minority: k ≤ ⌊(n − 1) / 2⌋, and at least 1. */
export function maxImposters(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

export function randomInt(max: number, rng: Rng = Math.random): number {
  return Math.floor(rng() * max);
}

export function pick<T>(items: readonly T[], rng: Rng = Math.random): T {
  return items[randomInt(items.length, rng)];
}

/** Fisher–Yates shuffle, returns a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const wordKey = (categoryId: string, word: string) => `${categoryId}:${word}`;

/**
 * Picks a word from the selected categories, avoiding recently used ones.
 * When every candidate has been used, it falls back to the full pool.
 */
export function pickWord(
  categories: Category[],
  categoryIds: string[],
  recent: ReadonlySet<string>,
  rng: Rng = Math.random,
): { category: Category; entry: WordEntry } {
  const selected = categories.filter((c) => categoryIds.includes(c.id));
  const pool = (selected.length ? selected : categories).flatMap((category) =>
    category.words.map((entry) => ({ category, entry })),
  );
  const fresh = pool.filter((p) => !recent.has(wordKey(p.category.id, p.entry.word)));
  return pick(fresh.length ? fresh : pool, rng);
}

export function createRound(
  players: string[],
  settings: ImposterSettings,
  categories: Category[],
  recent: ReadonlySet<string>,
  rng: Rng = Math.random,
): Round {
  if (players.length < MIN_PLAYERS) {
    throw new Error(`Minimaal ${MIN_PLAYERS} spelers nodig`);
  }
  const k = Math.min(Math.max(1, settings.imposterCount), maxImposters(players.length));
  const { category, entry } = pickWord(categories, settings.categoryIds, recent, rng);

  const imposters = shuffle(
    players.map((_, i) => i),
    rng,
  )
    .slice(0, k)
    .sort((a, b) => a - b);

  // In hint mode the imposter knows their role, so letting them open the
  // clue round is unfair to them; pick the starter from the crew. In
  // undercover mode nobody knows, so anyone can start.
  const starterPool =
    settings.mode === 'hint' ? players.map((_, i) => i).filter((i) => !imposters.includes(i)) : players.map((_, i) => i);

  return {
    mode: settings.mode,
    players: [...players],
    categoryId: category.id,
    categoryName: category.name,
    secretWord: entry.word,
    imposters,
    hint: settings.mode === 'hint' ? pick(entry.hints, rng) : undefined,
    undercoverWord: settings.mode === 'undercover' ? pick(entry.similar, rng) : undefined,
    showCategory: settings.showCategory,
    startingPlayer: pick(starterPool, rng),
  };
}

export function roleCardFor(round: Round, playerIndex: number): RoleCard {
  const isImposter = round.imposters.includes(playerIndex);
  if (!isImposter) {
    return { kind: 'word', word: round.secretWord, category: round.categoryName };
  }
  if (round.mode === 'undercover') {
    // Looks exactly like a normal card, so the player can't tell.
    return { kind: 'word', word: round.undercoverWord ?? round.secretWord, category: round.categoryName };
  }
  return {
    kind: 'imposter',
    hint: round.hint,
    category: round.showCategory ? round.categoryName : undefined,
  };
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
