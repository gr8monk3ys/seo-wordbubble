const requiredEnvVars = ['OPENAI_API_KEY'] as const

type RequiredEnvVar = (typeof requiredEnvVars)[number]

interface EnvConfig {
  OPENAI_API_KEY: string
}

function validateEnv(): EnvConfig {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(', ')}. ` +
        'Some features may not work correctly.'
    )
  }

  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  }
}

export const env = validateEnv()

export function isConfigured(key: RequiredEnvVar): boolean {
  return Boolean(process.env[key])
}
