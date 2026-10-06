import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  delocalizeChessSan,
  localizeChessSan,
  resolveChessNotationLocale,
  supportedLocales,
} from '../dist/index.js'

describe('resolveChessNotationLocale', () => {
  it('normalizes BCP-47 tags', () => {
    assert.equal(resolveChessNotationLocale('nl-NL'), 'nl')
    assert.equal(resolveChessNotationLocale('de-AT'), 'de')
    assert.equal(resolveChessNotationLocale('en-US'), 'en')
  })

  it('falls back to English for unknown locales', () => {
    assert.equal(resolveChessNotationLocale('xx'), 'en')
  })

  it('maps Norwegian tags to Bokmål letters', () => {
    assert.equal(resolveChessNotationLocale('nn'), 'nb')
    assert.equal(resolveChessNotationLocale('no'), 'nb')
  })
})

describe('localizeChessSan', () => {
  it('leaves English unchanged', () => {
    assert.equal(localizeChessSan('Nf3', 'en'), 'Nf3')
    assert.equal(localizeChessSan('Qxe5+', 'en-US'), 'Qxe5+')
  })

  it('localizes Dutch piece letters', () => {
    assert.equal(localizeChessSan('Nf3', 'nl'), 'Pf3')
    assert.equal(localizeChessSan('Qf2', 'nl'), 'Df2')
    assert.equal(localizeChessSan('Raxd1', 'nl'), 'Taxd1')
    assert.equal(localizeChessSan('Bxc4', 'nl'), 'Lxc4')
  })

  it('localizes German piece letters', () => {
    assert.equal(localizeChessSan('Nf3', 'de'), 'Sf3')
    assert.equal(localizeChessSan('Qb8+', 'de'), 'Db8+')
  })

  it('localizes Swedish knight as S (springare)', () => {
    assert.equal(localizeChessSan('Nf3', 'sv'), 'Sf3')
    assert.equal(localizeChessSan('Nc6', 'sv'), 'Sc6')
  })

  it('localizes French / Spanish / Italian knights and kings', () => {
    assert.equal(localizeChessSan('Nf3', 'fr'), 'Cf3')
    assert.equal(localizeChessSan('Ke2', 'fr'), 'Re2')
    assert.equal(localizeChessSan('Bc4', 'es'), 'Ac4')
    assert.equal(localizeChessSan('Nf6', 'it'), 'Cf6')
  })

  it('leaves pawn moves and castling unchanged', () => {
    assert.equal(localizeChessSan('e4', 'nl'), 'e4')
    assert.equal(localizeChessSan('exd5', 'de'), 'exd5')
    assert.equal(localizeChessSan('O-O', 'nl'), 'O-O')
    assert.equal(localizeChessSan('O-O-O', 'fr'), 'O-O-O')
  })

  it('localizes promotion suffixes in common spellings', () => {
    assert.equal(localizeChessSan('e8=Q', 'nl'), 'e8=D')
    assert.equal(localizeChessSan('a1=N', 'de'), 'a1=S')
    assert.equal(localizeChessSan('e8=Q', 'fr'), 'e8=D')
    assert.equal(localizeChessSan('e8Q', 'sv'), 'e8D')
    assert.equal(localizeChessSan('exf8Q', 'sv'), 'exf8D')
    assert.equal(localizeChessSan('e8/Q', 'nl'), 'e8/D')
    assert.equal(localizeChessSan('e8(Q)', 'de'), 'e8(D)')
  })

  it('preserves annotation marks on promotions', () => {
    assert.equal(localizeChessSan('e8=Q!', 'nl'), 'e8=D!')
    assert.equal(localizeChessSan('e8=Q!?', 'nl'), 'e8=D!?')
    assert.equal(localizeChessSan('e8Q+', 'sv'), 'e8D+')
  })

  it('supports figurine style', () => {
    assert.equal(localizeChessSan('Nf3', 'en', { figurine: true }), '♘f3')
    assert.equal(localizeChessSan('Qxe5', 'nl', { figurine: true }), '♕xe5')
  })
})

describe('delocalizeChessSan', () => {
  it('round-trips common locales', () => {
    const samples = [
      'Nf3',
      'Qxe5+',
      'Raxd1',
      'Bxc4',
      'e8=Q',
      'e8=Q!',
      'e8Q',
      'exf8Q',
      'e8/Q',
      'e8(Q)',
      'Ke2',
      'Nbd2',
      'R1a3',
    ]
    for (const locale of [
      'nl',
      'de',
      'fr',
      'es',
      'pl',
      'sv',
      'tr',
      'ro',
      'fi',
      'hu',
      'id',
    ] as const) {
      for (const san of samples) {
        const localized = localizeChessSan(san, locale)
        assert.equal(
          delocalizeChessSan(localized, locale),
          san,
          `${locale}: ${san} → ${localized}`,
        )
      }
    }
  })

  it('leaves English knight input alone for Dutch', () => {
    // Dutch does not reuse N as another piece letter, so English SAN is safe.
    assert.equal(delocalizeChessSan('Nf3', 'nl'), 'Nf3')
  })

  it('documents English-letter collisions under colliding locales', () => {
    assert.equal(delocalizeChessSan('Raxd1', 'fr'), 'Kaxd1')
    assert.equal(delocalizeChessSan('Nf3', 'ro'), 'Bf3')
    assert.equal(delocalizeChessSan('Ke2', 'tr'), 'Re2')
  })
})

describe('supportedLocales', () => {
  it('includes core European locales', () => {
    const locales = supportedLocales()
    for (const code of ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'sv']) {
      assert.ok(locales.includes(code as never), code)
    }
  })
})
