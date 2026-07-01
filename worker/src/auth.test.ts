import { describe, expect, it } from 'vitest'

import {
  bearerToken,
  createAccessToken,
  hashPassword,
  isConfiguredAdmin,
  parseAdminEmails,
  userPayload,
  verifyPassword,
  verifyToken,
} from './auth'
import type { Env } from './types'

const env: Env = {
  DB: {} as D1Database,
  JWT_SECRET: 'test-jwt-secret',
  ADMIN_EMAILS: 'admin@example.com, Moderator@Example.com',
}

describe('auth helpers', () => {
  it('extracts bearer tokens', () => {
    expect(bearerToken('Bearer abc123')).toBe('abc123')
    expect(bearerToken('Basic abc123')).toBeNull()
  })

  it('parses admin emails case-insensitively', () => {
    expect(parseAdminEmails(env.ADMIN_EMAILS)).toEqual(
      new Set(['admin@example.com', 'moderator@example.com']),
    )
    expect(isConfiguredAdmin('Moderator@Example.com', env)).toBe(true)
    expect(isConfiguredAdmin('user@example.com', env)).toBe(false)
  })

  it('hashes and verifies passwords', () => {
    const hash = hashPassword('secret-pass')
    expect(verifyPassword('secret-pass', hash)).toBe(true)
    expect(verifyPassword('wrong-pass', hash)).toBe(false)
  })

  it('maps user rows to API payloads', () => {
    expect(userPayload({ id: '1', email: 'a@b.com', is_admin: 1 })).toEqual({
      id: '1',
      email: 'a@b.com',
      is_admin: true,
    })
  })

  it('creates and verifies JWT access tokens', async () => {
    const token = await createAccessToken(env, 'user-1', 'user@example.com')
    const auth = await verifyToken(env, token)
    expect(auth).toEqual({ userId: 'user-1', email: 'user@example.com' })
    expect(await verifyToken(env, 'not-a-token')).toBeNull()
  })
})
