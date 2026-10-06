export {
  ENGLISH_PIECE_LETTERS,
  FIGURINE_PIECE_LETTERS,
  PIECE_LETTERS_BY_LOCALE,
  normalizeLocale,
  pieceMapForLocale,
  resolveChessNotationLocale,
  supportedLocales,
  type ChessNotationLocale,
  type EnglishPieceLetter,
  type PieceLetterMap,
} from './locales.js'

export { localizeChessSan, type LocalizeSanOptions } from './localize.js'
export { delocalizeChessSan } from './delocalize.js'
