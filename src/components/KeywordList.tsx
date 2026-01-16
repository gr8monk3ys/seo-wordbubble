'use client'

import { useState } from 'react'

interface KeywordListProps {
  keywords: Array<{ text: string; size: number }>
}

export default function KeywordList({ keywords }: KeywordListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const sortedKeywords = [...keywords].sort((a, b) => b.size - a.size)

  const handleCopyKeyword = async (text: string, index: number): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getScoreColor = (size: number): string => {
    const score = size / 10
    if (score >= 80) return 'var(--primary-dark)'
    if (score >= 60) return 'var(--primary)'
    if (score >= 40) return 'var(--primary-light)'
    return 'var(--greyDark)'
  }

  return (
    <div className="neumorphic">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={isExpanded}
      >
        <span className="font-semibold text-[var(--primary)]">Keywords ({keywords.length})</span>
        <svg
          className={`w-5 h-5 text-[var(--greyDark)] transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--greyLight-2)] max-h-80 overflow-y-auto">
          <ul className="divide-y divide-[var(--greyLight-2)]">
            {sortedKeywords.map((keyword, index) => (
              <li
                key={`${keyword.text}-${index}`}
                className="flex items-center justify-between p-3 hover:bg-[var(--greyLight-2)] hover:bg-opacity-30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: getScoreColor(keyword.size) }}
                  >
                    {Math.round(keyword.size / 10)}
                  </span>
                  <span className="text-[var(--greyDark)] truncate">{keyword.text}</span>
                </div>
                <button
                  onClick={() => handleCopyKeyword(keyword.text, index)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--greyLight-2)] transition-colors"
                  aria-label={copiedIndex === index ? 'Copied' : `Copy ${keyword.text}`}
                >
                  {copiedIndex === index ? (
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-[var(--greyDark)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
