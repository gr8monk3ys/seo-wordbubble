import { describe, it, expect } from 'vitest'
import { INTENT_COLORS, INTENT_LABELS, DIFFICULTY_OPACITY } from './constants'

describe('INTENT_COLORS', () => {
  it('should have colors for all search intents', () => {
    expect(INTENT_COLORS.informational).toBeDefined()
    expect(INTENT_COLORS.navigational).toBeDefined()
    expect(INTENT_COLORS.transactional).toBeDefined()
    expect(INTENT_COLORS.commercial).toBeDefined()
  })

  it('should have valid hex color values', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/

    expect(INTENT_COLORS.informational).toMatch(hexColorRegex)
    expect(INTENT_COLORS.navigational).toMatch(hexColorRegex)
    expect(INTENT_COLORS.transactional).toMatch(hexColorRegex)
    expect(INTENT_COLORS.commercial).toMatch(hexColorRegex)
  })

  it('should have distinct colors for each intent', () => {
    const colors = Object.values(INTENT_COLORS)
    const uniqueColors = new Set(colors)

    expect(uniqueColors.size).toBe(colors.length)
  })
})

describe('INTENT_LABELS', () => {
  it('should have labels for all search intents', () => {
    expect(INTENT_LABELS.informational).toBe('Informational')
    expect(INTENT_LABELS.navigational).toBe('Navigational')
    expect(INTENT_LABELS.transactional).toBe('Transactional')
    expect(INTENT_LABELS.commercial).toBe('Commercial')
  })

  it('should have the same keys as INTENT_COLORS', () => {
    const colorKeys = Object.keys(INTENT_COLORS).sort()
    const labelKeys = Object.keys(INTENT_LABELS).sort()

    expect(colorKeys).toEqual(labelKeys)
  })
})

describe('DIFFICULTY_OPACITY', () => {
  it('should have opacity values for all difficulty levels', () => {
    expect(DIFFICULTY_OPACITY.low).toBeDefined()
    expect(DIFFICULTY_OPACITY.medium).toBeDefined()
    expect(DIFFICULTY_OPACITY.high).toBeDefined()
  })

  it('should have values between 0 and 1', () => {
    expect(DIFFICULTY_OPACITY.low).toBeGreaterThanOrEqual(0)
    expect(DIFFICULTY_OPACITY.low).toBeLessThanOrEqual(1)
    expect(DIFFICULTY_OPACITY.medium).toBeGreaterThanOrEqual(0)
    expect(DIFFICULTY_OPACITY.medium).toBeLessThanOrEqual(1)
    expect(DIFFICULTY_OPACITY.high).toBeGreaterThanOrEqual(0)
    expect(DIFFICULTY_OPACITY.high).toBeLessThanOrEqual(1)
  })

  it('should have decreasing opacity as difficulty increases', () => {
    expect(DIFFICULTY_OPACITY.low).toBeGreaterThan(DIFFICULTY_OPACITY.medium)
    expect(DIFFICULTY_OPACITY.medium).toBeGreaterThan(DIFFICULTY_OPACITY.high)
  })
})
