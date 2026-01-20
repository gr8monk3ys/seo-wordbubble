import { useState, useCallback, useRef, useEffect } from 'react'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface UseRateLimitReturn {
  isRateLimited: boolean
  remainingRequests: number
  checkRateLimit: () => boolean
  resetTime: number | null
}

export function useRateLimit({
  maxRequests = 10,
  windowMs = 60000,
}: RateLimitConfig): UseRateLimitReturn {
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [remainingRequests, setRemainingRequests] = useState(maxRequests)
  const [resetTime, setResetTime] = useState<number | null>(null)
  const requestTimestamps = useRef<number[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now()
    const windowStart = now - windowMs

    // Remove timestamps outside the current window
    requestTimestamps.current = requestTimestamps.current.filter(
      (timestamp) => timestamp > windowStart
    )

    const currentCount = requestTimestamps.current.length

    if (currentCount >= maxRequests) {
      // Rate limited
      const oldestRequest = requestTimestamps.current[0]
      const resetAt = oldestRequest + windowMs
      setResetTime(resetAt)
      setIsRateLimited(true)
      setRemainingRequests(0)

      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Schedule reset
      const timeUntilReset = resetAt - now
      timeoutRef.current = setTimeout(() => {
        setIsRateLimited(false)
        setResetTime(null)
        setRemainingRequests(maxRequests - requestTimestamps.current.length + 1)
        timeoutRef.current = null
      }, timeUntilReset)

      return false
    }

    // Add this request
    requestTimestamps.current.push(now)
    setRemainingRequests(maxRequests - requestTimestamps.current.length)
    return true
  }, [maxRequests, windowMs])

  return {
    isRateLimited,
    remainingRequests,
    checkRateLimit,
    resetTime,
  }
}
