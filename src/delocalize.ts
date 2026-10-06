import {
  ENGLISH_PIECE_LETTERS,
  type EnglishPieceLetter,
  type PieceLetterMap,
  pieceMapForLocale,
  resolveChessNotationLocale,
} from './locales.js'

function reverseMap(map: PieceLetterMap): Map<string, EnglishPieceLetter> {
  const reversed = new Map<string, EnglishPieceLetter>()
  // Longer codes first (future-proof for multi-letter like Кр)
  const entries = ENGLISH_PIECE_LETTERS.map((en) => ({
    en,
    local: map[en],
  })).sort((a, b) => b.local.length - a.local.length)

  for (const { en, local } of entries) {
    // Skip identity mappings so already-English SAN is left alone when possible.
    if (local === en) continue
    if (!reversed.has(local)) reversed.set(local, en)
  }
  return reversed
}

/**
 * Convert localized SAN back to English SAN for chess.js / PGN.
 *
 * Expects locale-formatted input. Already-English SAN is usually left alone
 * when the locale does not reuse English piece letters for other pieces.
 *
 * @example
 * delocalizeChessSan('Pf3', 'nl') // 'Nf3'
 * delocalizeChessSan('e8=D', 'de') // 'e8=Q'
 */
export function delocalizeChessSan(san: string, locale: string): string {
  if (!san) return san
  if (resolveChessNotationLocale(locale) === 'en') return san

  const map = pieceMapForLocale(locale)
  const reversed = reverseMap(map)

  const trimmed = san.trim()
  if (trimmed.length === 0) return san
  if (trimmed.startsWith('O-O') || trimmed.startsWith('0-0')) return san

  const lead = san.slice(0, san.length - trimmed.length)
  let body = trimmed

  for (const [local, en] of reversed) {
    if (body.startsWith(local)) {
      body = en + body.slice(local.length)
      break
    }
  }

  body = body.replace(/=([^\s+#]+)/g, (full, promo: string) => {
    const en = reversed.get(promo)
    return en ? `=${en}` : full
  })

  return lead + body
}
