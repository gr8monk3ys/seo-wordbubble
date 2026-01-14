import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const MAX_TOPIC_LENGTH = 500

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

export async function POST(request: Request) {
  const openai = getOpenAIClient()
  if (!openai) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const topic = body?.topic

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const sanitizedTopic = topic.trim()
    if (sanitizedTopic.length === 0) {
      return NextResponse.json(
        { error: 'Topic cannot be empty' },
        { status: 400 }
      )
    }

    if (sanitizedTopic.length > MAX_TOPIC_LENGTH) {
      return NextResponse.json(
        { error: `Topic must be ${MAX_TOPIC_LENGTH} characters or less` },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert. Analyze the given topic and return the most relevant keywords for SEO optimization. For each keyword, provide an importance score between 1 and 100 based on relevance, search volume, and competition. Format each keyword as: keyword (score)'
        },
        {
          role: 'user',
          content: `Generate SEO keywords for the topic: ${sanitizedTopic}`
        }
      ]
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      )
    }

    const keywords = parseKeywords(response)
    if (keywords.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse keywords from response' },
        { status: 500 }
      )
    }

    return NextResponse.json(keywords)
  } catch (error) {
    console.error('Error analyzing keywords:', error)
    return NextResponse.json(
      { error: 'Failed to analyze keywords' },
      { status: 500 }
    )
  }
}

function parseKeywords(response: string): Array<{ text: string; size: number }> {
  const keywordRegex = /([^(\n]+)\s*\((\d+)\)/g
  const keywords: Array<{ text: string; size: number }> = []
  let match

  while ((match = keywordRegex.exec(response)) !== null) {
    const text = match[1].trim()
    const score = parseInt(match[2], 10)
    if (text && !isNaN(score) && score >= 1 && score <= 100) {
      keywords.push({
        text,
        size: score * 10
      })
    }
  }

  if (keywords.length === 0) {
    const lines = response.split('\n').filter(line => line.trim())
    return lines.slice(0, 20).map((keyword, index) => ({
      text: keyword.replace(/^\d+\.\s*/, '').trim(),
      size: 1000 / (index + 1)
    }))
  }

  return keywords
}
