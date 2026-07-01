'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  authApi,
  clearSession,
  loadStoredSession,
  storeSession,
  type AuthSession,
  type AuthUser,
} from '@/lib/auth'

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: (credential: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = loadStoredSession()
    if (!stored) {
      setLoading(false)
      return
    }

    authApi
      .me(stored.access_token)
      .then((me) => {
        setUser(me)
        setAccessToken(stored.access_token)
      })
      .catch(() => clearSession())
      .finally(() => setLoading(false))
  }, [])

  const applySession = (session: AuthSession) => {
    storeSession(session)
    setUser(session.user)
    setAccessToken(session.access_token)
  }

  const signInWithEmail = async (email: string, password: string) => {
    applySession(await authApi.login(email, password))
  }

  const signUpWithEmail = async (email: string, password: string) => {
    applySession(await authApi.register(email, password))
  }

  const signInWithGoogle = async (credential: string) => {
    applySession(await authApi.googleLogin(credential))
  }

  const signOut = () => {
    clearSession()
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
