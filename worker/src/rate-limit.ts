import type { Context, MiddlewareHandler } from 'hono'

import type { Env } from './types'

export type RateLimitTier = 'global' | 'auth' | 'chat' | 'write' | 'skip'

const TIER_LIMITERS: Record<
  Exclude<RateLimitTier, 'skip'>,
  (env: Env) => RateLimit | undefined
> = {
  global: (env) => env.RATE_LIMIT_GLOBAL,
  auth: (env) => env.RATE_LIMIT_AUTH,
  chat: (env) => env.RATE_LIMIT_CHAT,
  write: (env) => env.RATE_LIMIT_WRITE,
}

/** Retry-After hint (seconds) per tier — matches wrangler ratelimit periods. */
export const RETRY_AFTER_SECONDS: Record<Exclude<RateLimitTier, 'skip'>, number> = {
  global: 60,
  auth: 10,
  chat: 60,
  write: 60,
}

export function resolveRateLimitTier(pathname: string, method: string): RateLimitTier {
  if (method === 'OPTIONS') return 'skip'
  if (pathname === '/health' || pathname === '/') return 'skip'

  if (pathname.startsWith('/api/auth/')) return 'auth'
  if (pathname === '/api/tapedeck/chat' && method === 'POST') return 'chat'
  if (
    (pathname === '/api/breakdowns' && method === 'POST') ||
    (pathname.startsWith('/api/breakdowns/') &&
      (method === 'POST' || method === 'DELETE'))
  ) {
    return 'write'
  }

  return 'global'
}

/** Client identifier for rate limiting (Cloudflare edge IP). */
export function clientRateLimitKey(c: Context<{ Bindings: Env }>): string {
  return (
    c.req.header('CF-Connecting-IP') ??
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

export function rateLimitKey(tier: Exclude<RateLimitTier, 'skip'>, clientKey: string): string {
  return `${tier}:${clientKey}`
}

export async function enforceRateLimit(
  env: Env,
  tier: Exclude<RateLimitTier, 'skip'>,
  clientKey: string,
): Promise<{ allowed: boolean; skipped: boolean }> {
  const limiter = TIER_LIMITERS[tier](env)
  if (!limiter) {
    return { allowed: true, skipped: true }
  }

  const { success } = await limiter.limit({ key: rateLimitKey(tier, clientKey) })
  return { allowed: success, skipped: false }
}

export function rateLimitMiddleware(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const tier = resolveRateLimitTier(c.req.path, c.req.method)
    if (tier === 'skip') {
      await next()
      return
    }

    const { allowed } = await enforceRateLimit(c.env, tier, clientRateLimitKey(c))
    if (!allowed) {
      return c.json(
        { detail: 'Too many requests. Please try again later.' },
        429,
        {
          'Retry-After': String(RETRY_AFTER_SECONDS[tier]),
          'X-RateLimit-Tier': tier,
        },
      )
    }

    await next()
  }
}
