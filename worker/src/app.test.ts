import { describe, expect, it } from 'vitest'

import app from './index'
import { createTestD1 } from './test/d1'
import type { Env } from './types'

function testEnv(overrides: Partial<Env> = {}): Env {
  return {
    DB: createTestD1(),
    JWT_SECRET: 'test-jwt-secret',
    ADMIN_EMAILS: 'admin@example.com',
    ...overrides,
  }
}

async function jsonRequest<T>(
  path: string,
  init: RequestInit = {},
  env: Env = testEnv(),
): Promise<{ status: number; body: T }> {
  const res = await app.request(path, init, env)
  const body = (await res.json()) as T
  return { status: res.status, body }
}

describe('API integration', () => {
  it('returns health status', async () => {
    const { status, body } = await jsonRequest<{ status: string }>('/health')
    expect(status).toBe(200)
    expect(body.status).toBe('healthy')
  })

  it('seeds nine artists', async () => {
    const { status, body } = await jsonRequest<Array<{ name: string }>>('/api/artists')
    expect(status).toBe(200)
    expect(body).toHaveLength(9)
  })

  it('returns nine curated breakdowns publicly', async () => {
    const { status, body } = await jsonRequest<Array<{ is_curated: boolean }>>('/api/breakdowns')
    expect(status).toBe(200)
    expect(body).toHaveLength(9)
    expect(body.every((item) => item.is_curated)).toBe(true)
  })

  it('returns 503 when Google Sign-In is not configured', async () => {
    const { status, body } = await jsonRequest<{ detail: string }>(
      '/api/auth/google',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: 'fake-token' }),
      },
      testEnv(),
    )
    expect(status).toBe(503)
    expect(body.detail).toContain('Google Sign-In not configured')
  })

  it('requires auth to submit breakdowns', async () => {
    const { status, body } = await jsonRequest<{ detail: string }>('/api/breakdowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        track_id: 'missing',
        lyric_excerpt: 'test',
        philosophical_analysis: 'test',
      }),
    })

    expect(status).toBe(401)
    expect(body.detail).toBe('Authentication required')
  })

  it('keeps pending submissions out of the public feed until approved', async () => {
    const env = testEnv()

    const register = await jsonRequest<{ access_token: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'writer@example.com', password: 'password123' }),
      },
      env,
    )
    expect(register.status).toBe(201)

    const artists = await jsonRequest<Array<{ id: string }>>('/api/artists', {}, env)
    const tracks = await jsonRequest<Array<{ id: string }>>(
      `/api/tracks/${artists.body[0].id}`,
      {},
      env,
    )

    const submit = await jsonRequest<{ is_curated: boolean }>(
      '/api/breakdowns',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${register.body.access_token}`,
        },
        body: JSON.stringify({
          track_id: tracks.body[0].id,
          lyric_excerpt: 'Pending line for review',
          philosophical_analysis: 'Waiting on moderator approval.',
        }),
      },
      env,
    )
    expect(submit.status).toBe(201)
    expect(submit.body.is_curated).toBe(false)

    const publicFeed = await jsonRequest<Array<{ lyric_excerpt: string }>>('/api/breakdowns', {}, env)
    expect(publicFeed.body).toHaveLength(9)
    expect(publicFeed.body.some((item) => item.lyric_excerpt === 'Pending line for review')).toBe(false)

    const adminRegister = await jsonRequest<{ access_token: string; user: { is_admin: boolean } }>(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
      },
      env,
    )
    expect(adminRegister.body.user.is_admin).toBe(true)

    const pending = await jsonRequest<Array<{ id: string }>>(
      '/api/breakdowns/pending',
      { headers: { Authorization: `Bearer ${adminRegister.body.access_token}` } },
      env,
    )
    expect(pending.body).toHaveLength(1)

    const approve = await jsonRequest<{ is_curated: boolean }>(
      `/api/breakdowns/${pending.body[0].id}/approve`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminRegister.body.access_token}` },
      },
      env,
    )
    expect(approve.status).toBe(200)
    expect(approve.body.is_curated).toBe(true)

    const updatedFeed = await jsonRequest<Array<{ lyric_excerpt: string }>>('/api/breakdowns', {}, env)
    expect(updatedFeed.body).toHaveLength(10)
    expect(updatedFeed.body.some((item) => item.lyric_excerpt === 'Pending line for review')).toBe(true)
  })
})
