import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { SearchIntentSchema, DifficultySchema, type KeywordData } from '@/types/keywords'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

const MAX_TOPIC_LENGTH = 500

// Request body validation schema
const AnalyzeRequestSchema = z.object({
  topic: z
    .string()
    .min(1, 'Topic is required')
    .max(MAX_TOPIC_LENGTH, `Topic must be ${MAX_TOPIC_LENGTH} characters or less`)
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Topic cannot be empty'),
})

const OpenAIKeywordSchema = z.object({
  keywords: z.array(
    z.object({
      text: z.string().describe('The SEO keyword or phrase'),
      relevanceScore: z
        .number()
        .min(1)
        .max(100)
        .describe('Relevance score based on search volume and topic relevance'),
      searchIntent: SearchIntentSchema.describe('The user intent behind the search'),
      difficulty: DifficultySchema.describe('SEO competition level'),
      variations: z.array(z.string()).max(3).describe('2-3 long-tail keyword variations'),
    })
  ),
})

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

export async function POST(
  request: Request
): Promise<NextResponse<KeywordData[] | { error: string }>> {
  // Rate limiting: 10 requests per minute per IP
  const clientId = getClientIdentifier(request)
  const rateLimitResult = rateLimit(clientId, { maxRequests: 10, windowMs: 60000 })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  const openai = getOpenAIClient()
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 })
  }

  // Helper to create rate limit headers
  const rateLimitHeaders = {
    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
    'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetIn / 1000)),
  }

  try {
    const body = await request.json()
    const validated = AnalyzeRequestSchema.safeParse(body)

    if (!validated.success) {
      const firstIssue = validated.error.issues[0]
      const isTopicMissing =
        firstIssue?.code === 'invalid_type' &&
        firstIssue?.path[0] === 'topic' &&
        !Object.prototype.hasOwnProperty.call(body, 'topic')
      const errorMessage = isTopicMissing
        ? 'Topic is required'
        : firstIssue?.message || 'Invalid request'
      return NextResponse.json({ error: errorMessage }, { status: 400, headers: rateLimitHeaders })
    }

    const { topic: sanitizedTopic } = validated.data

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an SEO expert. For the given topic, generate 10-15 highly relevant keywords.
For each keyword provide:
- relevanceScore (1-100): based on search volume and topic relevance
- searchIntent: the user's intent (informational/navigational/transactional/commercial)
- difficulty: SEO competition level (low/medium/high)
- variations: 2-3 long-tail keyword variations

Focus on a mix of search intents and difficulty levels to provide comprehensive SEO coverage.`,
        },
        {
          role: 'user',
          content: `Generate SEO keywords for the topic: ${sanitizedTopic}`,
        },
      ],
      response_format: zodResponseFormat(OpenAIKeywordSchema, 'seo_keywords'),
    })

    const parsed = completion.choices[0]?.message?.parsed
    if (!parsed || !parsed.keywords || parsed.keywords.length === 0) {
      return NextResponse.json(
        { error: 'No keywords generated from AI model' },
        { status: 500, headers: rateLimitHeaders }
      )
    }

    const keywords: KeywordData[] = parsed.keywords.map((k) => ({
      text: k.text,
      size: k.relevanceScore * 10,
      relevanceScore: k.relevanceScore,
      searchIntent: k.searchIntent,
      difficulty: k.difficulty,
      variations: k.variations,
    }))

    return NextResponse.json(keywords, { headers: rateLimitHeaders })
  } catch (error) {
    console.error('Error analyzing keywords:', error)
    return NextResponse.json(
      { error: 'Failed to analyze keywords' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
