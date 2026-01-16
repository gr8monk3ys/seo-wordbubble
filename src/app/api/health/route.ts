import { NextResponse } from 'next/server'
import { isConfigured } from '@/lib/env'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    openai: {
      configured: boolean
    }
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const openaiConfigured = isConfigured('OPENAI_API_KEY')

  const status: HealthStatus = {
    status: openaiConfigured ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks: {
      openai: {
        configured: openaiConfigured,
      },
    },
  }

  const httpStatus = status.status === 'healthy' ? 200 : 503

  return NextResponse.json(status, { status: httpStatus })
}
