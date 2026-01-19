'use client'

import TopicInput from '@/components/TopicInput'
import { WordBubble, WordBubbleRef } from '@/components/WordBubble'
import { Legend } from '@/components/Legend'
import EmptyState from '@/components/EmptyState'
import ExportButtons from '@/components/ExportButtons'
import KeywordList from '@/components/KeywordList'
import { useRateLimit } from '@/hooks/useRateLimit'
import { useState, useRef } from 'react'
import { KeywordDataArraySchema, type KeywordData } from '@/types/keywords'

export default function Home(): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bubbleData, setBubbleData] = useState<KeywordData[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const wordBubbleRef = useRef<WordBubbleRef>(null)

  const { isRateLimited, remainingRequests, checkRateLimit, resetTime } = useRateLimit({
    maxRequests: 10,
    windowMs: 60000,
  })

  const handleAnalyze = async (topic: string): Promise<void> => {
    if (!checkRateLimit()) {
      return
    }

    setError(null)
    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to analyze topic')
        return
      }

      const validated = KeywordDataArraySchema.safeParse(data)
      if (!validated.success) {
        console.error('Response validation failed:', validated.error)
        setError('Invalid response format from server')
        return
      }

      setBubbleData(validated.data)
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error analyzing topic:', err)
    } finally {
      setLoading(false)
    }
  }

  const showEmptyState = !loading && bubbleData.length === 0 && !hasSearched

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="sr-only">SEO Word Bubble Generator</h1>
        <TopicInput
          onAnalyze={handleAnalyze}
          loading={loading}
          isRateLimited={isRateLimited}
          remainingRequests={remainingRequests}
          resetTime={resetTime}
        />
        {error && (
          <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}
        {showEmptyState && <EmptyState onTryExample={handleAnalyze} />}
        {loading && (
          <div className="aspect-square sm:aspect-[4/3] w-full neumorphic flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="loading-spinner mx-auto" />
              <p className="text-[var(--greyDark)] text-lg">Analyzing keywords...</p>
            </div>
          </div>
        )}
        {!loading && bubbleData.length > 0 && (
          <div className="space-y-4">
            <Legend className="p-4 neumorphic rounded-lg" />
            <div className="aspect-square sm:aspect-[4/3] w-full neumorphic">
              <WordBubble ref={wordBubbleRef} data={bubbleData} />
            </div>
            <ExportButtons
              svgRef={{ current: wordBubbleRef.current?.getSvgElement() ?? null }}
              keywords={bubbleData}
            />
            <KeywordList keywords={bubbleData} />
          </div>
        )}
      </div>
    </main>
  )
}
