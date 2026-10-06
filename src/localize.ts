import {
  ENGLISH_PIECE_LETTERS,
  FIGURINE_PIECE_LETTERS,
  type EnglishPieceLetter,
  type PieceLetterMap,
  pieceMapForLocale,
  resolveChessNotationLocale,
} from './locales.js'
import { splitTrailingAnnotations } from './san-utils.js'

const EN_PIECE_SET = new Set<string>(ENGLISH_PIECE_LETTERS)
const EN_PROMO_SET = new Set<string>(['Q', 'R', 'B', 'N'])

function isEnglishPieceLetter(ch: string): ch is EnglishPieceLetter {
  return EN_PIECE_SET.has(ch)
}

function isEnglishPromoLetter(ch: string): ch is Exclude<EnglishPieceLetter, 'K'> {
  return EN_PROMO_SET.has(ch)
}

/**
 * Rewrite English promotion suffixes:
 * `e8=Q`, `e8/Q`, `e8(Q)`, bare FIDE `e8Q` / `exf8Q`.
 */
function localizePromotionSuffix(core: string, map: PieceLetterMap): string {
  const equalsOrSlash = /^(.*)([=/])([QRBN])$/.exec(core)
  if (equalsOrSlash) {
    const prefix = equalsOrSlash[1] ?? ''
    const sep = equalsOrSlash[2] ?? ''
    const piece = equalsOrSlash[3] ?? ''
    if (isEnglishPromoLetter(piece)) {
      return prefix + sep + map[piece]
    }
  }

  const paren = /^(.*)\(([QRBN])\)$/.exec(core)
  if (paren) {
    const prefix = paren[1] ?? ''
    const piece = paren[2] ?? ''
    if (isEnglishPromoLetter(piece)) {
      return `${prefix}(${map[piece]})`
    }
  }

  const bare = /^((?:[a-h]x)?[a-h][18])([QRBN])$/.exec(core)
  if (bare) {
    const prefix = bare[1] ?? ''
    const piece = bare[2] ?? ''
    if (isEnglishPromoLetter(piece)) {
      return prefix + map[piece]
    }
  }

  return core
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
 * localizeChessSan('e8Q', 'sv') // 'e8D'
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
  const { core, annotations } = splitTrailingAnnotations(trimmed)
  let body = core

  const first = body[0]
  if (first && isEnglishPieceLetter(first)) {
    body = map[first] + body.slice(1)
  }

  body = localizePromotionSuffix(body, map)

  return lead + body + annotations
}
