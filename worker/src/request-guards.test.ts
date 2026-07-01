import { describe, expect, it } from 'vitest'

import {
  checkContentLength,
  MAX_CHAT_BODY_BYTES,
  MAX_CHAT_HISTORY_TURNS,
  MAX_CHAT_MESSAGE_CHARS,
  validateChatRequestBody,
} from './request-guards'

describe('checkContentLength', () => {
  it('allows GET without Content-Length', () => {
    expect(checkContentLength('/api/artists', 'GET', undefined)).toEqual({ ok: true })
  })

  it('rejects oversized chat payloads', () => {
    const result = checkContentLength(
      '/api/tapedeck/chat',
      'POST',
      String(MAX_CHAT_BODY_BYTES + 1),
    )
    expect(result.ok).toBe(false)
  })

  it('allows chat payloads within limit', () => {
    const result = checkContentLength(
      '/api/tapedeck/chat',
      'POST',
      String(MAX_CHAT_BODY_BYTES),
    )
    expect(result).toEqual({ ok: true })
  })
})

describe('validateChatRequestBody', () => {
  it('rejects empty messages', () => {
    const result = validateChatRequestBody({ message: '   ', history: [] })
    expect(result.ok).toBe(false)
  })

  it('rejects oversized messages', () => {
    const result = validateChatRequestBody({
      message: 'x'.repeat(MAX_CHAT_MESSAGE_CHARS + 1),
      history: [],
    })
    expect(result.ok).toBe(false)
  })

  it('rejects too many history turns', () => {
    const history = Array.from({ length: MAX_CHAT_HISTORY_TURNS + 1 }, () => ({
      role: 'user',
      content: 'hi',
    }))
    const result = validateChatRequestBody({ message: 'hello', history })
    expect(result.ok).toBe(false)
  })

  it('accepts valid chat payloads', () => {
    const result = validateChatRequestBody({
      message: 'Who influenced Roc Marciano?',
      history: [{ role: 'assistant', content: 'Welcome.' }],
    })
    expect(result.ok).toBe(true)
  })
})
