import { hashSync, compareSync } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

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
