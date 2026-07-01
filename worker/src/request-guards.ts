import type { MiddlewareHandler } from 'hono'

import type { Env } from './types'

/** Default max JSON body size for mutating routes. */
export const MAX_BODY_BYTES = 256_000

/** Tape Deck chat payloads stay smaller — limits prompt-injection volume. */
export const MAX_CHAT_BODY_BYTES = 64_000

export const MAX_CHAT_MESSAGE_CHARS = 4_000
export const MAX_CHAT_HISTORY_TURNS = 20
export const MAX_CHAT_TURN_CHARS = 8_000

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function parseContentLength(header: string | undefined): number | null {
  if (!header) return null
  const value = Number.parseInt(header, 10)
  return Number.isFinite(value) && value >= 0 ? value : null
}

export function maxBodyBytesForPath(pathname: string): number {
  if (pathname === '/api/tapedeck/chat') return MAX_CHAT_BODY_BYTES
  return MAX_BODY_BYTES
}

export function checkContentLength(
  pathname: string,
  method: string,
  contentLengthHeader: string | undefined,
): { ok: true } | { ok: false; detail: string } {
  if (!MUTATING_METHODS.has(method)) return { ok: true }

  const maxBytes = maxBodyBytesForPath(pathname)
  const contentLength = parseContentLength(contentLengthHeader)
  if (contentLength !== null && contentLength > maxBytes) {
    return {
      ok: false,
      detail: `Request body too large (max ${maxBytes} bytes)`,
    }
  }

  return { ok: true }
}

export interface ChatRequestBody {
  message: string
  history: Array<{ role: string; content: string }>
}

export function validateChatRequestBody(
  body: ChatRequestBody,
): { ok: true; body: ChatRequestBody } | { ok: false; detail: string } {
  if (typeof body.message !== 'string' || !body.message.trim()) {
    return { ok: false, detail: 'Message is required' }
  }
  if (body.message.length > MAX_CHAT_MESSAGE_CHARS) {
    return {
      ok: false,
      detail: `Message exceeds ${MAX_CHAT_MESSAGE_CHARS} characters`,
    }
  }

  if (!Array.isArray(body.history)) {
    return { ok: false, detail: 'History must be an array' }
  }
  if (body.history.length > MAX_CHAT_HISTORY_TURNS) {
    return {
      ok: false,
      detail: `Conversation history exceeds ${MAX_CHAT_HISTORY_TURNS} turns`,
    }
  }

  for (const turn of body.history) {
    if (typeof turn.content !== 'string' || turn.content.length > MAX_CHAT_TURN_CHARS) {
      return {
        ok: false,
        detail: `Each history turn must be at most ${MAX_CHAT_TURN_CHARS} characters`,
      }
    }
  }

  return { ok: true, body }
}

export function requestGuardMiddleware(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const contentCheck = checkContentLength(
      c.req.path,
      c.req.method,
      c.req.header('Content-Length'),
    )
    if (!contentCheck.ok) {
      return c.json({ detail: contentCheck.detail }, 413)
    }

    c.header('X-Content-Type-Options', 'nosniff')
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')

    await next()
  }
}
