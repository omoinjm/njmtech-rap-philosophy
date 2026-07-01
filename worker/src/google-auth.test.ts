import { describe, expect, it, vi, afterEach } from 'vitest'

import { verifyGoogleIdToken } from './google-auth'

describe('verifyGoogleIdToken', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns profile for a valid token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          aud: 'client-id',
          sub: 'google-sub-1',
          email: 'User@Example.com',
          email_verified: 'true',
        }),
      }),
    )

    await expect(verifyGoogleIdToken('token', 'client-id')).resolves.toEqual({
      sub: 'google-sub-1',
      email: 'user@example.com',
    })
  })

  it('rejects invalid audience or unverified email', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          aud: 'wrong-client',
          sub: 'google-sub-1',
          email: 'user@example.com',
          email_verified: 'true',
        }),
      }),
    )

    await expect(verifyGoogleIdToken('token', 'client-id')).rejects.toThrow('Invalid Google token')
  })
})
