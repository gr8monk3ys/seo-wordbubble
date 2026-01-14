'use client'

import TopicInput from '@/components/TopicInput'
import WordBubble from '@/components/WordBubble'
import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bubbleData, setBubbleData] = useState<Array<{ text: string; size: number }>>([])

  const handleAnalyze = async (topic: string) => {
    setError(null)
    setLoading(true)

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

      setBubbleData(data)
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error analyzing topic:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="sr-only">SEO Word Bubble Generator</h1>
        <TopicInput onAnalyze={handleAnalyze} loading={loading} />
        {error && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
          >
            {error}
          </div>
        )}
        {bubbleData.length > 0 && (
          <div className="aspect-[4/3] w-full neumorphic">
            <WordBubble data={bubbleData} />
          </div>
        )}
      </div>
    </main>
  )
}
