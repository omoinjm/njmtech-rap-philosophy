import { describe, expect, it } from 'vitest'

import { resolveCorsOrigins } from './cors'

describe('resolveCorsOrigins', () => {
  it('returns localhost defaults when unset', () => {
    expect(resolveCorsOrigins()).toEqual([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ])
  })

  it('parses comma-separated production origins', () => {
    expect(resolveCorsOrigins('https://example.com, https://www.example.com')).toEqual([
      'https://example.com',
      'https://www.example.com',
    ])
  })

  it('falls back to defaults for blank config', () => {
    expect(resolveCorsOrigins('   ')).toEqual([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ])
  })
})
