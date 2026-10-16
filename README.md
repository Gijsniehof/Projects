# Partyspellen

Dutch party-games app (Expo + TypeScript + Expo Router). Pass-and-play on one phone.

## Run

```bash
npm install
npx expo start          # scan the QR code with Expo Go on Android
npm run typecheck
```

APK: `npx eas-cli@latest build -p android --profile preview` (set `"buildType": "apk"` in `eas.json` for the preview profile).

## Structure

```
src/app/                    routes (Expo Router)
  index.tsx                 game hub; add new games to GAMES
  imposter/                 setup → reveal → play → result
  thirty/                   setup → turn → check → scores
src/games/imposter/
  data/words.nl.ts          curated Dutch words, hints, undercover words
  logic.ts                  pure game logic (role assignment, word picking)
  store.tsx                 state + AsyncStorage persistence
src/games/thirty/
  data/terms.nl.ts          Dutch terms: Algemeen, Personen, Nederland (one per line)
  logic.ts                  card drawing, turn order, scoring, win/tiebreak
  store.tsx                 state + persistence (a game in progress survives closing the app)
src/ui/                     shared theme, components and back-button guard
```

## Imposter modes

- **Hint**: the imposter knows their role and sees one hint word (optionally the category too).
- **Undercover**: the imposter gets a similar word and doesn't know they're the imposter.

Rules in code: imposters $k$ stay a minority, $1 \le k \le \lfloor (n-1)/2 \rfloor$ for $n$ players. In hint mode the starting player is never an imposter. The last 60 words are remembered so they don't repeat.

## 30 Seconds rules

Teams take turns; a describer (rotating through the team's players, if named) gets a card of 5 terms mixed from the chosen groups and has 30/45/60 s. Afterwards the team ticks off what was guessed: 1 point per term, no dice. When a team reaches the target, the round is finished so every team has had the same number of turns; the highest score wins, and a tie at the top plays another round.
