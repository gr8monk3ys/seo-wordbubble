import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock OpenAI with structured outputs (beta.chat.completions.parse)
vi.mock('openai', () => {
  const mockParse = vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          parsed: {
            keywords: [
              {
                text: 'SEO optimization',
                relevanceScore: 90,
                searchIntent: 'informational',
                difficulty: 'medium',
                variations: ['seo tips', 'search engine optimization guide'],
              },
              {
                text: 'keyword research',
                relevanceScore: 85,
                searchIntent: 'informational',
                difficulty: 'low',
                variations: ['keyword analysis', 'finding keywords'],
              },
              {
                text: 'content marketing',
                relevanceScore: 75,
                searchIntent: 'commercial',
                difficulty: 'high',
                variations: ['content strategy', 'marketing content'],
              },
            ],
          },
        },
      },
    ],
  })

  return {
    default: class MockOpenAI {
      beta = {
        chat: {
          completions: {
            parse: mockParse,
          },
        },
      }
    },
  }
})

// Mock zodResponseFormat
vi.mock('openai/helpers/zod', () => ({
  zodResponseFormat: vi.fn().mockReturnValue({ type: 'json_schema' }),
}))

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-api-key')
  })

  it('should return keywords for valid topic', async () => {
    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'digital marketing' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(3)
    expect(data[0]).toHaveProperty('text')
    expect(data[0]).toHaveProperty('size')
    expect(data[0]).toHaveProperty('relevanceScore')
    expect(data[0]).toHaveProperty('searchIntent')
    expect(data[0]).toHaveProperty('difficulty')
    expect(data[0]).toHaveProperty('variations')
    expect(data[0].size).toBe(900) // relevanceScore * 10
  })

  it('should return 400 for missing topic', async () => {
    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Topic is required')
  })

  it('should return 400 for empty topic', async () => {
    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: '   ' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Topic cannot be empty')
  })

  it('should return 400 for topic exceeding max length', async () => {
    const longTopic = 'a'.repeat(501)
    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: longTopic }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('500 characters or less')
  })

  it('should return 503 when API key not configured', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'test' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toBe('OpenAI API key not configured')
  })
})
