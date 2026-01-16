import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopicInput from './TopicInput'

describe('TopicInput', () => {
  it('should render input field and button', () => {
    render(<TopicInput onAnalyze={vi.fn()} loading={false} />)

    expect(screen.getByPlaceholderText('Enter your topic...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate word bubble/i })).toBeInTheDocument()
  })

  it('should disable button when input is empty', () => {
    render(<TopicInput onAnalyze={vi.fn()} loading={false} />)

    const button = screen.getByRole('button', { name: /generate word bubble/i })
    expect(button).toBeDisabled()
  })

  it('should enable button when input has value', async () => {
    const user = userEvent.setup()
    render(<TopicInput onAnalyze={vi.fn()} loading={false} />)

    const input = screen.getByPlaceholderText('Enter your topic...')
    await user.type(input, 'digital marketing')

    const button = screen.getByRole('button', { name: /generate word bubble/i })
    expect(button).toBeEnabled()
  })

  it('should call onAnalyze when form submitted', async () => {
    const user = userEvent.setup()
    const onAnalyze = vi.fn()
    render(<TopicInput onAnalyze={onAnalyze} loading={false} />)

    const input = screen.getByPlaceholderText('Enter your topic...')
    await user.type(input, 'digital marketing')

    const button = screen.getByRole('button', { name: /generate word bubble/i })
    await user.click(button)

    expect(onAnalyze).toHaveBeenCalledWith('digital marketing')
  })

  it('should show loading state', () => {
    render(<TopicInput onAnalyze={vi.fn()} loading={true} />)

    expect(screen.getByRole('button', { name: /analyzing/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your topic...')).toBeDisabled()
  })

  it('should show character counter', async () => {
    const user = userEvent.setup()
    render(<TopicInput onAnalyze={vi.fn()} loading={false} />)

    expect(screen.getByText('0/500')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Enter your topic...')
    await user.type(input, 'test')

    expect(screen.getByText('4/500')).toBeInTheDocument()
  })

  it('should prevent input exceeding max length', async () => {
    const user = userEvent.setup()
    render(<TopicInput onAnalyze={vi.fn()} loading={false} />)

    const input = screen.getByPlaceholderText('Enter your topic...') as HTMLInputElement
    const longText = 'a'.repeat(501)

    await user.type(input, longText)

    expect(input.value.length).toBeLessThanOrEqual(500)
  })

  it('should show rate limit warning when rate limited', () => {
    render(
      <TopicInput
        onAnalyze={vi.fn()}
        loading={false}
        isRateLimited={true}
        remainingRequests={0}
        resetTime={Date.now() + 30000}
      />
    )

    expect(screen.getByText(/rate limit reached/i)).toBeInTheDocument()
  })

  it('should disable button when rate limited', () => {
    render(
      <TopicInput
        onAnalyze={vi.fn()}
        loading={false}
        isRateLimited={true}
        remainingRequests={0}
        resetTime={Date.now() + 30000}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
