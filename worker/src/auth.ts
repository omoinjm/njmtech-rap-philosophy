import { hashSync, compareSync } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

import type { Context } from 'hono'

import type { Env } from './types'

export function hashPassword(password: string): string {
  return hashSync(password, 10)
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return compareSync(password, passwordHash)
}

function jwtSecret(env: Env): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET)
}

export async function createAccessToken(
  env: Env,
  userId: string,
  email: string,
): Promise<string> {
  const hours = Number(env.JWT_EXPIRE_HOURS ?? '168')
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setExpirationTime(`${hours}h`)
    .sign(jwtSecret(env))
}

export async function verifyToken(
  env: Env,
  token: string,
): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret(env))
    const userId = payload.sub
    const email = payload.email
    if (!userId || typeof email !== 'string') return null
    return { userId, email }
  } catch {
    return null
  }
}

export function bearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

export function parseAdminEmails(value?: string): Set<string> {
  if (!value?.trim()) return new Set()
  return new Set(
    value
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isConfiguredAdmin(email: string, env: Env): boolean {
  return parseAdminEmails(env.ADMIN_EMAILS).has(email.toLowerCase())
}

export async function promoteAdminIfConfigured(
  db: D1Database,
  env: Env,
  userId: string,
  email: string,
): Promise<void> {
  if (!isConfiguredAdmin(email, env)) return
  await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(userId).run()
}

export function userPayload(user: { id: string; email: string; is_admin: number }) {
  return {
    id: user.id,
    email: user.email,
    is_admin: Boolean(user.is_admin),
  }
}

type AuthUserRow = { id: string; email: string; is_admin: number }

export async function getAuthUser(db: D1Database, userId: string): Promise<AuthUserRow | null> {
  return db
    .prepare('SELECT id, email, is_admin FROM users WHERE id = ?')
    .bind(userId)
    .first<AuthUserRow>()
}
