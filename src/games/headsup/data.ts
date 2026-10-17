import { CATEGORIES_NL } from '../imposter/data/words.nl';
import { TERM_POOLS } from '../thirty/data/terms.nl';

export interface HeadsUpPool {
  id: string;
  name: string;
  terms: string[];
}

const fromImposter = (id: string): HeadsUpPool => {
  const c = CATEGORIES_NL.find((cat) => cat.id === id);
  if (!c) throw new Error(`Unknown imposter category ${id}`);
  return { id: `imp-${id}`, name: c.name, terms: c.words.map((w) => w.word) };
};

/** Word groups for Wie ben ik?, reusing the 30 Seconds terms and the Imposter words. */
export const HEADSUP_POOLS: HeadsUpPool[] = [
  ...TERM_POOLS.map((p) => ({ id: p.id, name: p.name, terms: p.terms })),
  fromImposter('dieren'),
  fromImposter('eten'),
  fromImposter('beroepen'),
  fromImposter('sport'),
];
