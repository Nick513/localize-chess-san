import {
  ENGLISH_PIECE_LETTERS,
  FIGURINE_PIECE_LETTERS,
  type EnglishPieceLetter,
  pieceMapForLocale,
  resolveChessNotationLocale,
} from './locales.js'

const EN_PIECE_SET = new Set<string>(ENGLISH_PIECE_LETTERS)

function isEnglishPieceLetter(ch: string): ch is EnglishPieceLetter {
  return EN_PIECE_SET.has(ch)
}

export type LocalizeSanOptions = {
  /**
   * Use Unicode figurines (♔♕♖♗♘) instead of language letters.
   * Overrides locale piece letters when true.
   */
  figurine?: boolean
}

/**
 * Convert English SAN (chess.js / PGN) to locale piece letters.
 *
 * @example
 * localizeChessSan('Nf3', 'nl') // 'Pf3'
 * localizeChessSan('Qxe5+', 'de') // 'Dxe5+'
 * localizeChessSan('e8=Q', 'fr') // 'e8=D'
 * localizeChessSan('Nf3', 'en', { figurine: true }) // '♘f3'
 */
export function localizeChessSan(
  san: string,
  locale: string,
  options: LocalizeSanOptions = {},
): string {
  if (!san) return san

  const map = options.figurine
    ? FIGURINE_PIECE_LETTERS
    : pieceMapForLocale(locale)

  if (!options.figurine && resolveChessNotationLocale(locale) === 'en') {
    return san
  }

  const trimmed = san.trim()
  if (trimmed.length === 0) return san
  if (trimmed.startsWith('O-O') || trimmed.startsWith('0-0')) return san

  const lead = san.slice(0, san.length - trimmed.length)
  let body = trimmed

  const first = body[0]
  if (first && isEnglishPieceLetter(first)) {
    body = map[first] + body.slice(1)
  }

  body = body.replace(/=([QRBN])/g, (_, piece: string) => {
    if (!isEnglishPieceLetter(piece)) return `=${piece}`
    return `=${map[piece]}`
  })

  return lead + body
}
