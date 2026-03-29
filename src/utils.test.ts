import { describe, expect, it } from 'vitest'
import { formatRate, parseAmount, roundCurrency } from './utils'

describe('currency utils', () => {
  it('formats converted amounts to two decimal places', () => {
    expect(roundCurrency(1234.5)).toBe('1,234.50')
  })

  it('formats rates to four decimal places', () => {
    expect(formatRate(1.23456)).toBe('1.2346')
  })

  it('parses valid positive amounts and rejects invalid ones', () => {
    expect(parseAmount('42')).toBe(42)
    expect(parseAmount('-5')).toBe(0)
    expect(parseAmount('abc')).toBe(0)
  })
})
