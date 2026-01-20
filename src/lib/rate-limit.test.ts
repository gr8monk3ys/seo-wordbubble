import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimit, getClientIdentifier } from './rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    // Reset the rate limit store by using a unique identifier for each test
    vi.useFakeTimers()
  })

  it('should allow first request', () => {
    const result = rateLimit('test-user-1', { maxRequests: 5, windowMs: 60000 })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should decrement remaining count on subsequent requests', () => {
    const config = { maxRequests: 5, windowMs: 60000 }

    rateLimit('test-user-2', config)
    const result = rateLimit('test-user-2', config)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(3)
  })

  it('should block requests after limit is reached', () => {
    const config = { maxRequests: 3, windowMs: 60000 }
    const identifier = 'test-user-3'

    rateLimit(identifier, config)
    rateLimit(identifier, config)
    rateLimit(identifier, config)
    const result = rateLimit(identifier, config)

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset after window expires', () => {
    const config = { maxRequests: 2, windowMs: 1000 }
    const identifier = 'test-user-4'

    rateLimit(identifier, config)
    rateLimit(identifier, config)

    // Advance time past the window
    vi.advanceTimersByTime(1001)

    const result = rateLimit(identifier, config)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('should return correct resetIn time', () => {
    const config = { maxRequests: 5, windowMs: 60000 }
    const identifier = 'test-user-5'

    const result = rateLimit(identifier, config)

    expect(result.resetIn).toBe(60000)
  })

  it('should track different identifiers separately', () => {
    const config = { maxRequests: 2, windowMs: 60000 }

    rateLimit('user-a', config)
    rateLimit('user-a', config)
    const resultA = rateLimit('user-a', config)

    const resultB = rateLimit('user-b', config)

    expect(resultA.success).toBe(false)
    expect(resultB.success).toBe(true)
    expect(resultB.remaining).toBe(1)
  })

  it('should use default config when not provided', () => {
    const result = rateLimit('test-user-default')

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(9) // default is 10 max requests
  })
})

describe('getClientIdentifier', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1'
      }
    })

    expect(getClientIdentifier(request)).toBe('192.168.1.1')
  })

  it('should extract IP from x-real-ip header when x-forwarded-for is missing', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-real-ip': '192.168.1.2'
      }
    })

    expect(getClientIdentifier(request)).toBe('192.168.1.2')
  })

  it('should return anonymous when no IP headers present', () => {
    const request = new Request('https://example.com')

    expect(getClientIdentifier(request)).toBe('anonymous')
  })

  it('should trim whitespace from IP addresses', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '  192.168.1.3  , 10.0.0.1'
      }
    })

    expect(getClientIdentifier(request)).toBe('192.168.1.3')
  })
})
