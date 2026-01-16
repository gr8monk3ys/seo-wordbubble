import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KeywordList from './KeywordList'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockKeywords = [
  { text: 'SEO', size: 900 },
  { text: 'Marketing', size: 800 },
  { text: 'Content', size: 700 },
]

describe('KeywordList', () => {
  it('should render collapsed by default', () => {
    render(<KeywordList keywords={mockKeywords} />)

    expect(screen.getByText('Keywords (3)')).toBeInTheDocument()
    expect(screen.queryByText('SEO')).not.toBeInTheDocument()
  })

  it('should expand when header clicked', async () => {
    const user = userEvent.setup()
    render(<KeywordList keywords={mockKeywords} />)

    const header = screen.getByRole('button', { name: /keywords/i })
    await user.click(header)

    expect(screen.getByText('SEO')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should show keywords sorted by score', async () => {
    const user = userEvent.setup()
    const unsortedKeywords = [
      { text: 'Low', size: 300 },
      { text: 'High', size: 900 },
      { text: 'Medium', size: 600 },
    ]
    render(<KeywordList keywords={unsortedKeywords} />)

    const header = screen.getByRole('button', { name: /keywords/i })
    await user.click(header)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('High')
    expect(items[1]).toHaveTextContent('Medium')
    expect(items[2]).toHaveTextContent('Low')
  })

  it('should display scores correctly', async () => {
    const user = userEvent.setup()
    render(<KeywordList keywords={[{ text: 'Test', size: 850 }]} />)

    const header = screen.getByRole('button', { name: /keywords/i })
    await user.click(header)

    // Score should be size / 10 = 85
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  it('should copy keyword when copy button clicked', async () => {
    const user = userEvent.setup()
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      clipboard: { writeText: writeTextMock },
    })

    render(<KeywordList keywords={mockKeywords} />)

    const header = screen.getByRole('button', { name: /keywords/i })
    await user.click(header)

    const copyButtons = screen.getAllByRole('button', { name: /copy/i })
    await user.click(copyButtons[0])

    expect(writeTextMock).toHaveBeenCalledWith('SEO')

    vi.unstubAllGlobals()
  })

  it('should toggle aria-expanded attribute', async () => {
    const user = userEvent.setup()
    render(<KeywordList keywords={mockKeywords} />)

    const header = screen.getByRole('button', { name: /keywords/i })
    expect(header).toHaveAttribute('aria-expanded', 'false')

    await user.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'true')

    await user.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
  })
})
