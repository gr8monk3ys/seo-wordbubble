'use client'

import { useRef, useState } from 'react'

interface ExportButtonsProps {
  svgRef: React.RefObject<SVGSVGElement | null>
  keywords: Array<{ text: string; size: number }>
}

export default function ExportButtons({ svgRef, keywords }: ExportButtonsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const handleDownloadPNG = async (): Promise<void> => {
    const svg = svgRef.current
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = (): void => {
      const canvas = document.createElement('canvas')
      const scale = 2 // Higher resolution
      canvas.width = svg.clientWidth * scale
      canvas.height = svg.clientHeight * scale

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Fill background
      ctx.fillStyle = '#E4EBF5'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (!blob) return
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = 'seo-keywords.png'
        link.href = downloadUrl
        link.click()
        URL.revokeObjectURL(downloadUrl)
      }, 'image/png')

      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const handleCopyKeywords = async (): Promise<void> => {
    const sortedKeywords = [...keywords]
      .sort((a, b) => b.size - a.size)
      .map((k) => `${k.text} (${Math.round(k.size / 10)})`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(sortedKeywords)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={handleDownloadPNG}
        className="export-button"
        aria-label="Download as PNG image"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download PNG
      </button>

      <button
        onClick={handleCopyKeywords}
        className="export-button"
        aria-label={copyStatus === 'copied' ? 'Keywords copied' : 'Copy keywords to clipboard'}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {copyStatus === 'copied' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          )}
        </svg>
        {copyStatus === 'copied' ? 'Copied!' : 'Copy Keywords'}
      </button>
    </div>
  )
}
