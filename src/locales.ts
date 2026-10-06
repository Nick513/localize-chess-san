/**
 * English SAN piece letters used by chess.js / PGN.
 * Order: King, Queen, Rook, Bishop, Knight.
 */
export const ENGLISH_PIECE_LETTERS = ['K', 'Q', 'R', 'B', 'N'] as const

export type EnglishPieceLetter = (typeof ENGLISH_PIECE_LETTERS)[number]

/**
 * Locale codes with distinct algebraic piece letters.
 * Prefer BCP-47 language subtags (`nl`, `de`, …).
 */
export type ChessNotationLocale =
  | 'en'
  | 'nl'
  | 'de'
  | 'fr'
  | 'es'
  | 'it'
  | 'pt'
  | 'pl'
  | 'cs'
  | 'sk'
  | 'da'
  | 'nb'
  | 'sv'
  | 'fi'
  | 'hu'
  | 'ro'
  | 'tr'
  | 'id'
  | 'ca'

/**
 * Localized piece letters as K,Q,R,B,N replacements.
 * Values may be multi-character for some future locales (e.g. Russian Кр).
 */
export type PieceLetterMap = Record<EnglishPieceLetter, string>

/**
 * Curated maps for common chess locales.
 * Source of truth inspiration: Wikipedia “Algebraic notation (chess)”.
 * Interchange / PGN / engines should still use English letters.
 */
export const PIECE_LETTERS_BY_LOCALE: Record<ChessNotationLocale, PieceLetterMap> =
  {
    en: { K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N' },
    /** koning, dame, toren, loper, paard */
    nl: { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'P' },
    /** König, Dame, Turm, Läufer, Springer */
    de: { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'S' },
    /** roi, dame, tour, fou, cavalier */
    fr: { K: 'R', Q: 'D', R: 'T', B: 'F', N: 'C' },
    /** rey, dama, torre, alfil, caballo */
    es: { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' },
    /** re, donna, torre, alfiere, cavallo */
    it: { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' },
    /** rei, dama, torre, bispo, cavalo */
    pt: { K: 'R', Q: 'D', R: 'T', B: 'B', N: 'C' },
    /** król, hetman, wieża, goniec, skoczek */
    pl: { K: 'K', Q: 'H', R: 'W', B: 'G', N: 'S' },
    /** král, dáma, věž, střelec, jezdec */
    cs: { K: 'K', Q: 'D', R: 'V', B: 'S', N: 'J' },
    /** kráľ, dáma, veža, strelec, jazdec */
    sk: { K: 'K', Q: 'D', R: 'V', B: 'S', N: 'J' },
    /** konge, dronning, tårn, løber, springer */
    da: { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'S' },
    /** konge, dronning, tårn, løper, springer (Bokmål) */
    nb: { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'S' },
    /** kung, dam, torn, löpare, springare (S; sv.wikipedia.org/wiki/Schacknotation) */
    sv: { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'S' },
    /** kuningas, daami, torni, lähetti, ratsu */
    fi: { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'R' },
    /** király, vezér, bástya, futó, huszár */
    hu: { K: 'K', Q: 'V', R: 'B', B: 'F', N: 'H' },
    /** rege, damă, turn, nebun, cal */
    ro: { K: 'R', Q: 'D', R: 'T', B: 'N', N: 'C' },
    /** şah, vezir, kale, fil, at */
    tr: { K: 'Ş', Q: 'V', R: 'K', B: 'F', N: 'A' },
    /** raja, menteri, benteng, gajah, kuda */
    id: { K: 'R', Q: 'M', R: 'B', B: 'G', N: 'K' },
    /** rei, dama, torre, alfil, cavall */
    ca: { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' },
  }

/** Unicode figurines corresponding to K,Q,R,B,N (white pieces as convention). */
export const FIGURINE_PIECE_LETTERS: PieceLetterMap = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
}

export function normalizeLocale(locale: string): string {
  const short = locale.split('-')[0]?.trim().toLowerCase()
  return short && short.length > 0 ? short : 'en'
}

/**
 * Resolve a BCP-47 language tag to a supported notation locale.
 * Unknown languages fall back to English.
 */
export function resolveChessNotationLocale(
  language: string,
): ChessNotationLocale {
  const code = normalizeLocale(language)
  if (code in PIECE_LETTERS_BY_LOCALE) {
    return code as ChessNotationLocale
  }
  // Norwegian Nynorsk → same letters as Bokmål for pieces
  if (code === 'nn' || code === 'no') return 'nb'
  return 'en'
}

export function pieceMapForLocale(locale: string): PieceLetterMap {
  const resolved = resolveChessNotationLocale(locale)
  return PIECE_LETTERS_BY_LOCALE[resolved]
}

export function supportedLocales(): ChessNotationLocale[] {
  return Object.keys(PIECE_LETTERS_BY_LOCALE) as ChessNotationLocale[]
}
