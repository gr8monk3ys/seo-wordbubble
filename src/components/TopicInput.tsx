import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const MAX_TOPIC_LENGTH = 500

interface TopicInputProps {
  onAnalyze: (topic: string) => void
  loading: boolean
  isRateLimited?: boolean
  remainingRequests?: number
  resetTime?: number | null
}

export default function TopicInput({
  onAnalyze,
  loading,
  isRateLimited = false,
  remainingRequests = 10,
  resetTime = null,
}: TopicInputProps) {
  const [topic, setTopic] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!resetTime) {
      setCountdown(null)
      return
    }

    const updateCountdown = (): void => {
      const remaining = Math.ceil((resetTime - Date.now()) / 1000)
      setCountdown(remaining > 0 ? remaining : null)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [resetTime])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (topic.trim() && !loading && !isRateLimited && topic.length <= MAX_TOPIC_LENGTH) {
      onAnalyze(topic.trim())
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if (value.length <= MAX_TOPIC_LENGTH) {
      setTopic(value)
    }
  }

  const charCount = topic.length
  const isNearLimit = charCount > MAX_TOPIC_LENGTH * 0.8
  const isAtLimit = charCount >= MAX_TOPIC_LENGTH

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit} className="neumorphic space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-[var(--primary)]">
          SEO Word Bubble Generator
        </h2>
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="topic-input" className="sr-only">
              Enter your topic
            </label>
            <Input
              id="topic-input"
              type="text"
              value={topic}
              onChange={handleChange}
              placeholder="Enter your topic..."
              disabled={loading}
              className="input-field"
              maxLength={MAX_TOPIC_LENGTH}
            />
            <span
              className={`absolute right-3 bottom-[-1.5rem] text-xs transition-colors ${
                isAtLimit
                  ? 'text-red-500'
                  : isNearLimit
                    ? 'text-amber-500'
                    : 'text-[var(--greyLight-3)]'
              }`}
              aria-live="polite"
            >
              {charCount}/{MAX_TOPIC_LENGTH}
            </span>
          </div>
          <Button
            type="submit"
            disabled={loading || !topic.trim() || isRateLimited}
            className="button button-primary mt-6"
          >
            {loading
              ? 'Analyzing...'
              : isRateLimited
                ? `Wait ${countdown}s`
                : 'Generate Word Bubble'}
          </Button>
          {isRateLimited && (
            <p className="text-center text-sm text-amber-600 mt-2">
              Rate limit reached. Please wait before trying again.
            </p>
          )}
          {!isRateLimited && remainingRequests <= 3 && remainingRequests > 0 && (
            <p className="text-center text-xs text-[var(--greyLight-3)] mt-2">
              {remainingRequests} request{remainingRequests !== 1 ? 's' : ''} remaining this minute
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
