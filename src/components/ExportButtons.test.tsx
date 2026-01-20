import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExportButtons from './ExportButtons'

describe('ExportButtons', () => {
  const mockKeywords = [
    { text: 'SEO', size: 900 },
    { text: 'Marketing', size: 700 },
    { text: 'Content', size: 500 },
  ]

  const createMockSvgRef = (): React.RefObject<SVGSVGElement | null> => ({
    current: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render download PNG button', () => {
    render(<ExportButtons svgRef={createMockSvgRef()} keywords={mockKeywords} />)

    expect(screen.getByText('Download PNG')).toBeInTheDocument()
    expect(screen.getByLabelText('Download as PNG image')).toBeInTheDocument()
  })

  it('should render copy keywords button', () => {
    render(<ExportButtons svgRef={createMockSvgRef()} keywords={mockKeywords} />)

    expect(screen.getByText('Copy Keywords')).toBeInTheDocument()
    expect(screen.getByLabelText('Copy keywords to clipboard')).toBeInTheDocument()
  })

  it('should copy keywords to clipboard in sorted order', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    })

    render(<ExportButtons svgRef={createMockSvgRef()} keywords={mockKeywords} />)

    const copyButton = screen.getByText('Copy Keywords')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(1)
    })

    // Keywords should be sorted by size (descending) with relevance score
    const expectedText = 'SEO (90)\nMarketing (70)\nContent (50)'
    expect(writeTextMock).toHaveBeenCalledWith(expectedText)
  })

  it('should show "Copied!" feedback after copying', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    })

    render(<ExportButtons svgRef={createMockSvgRef()} keywords={mockKeywords} />)

    const copyButton = screen.getByText('Copy Keywords')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    // Aria label should update
    expect(screen.getByLabelText('Keywords copied')).toBeInTheDocument()
  })

  it('should reset to initial state after copy feedback timeout', async () => {
    vi.useFakeTimers()

    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    })

    render(<ExportButtons svgRef={createMockSvgRef()} keywords={mockKeywords} />)

    const copyButton = screen.getByText('Copy Keywords')
    fireEvent.click(copyButton)

    // Flush all pending promises and microtasks
    await vi.runAllTimersAsync()

    expect(screen.getByText('Copy Keywords')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('should handle clipboard write failure gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Create a promise that rejects after a microtask
    const writeTextMock = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error('Clipboard access denied')))
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    })

    render(<ExportButtons svgRef={createMockSvgRef()} keywords={mockKeywords} />)

    const copyButton = screen.getByText('Copy Keywords')
    fireEvent.click(copyButton)

    // Wait for async error handling
    await waitFor(
      () => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      },
      { timeout: 1000 }
    )

    // Should still show Copy Keywords (not Copied!)
    expect(screen.getByText('Copy Keywords')).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('should handle empty keywords array', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    })

    render(<ExportButtons svgRef={createMockSvgRef()} keywords={[]} />)

    const copyButton = screen.getByText('Copy Keywords')
    fireEvent.click(copyButton)

    await waitFor(
      () => {
        expect(writeTextMock).toHaveBeenCalledWith('')
      },
      { timeout: 1000 }
    )
  })

  it('should render both buttons in a flex container', () => {
    const { container } = render(
      <ExportButtons svgRef={createMockSvgRef()} keywords={mockKeywords} />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex')
    expect(wrapper).toHaveClass('flex-wrap')
    expect(wrapper).toHaveClass('gap-3')
  })

  it('should have accessible icon elements', () => {
    render(<ExportButtons svgRef={createMockSvgRef()} keywords={mockKeywords} />)

    const icons = document.querySelectorAll('svg[aria-hidden="true"]')
    expect(icons.length).toBe(2)
  })
})
