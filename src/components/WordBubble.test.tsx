import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { WordBubble } from './WordBubble'
import type { KeywordData } from '@/types/keywords'

// Mock ResizeObserver before imports
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

// Create a proper mock class for ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe = mockObserve
  unobserve = vi.fn()
  disconnect = mockDisconnect
}

beforeEach(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
  mockObserve.mockClear()
  mockDisconnect.mockClear()
})

// Mock D3 modules since they don't work well in jsdom
vi.mock('d3-selection', () => ({
  select: vi.fn().mockReturnValue({
    selectAll: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    transition: vi.fn().mockReturnThis(),
    duration: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    empty: vi.fn().mockReturnValue(true),
  }),
}))

vi.mock('d3-scale', () => ({
  scaleLinear: vi.fn().mockReturnValue({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnValue((val: number) => val),
  }),
}))

vi.mock('d3-force', () => ({
  forceSimulation: vi.fn().mockReturnValue({
    nodes: vi.fn().mockReturnThis(),
    force: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    tick: vi.fn(),
  }),
  forceManyBody: vi.fn().mockReturnValue({
    strength: vi.fn().mockReturnThis(),
  }),
  forceCenter: vi.fn(),
  forceCollide: vi.fn().mockReturnValue({
    radius: vi.fn().mockReturnThis(),
  }),
}))

vi.mock('d3-array', () => ({
  min: vi.fn().mockReturnValue(10),
  max: vi.fn().mockReturnValue(100),
}))

const mockKeywords: KeywordData[] = [
  {
    text: 'SEO optimization',
    size: 900,
    relevanceScore: 90,
    searchIntent: 'informational',
    difficulty: 'medium',
    variations: ['seo tips', 'search engine optimization'],
  },
  {
    text: 'keyword research',
    size: 850,
    relevanceScore: 85,
    searchIntent: 'informational',
    difficulty: 'low',
    variations: ['keyword analysis', 'finding keywords'],
  },
  {
    text: 'content marketing',
    size: 750,
    relevanceScore: 75,
    searchIntent: 'commercial',
    difficulty: 'high',
    variations: ['content strategy', 'marketing content'],
  },
]

describe('WordBubble', () => {
  it('should render SVG element', () => {
    render(<WordBubble data={mockKeywords} />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should have correct accessibility attributes', () => {
    render(<WordBubble data={mockKeywords} />)

    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label')
  })

  it('should include keyword count in aria-label', () => {
    render(<WordBubble data={mockKeywords} />)

    const svg = document.querySelector('svg')
    const ariaLabel = svg?.getAttribute('aria-label')
    expect(ariaLabel).toContain('3')
    expect(ariaLabel).toContain('SEO keywords')
  })

  it('should list keywords in aria-label', () => {
    render(<WordBubble data={mockKeywords} />)

    const svg = document.querySelector('svg')
    const ariaLabel = svg?.getAttribute('aria-label')
    expect(ariaLabel).toContain('SEO optimization')
    expect(ariaLabel).toContain('keyword research')
    expect(ariaLabel).toContain('content marketing')
  })

  it('should render tooltip container', () => {
    render(<WordBubble data={mockKeywords} />)

    const tooltip = document.querySelector('.fixed.z-50')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveClass('opacity-0')
    expect(tooltip).toHaveClass('pointer-events-none')
  })

  it('should handle empty data array', () => {
    render(<WordBubble data={[]} />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.getAttribute('aria-label')).toContain('0 SEO keywords')
  })

  it('should truncate aria-label for many keywords', () => {
    const manyKeywords: KeywordData[] = Array.from({ length: 10 }, (_, i) => ({
      text: `keyword${i}`,
      size: 100,
      relevanceScore: 50,
      searchIntent: 'informational' as const,
      difficulty: 'low' as const,
      variations: [],
    }))

    render(<WordBubble data={manyKeywords} />)

    const svg = document.querySelector('svg')
    const ariaLabel = svg?.getAttribute('aria-label')
    expect(ariaLabel).toContain('and 5 more')
  })

  it('should expose SVG element via ref', () => {
    const ref = { current: null } as {
      current: { getSvgElement: () => SVGSVGElement | null } | null
    }
    render(<WordBubble data={mockKeywords} ref={ref} />)

    expect(ref.current).toBeTruthy()
    expect(ref.current?.getSvgElement()).toBeInstanceOf(SVGSVGElement)
  })
})
