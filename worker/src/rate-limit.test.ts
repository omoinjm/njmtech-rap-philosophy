import { describe, expect, it } from 'vitest'

import {
  clientRateLimitKey,
  enforceRateLimit,
  rateLimitKey,
  resolveRateLimitTier,
} from './rate-limit'
import { createTestD1 } from './test/d1'
import type { Env } from './types'

function mockLimiter(allowed: boolean): RateLimit {
  return {
    limit: async () => ({ success: allowed }),
  }
}

describe('resolveRateLimitTier', () => {
  it('skips health and root', () => {
    expect(resolveRateLimitTier('/health', 'GET')).toBe('skip')
    expect(resolveRateLimitTier('/', 'GET')).toBe('skip')
    expect(resolveRateLimitTier('/api/artists', 'OPTIONS')).toBe('skip')
  })

  it('classifies auth, chat, write, and global routes', () => {
    expect(resolveRateLimitTier('/api/auth/login', 'POST')).toBe('auth')
    expect(resolveRateLimitTier('/api/tapedeck/chat', 'POST')).toBe('chat')
    expect(resolveRateLimitTier('/api/breakdowns', 'POST')).toBe('write')
    expect(resolveRateLimitTier('/api/breakdowns/abc/approve', 'POST')).toBe('write')
    expect(resolveRateLimitTier('/api/breakdowns/abc', 'DELETE')).toBe('write')
    expect(resolveRateLimitTier('/api/artists', 'GET')).toBe('global')
  })
})

describe('enforceRateLimit', () => {
  const baseEnv: Env = {
    DB: createTestD1(),
    JWT_SECRET: 'test',
  }

  it('allows when binding is missing (local dev / tests)', async () => {
    const result = await enforceRateLimit(baseEnv, 'global', '1.2.3.4')
    expect(result).toEqual({ allowed: true, skipped: true })
  })

  it('blocks when limiter returns success=false', async () => {
    const env: Env = {
      ...baseEnv,
      RATE_LIMIT_AUTH: mockLimiter(false),
    }
    const result = await enforceRateLimit(env, 'auth', '1.2.3.4')
    expect(result).toEqual({ allowed: false, skipped: false })
  })

  it('allows when limiter returns success=true', async () => {
    const env: Env = {
      ...baseEnv,
      RATE_LIMIT_CHAT: mockLimiter(true),
    }
    const result = await enforceRateLimit(env, 'chat', '1.2.3.4')
    expect(result).toEqual({ allowed: true, skipped: false })
  })
})

describe('rateLimitKey', () => {
  it('combines tier and client key', () => {
    expect(rateLimitKey('auth', '203.0.113.1')).toBe('auth:203.0.113.1')
  })
})

describe('clientRateLimitKey', () => {
  it('prefers CF-Connecting-IP', () => {
    const headers = new Headers({
      'CF-Connecting-IP': '198.51.100.10',
      'X-Forwarded-For': '10.0.0.1',
    })
    const req = new Request('https://example.com/api/artists', { headers })
    expect(
      clientRateLimitKey({
        req: { header: (name: string) => req.headers.get(name) ?? undefined },
      } as Parameters<typeof clientRateLimitKey>[0]),
    ).toBe('198.51.100.10')
  })
})
