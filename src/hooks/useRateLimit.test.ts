import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRateLimit } from './useRateLimit'

describe('useRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow requests within rate limit', () => {
    const { result } = renderHook(() => useRateLimit({ maxRequests: 3, windowMs: 60000 }))

    expect(result.current.isRateLimited).toBe(false)
    expect(result.current.remainingRequests).toBe(3)

    act(() => {
      const allowed = result.current.checkRateLimit()
      expect(allowed).toBe(true)
    })

    expect(result.current.remainingRequests).toBe(2)
  })

  it('should block requests when rate limit exceeded', () => {
    const { result } = renderHook(() => useRateLimit({ maxRequests: 2, windowMs: 60000 }))

    // Use up all requests
    act(() => {
      result.current.checkRateLimit()
      result.current.checkRateLimit()
    })

    expect(result.current.remainingRequests).toBe(0)

    // Next request should be blocked
    act(() => {
      const allowed = result.current.checkRateLimit()
      expect(allowed).toBe(false)
    })

    expect(result.current.isRateLimited).toBe(true)
  })

  it('should reset after window expires', () => {
    const { result } = renderHook(() => useRateLimit({ maxRequests: 1, windowMs: 1000 }))

    // Use up limit
    act(() => {
      result.current.checkRateLimit()
    })

    // Should be limited
    act(() => {
      const allowed = result.current.checkRateLimit()
      expect(allowed).toBe(false)
    })

    // Advance time past window
    act(() => {
      vi.advanceTimersByTime(1100)
    })

    // Should allow new request
    act(() => {
      const allowed = result.current.checkRateLimit()
      expect(allowed).toBe(true)
    })
  })

  it('should track reset time when rate limited', () => {
    const { result } = renderHook(() => useRateLimit({ maxRequests: 1, windowMs: 60000 }))

    act(() => {
      result.current.checkRateLimit()
      result.current.checkRateLimit()
    })

    expect(result.current.resetTime).not.toBeNull()
  })
})
