import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TopicInputProps {
  onAnalyze: (topic: string) => void
  loading: boolean
}

export default function TopicInput({ onAnalyze, loading }: TopicInputProps) {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim() && !loading) {
      onAnalyze(topic.trim())
    }
  }

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit} className="neumorphic space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-[var(--primary)]">
          SEO Word Bubble Generator
        </h2>
        <div className="space-y-4">
          <label htmlFor="topic-input" className="sr-only">
            Enter your topic
          </label>
          <Input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your topic..."
            disabled={loading}
            className="input-field"
          />
          <Button
            type="submit"
            disabled={loading || !topic.trim()}
            className="button button-primary"
          >
            {loading ? 'Analyzing...' : 'Generate Word Bubble'}
          </Button>
        </div>
      </form>
    </div>
  )
}
