export interface WordEntry {
  word: string;
  /** Loose associations shown to the imposter in "hint" mode. */
  hints: string[];
  /** Related-but-different words given to the undercover player. */
  similar: string[];
}

export interface Category {
  id: string;
  name: string;
  words: WordEntry[];
}

/**
 * hint:       imposter knows they are the imposter and gets one hint word.
 * undercover: imposter gets a similar word and does NOT know they are the imposter.
 */
export type GameMode = 'hint' | 'undercover';

export interface ImposterSettings {
  mode: GameMode;
  imposterCount: number;
  categoryIds: string[];
  /** Hint mode only: also show the category name to the imposter. */
  showCategory: boolean;
  /** Discussion timer in seconds, 0 = off. */
  timerSeconds: number;
}

export interface Round {
  mode: GameMode;
  players: string[];
  categoryId: string;
  categoryName: string;
  secretWord: string;
  /** Indices into `players`. */
  imposters: number[];
  /** Hint mode: the hint the imposter sees. */
  hint?: string;
  /** Undercover mode: the word the undercover player sees. */
  undercoverWord?: string;
  showCategory: boolean;
  startingPlayer: number;
}

/** What one player sees when they flip their card. */
export type RoleCard =
  | { kind: 'word'; word: string; category: string }
  | { kind: 'imposter'; hint?: string; category?: string };
