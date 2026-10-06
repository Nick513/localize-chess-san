# localize-chess-san

Localize chess **algebraic notation** piece letters for display.

PGN, chess.js, and engines speak English SAN (`Nf3`). Players in many countries expect local letters (`Pf3` in Dutch, `Sf3` in German, `Cf3` in French).

This tiny zero-dependency library converts between them.

```ts
import { localizeChessSan, delocalizeChessSan } from 'localize-chess-san'

localizeChessSan('Nf3', 'nl')   // 'Pf3'
localizeChessSan('Qxe5+', 'de') // 'Dxe5+'
localizeChessSan('e8=Q', 'fr')  // 'e8=D'

delocalizeChessSan('Pf3', 'nl') // 'Nf3'  → safe for chess.js
```

Figurine algebraic notation is also supported:

```ts
localizeChessSan('Nf3', 'en', { figurine: true }) // '♘f3'
```

## Why this exists

- **Storage / interchange stays English** (PGN / FIDE / engines)
- **UI can show local letters** your players expect
- Same problem shows up in every serious chess app; this keeps the map in one place

## Install

```bash
npm install localize-chess-san
```

## API

### `localizeChessSan(san, locale, options?)`

English SAN → localized letters (or figurines).

### `delocalizeChessSan(san, locale)`

Localized SAN → English SAN for parsing / engines.

### `resolveChessNotationLocale(language)`

Map a BCP-47 tag (`nl-NL`) to a supported locale (`nl`). Unknown → `en`.

### `supportedLocales()`

List of locales with piece-letter maps.

## Supported locales (v0.1)

| Locale | King | Queen | Rook | Bishop | Knight | Example |
|--------|------|-------|------|--------|--------|---------|
| `en` | K | Q | R | B | N | Nf3 |
| `nl` | K | D | T | L | P | Pf3 |
| `de` | K | D | T | L | S | Sf3 |
| `fr` | R | D | T | F | C | Cf3 |
| `es` | R | D | T | A | C | Cf3 |
| `it` | R | D | T | A | C | Cf3 |
| `pt` | R | D | T | B | C | Cf3 |
| `pl` | K | H | W | G | S | Sf3 |
| `cs` / `sk` | K | D | V | S | J | Jf3 |
| `da` / `nb` | K | D | T | L | S | Sf3 |
| `sv` | K | D | T | L | H | Hf3 |
| `fi` | K | D | T | L | R | Rf3 |
| `hu` | K | V | B | F | H | Hf3 |
| `ro` | R | D | T | N | C | Cf3 |
| `tr` | Ş | V | K | F | A | Af3 |
| `id` | R | M | B | G | K | Kf3 |
| `ca` | R | D | T | A | C | Cf3 |

Pawn moves (`e4`, `exd5`) and castling (`O-O`) are unchanged.

More locales (including multi-letter codes like Russian `Кр`) are welcome via PR.

## Design notes

- **Display-layer only**: do not write localized SAN into PGN files
- Castling accepts `O-O` and `0-0`
- Promotion suffixes are localized (`e8=Q` → `e8=D`)
- `delocalize` tolerates already-English input

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT
