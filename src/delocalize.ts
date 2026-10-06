import {
  ENGLISH_PIECE_LETTERS,
  type EnglishPieceLetter,
  type PieceLetterMap,
  pieceMapForLocale,
  resolveChessNotationLocale,
} from './locales.js'
import { escapeRegExp, splitTrailingAnnotations } from './san-utils.js'

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
 * Rewrite localized promotion suffixes back to English:
 * `e8=D`, `e8/D`, `e8(D)`, bare `e8D` / `exf8D`.
 */
function delocalizePromotionSuffix(
  core: string,
  reversed: Map<string, EnglishPieceLetter>,
): string {
  for (const [local, en] of reversed) {
    const escaped = escapeRegExp(local)

    const equalsOrSlash = new RegExp(`^(.*)([=/])${escaped}$`).exec(core)
    if (equalsOrSlash) {
      return `${equalsOrSlash[1] ?? ''}${equalsOrSlash[2] ?? ''}${en}`
    }

    const paren = new RegExp(`^(.*)\\(${escaped}\\)$`).exec(core)
    if (paren) {
      return `${paren[1] ?? ''}(${en})`
    }

    const bare = new RegExp(`^((?:[a-h]x)?[a-h][18])${escaped}$`).exec(core)
    if (bare) {
      return `${bare[1] ?? ''}${en}`
    }
  }

  return core
}

/**
 * Convert localized SAN back to English SAN for chess.js / PGN.
 *
 * Expects locale-formatted input. Already-English SAN is left alone only when
 * the locale does not reuse K/Q/R/B/N for a different piece (e.g. Dutch is
 * usually safe; French `R` is the king and will be read as such).
 *
 * @example
 * delocalizeChessSan('Pf3', 'nl') // 'Nf3'
 * delocalizeChessSan('e8=D', 'de') // 'e8=Q'
 * delocalizeChessSan('exf8D', 'sv') // 'exf8Q'
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
  const { core, annotations } = splitTrailingAnnotations(trimmed)
  let body = core

  for (const [local, en] of reversed) {
    if (body.startsWith(local)) {
      body = en + body.slice(local.length)
      break
    }
  }

  body = delocalizePromotionSuffix(body, reversed)

  return lead + body + annotations
}
