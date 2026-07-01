export interface AuthUser {
  id: string
  email: string
  is_admin: boolean
}

export interface AuthSession {
  access_token: string
  user: AuthUser
}

const TOKEN_KEY = 'chamber_auth_token'
const USER_KEY = 'chamber_auth_user'

export function loadStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  const userRaw = localStorage.getItem(USER_KEY)
  if (!token || !userRaw) return null
  try {
    return { access_token: token, user: JSON.parse(userRaw) as AuthUser }
  } catch {
    return null
  }
}

export function storeSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

export const authApi = {
  register: (email: string, password: string) =>
    fetchJson<AuthSession>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    fetchJson<AuthSession>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    fetchJson<AuthUser>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
}
