import { describe, it, expect } from 'vitest'
import {
  SearchIntentSchema,
  DifficultySchema,
  KeywordDataSchema,
  KeywordDataArraySchema
} from './keywords'

describe('SearchIntentSchema', () => {
  it('should accept valid search intents', () => {
    expect(SearchIntentSchema.parse('informational')).toBe('informational')
    expect(SearchIntentSchema.parse('navigational')).toBe('navigational')
    expect(SearchIntentSchema.parse('transactional')).toBe('transactional')
    expect(SearchIntentSchema.parse('commercial')).toBe('commercial')
  })

  it('should reject invalid search intents', () => {
    expect(() => SearchIntentSchema.parse('invalid')).toThrow()
    expect(() => SearchIntentSchema.parse('')).toThrow()
    expect(() => SearchIntentSchema.parse(123)).toThrow()
  })
})

describe('DifficultySchema', () => {
  it('should accept valid difficulty levels', () => {
    expect(DifficultySchema.parse('low')).toBe('low')
    expect(DifficultySchema.parse('medium')).toBe('medium')
    expect(DifficultySchema.parse('high')).toBe('high')
  })

  it('should reject invalid difficulty levels', () => {
    expect(() => DifficultySchema.parse('easy')).toThrow()
    expect(() => DifficultySchema.parse('hard')).toThrow()
    expect(() => DifficultySchema.parse(null)).toThrow()
  })
})

describe('KeywordDataSchema', () => {
  const validKeyword = {
    text: 'seo optimization',
    size: 850,
    relevanceScore: 85,
    searchIntent: 'informational',
    difficulty: 'medium',
    variations: ['seo tips', 'best seo practices']
  }

  it('should accept valid keyword data', () => {
    const result = KeywordDataSchema.parse(validKeyword)

    expect(result.text).toBe('seo optimization')
    expect(result.size).toBe(850)
    expect(result.relevanceScore).toBe(85)
    expect(result.searchIntent).toBe('informational')
    expect(result.difficulty).toBe('medium')
    expect(result.variations).toEqual(['seo tips', 'best seo practices'])
  })

  it('should reject size below minimum', () => {
    expect(() => KeywordDataSchema.parse({
      ...validKeyword,
      size: 5
    })).toThrow()
  })

  it('should reject size above maximum', () => {
    expect(() => KeywordDataSchema.parse({
      ...validKeyword,
      size: 1001
    })).toThrow()
  })

  it('should reject relevanceScore below minimum', () => {
    expect(() => KeywordDataSchema.parse({
      ...validKeyword,
      relevanceScore: 0
    })).toThrow()
  })

  it('should reject relevanceScore above maximum', () => {
    expect(() => KeywordDataSchema.parse({
      ...validKeyword,
      relevanceScore: 101
    })).toThrow()
  })

  it('should accept empty variations array', () => {
    const result = KeywordDataSchema.parse({
      ...validKeyword,
      variations: []
    })

    expect(result.variations).toEqual([])
  })

  it('should reject missing required fields', () => {
    expect(() => KeywordDataSchema.parse({
      text: 'test'
    })).toThrow()
  })

  it('should reject invalid searchIntent', () => {
    expect(() => KeywordDataSchema.parse({
      ...validKeyword,
      searchIntent: 'invalid'
    })).toThrow()
  })

  it('should reject invalid difficulty', () => {
    expect(() => KeywordDataSchema.parse({
      ...validKeyword,
      difficulty: 'extreme'
    })).toThrow()
  })
})

describe('KeywordDataArraySchema', () => {
  const validKeyword = {
    text: 'test keyword',
    size: 500,
    relevanceScore: 50,
    searchIntent: 'commercial',
    difficulty: 'low',
    variations: ['variation 1']
  }

  it('should accept valid keyword array', () => {
    const result = KeywordDataArraySchema.parse([validKeyword, validKeyword])

    expect(result).toHaveLength(2)
    expect(result[0].text).toBe('test keyword')
  })

  it('should accept empty array', () => {
    const result = KeywordDataArraySchema.parse([])

    expect(result).toEqual([])
  })

  it('should reject array with invalid keyword', () => {
    expect(() => KeywordDataArraySchema.parse([
      validKeyword,
      { text: 'invalid', size: 'not a number' }
    ])).toThrow()
  })

  it('should reject non-array input', () => {
    expect(() => KeywordDataArraySchema.parse(validKeyword)).toThrow()
    expect(() => KeywordDataArraySchema.parse('string')).toThrow()
    expect(() => KeywordDataArraySchema.parse(null)).toThrow()
  })
})

describe('safeParse behavior', () => {
  it('should return success false for invalid data', () => {
    const result = KeywordDataSchema.safeParse({ invalid: 'data' })

    expect(result.success).toBe(false)
  })

  it('should return success true with data for valid input', () => {
    const validKeyword = {
      text: 'test',
      size: 100,
      relevanceScore: 10,
      searchIntent: 'informational',
      difficulty: 'low',
      variations: []
    }

    const result = KeywordDataSchema.safeParse(validKeyword)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.text).toBe('test')
    }
  })
})
