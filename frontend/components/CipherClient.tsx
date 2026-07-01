'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { clientApi } from '@/lib/api-client'
import type { Artist, Breakdown, Track, Tradition } from '@/lib/types'
import { useAuth } from '@/providers/AuthProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FadeInView } from '@/components/motion/FadeInView'
import { fadeUp, spinnerVariants, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface Props {
  initialBreakdowns: Breakdown[]
  traditions: Tradition[]
  artists: Artist[]
  tracks: Track[]
}

export function CipherClient({ initialBreakdowns, traditions, artists, tracks }: Props) {
  const { user, accessToken, signInWithEmail, signUpWithEmail, signOut, loading: authLoading } =
    useAuth()

  const [breakdowns, setBreakdowns] = useState(initialBreakdowns)
  const [traditionFilter, setTraditionFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  const [formTrackId, setFormTrackId] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formAnalysis, setFormAnalysis] = useState('')
  const [formTraditionId, setFormTraditionId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!traditionFilter) {
      setBreakdowns(initialBreakdowns)
      return
    }
    setLoading(true)
    clientApi
      .getBreakdowns(traditionFilter)
      .then(setBreakdowns)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [traditionFilter, initialBreakdowns])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    try {
      if (authMode === 'signin') await signInWithEmail(email, password)
      else await signUpWithEmail(email, password)
      setShowAuth(false)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Auth failed')
    }
  }

  const handleSubmitBreakdown = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken) return
    setSubmitting(true)
    setError(null)
    try {
      await clientApi.submitBreakdown(
        {
          track_id: formTrackId,
          lyric_excerpt: formExcerpt,
          philosophical_analysis: formAnalysis,
          tradition_id: formTraditionId || undefined,
        },
        accessToken,
      )
      setFormTrackId('')
      setFormExcerpt('')
      setFormAnalysis('')
      setFormTraditionId('')
      setShowForm(false)
      setSubmitSuccess('Submission received — it will appear in The Cipher after moderator approval.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <FadeInView className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">The Cipher</h1>
          <p className="mt-2 text-muted-foreground">Browse and submit philosophical lyric breakdowns.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!authLoading && user ? (
            <>
              <span className="self-center text-xs text-muted-foreground">{user.email}</span>
              <Button
                onClick={() => setShowForm(true)}
                className="rounded-none uppercase tracking-wider"
              >
                Submit Breakdown
              </Button>
              <Button variant="outline" onClick={signOut} className="rounded-none uppercase tracking-wider">
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowAuth(true)} className="rounded-none uppercase tracking-wider">
              Sign In to Submit
            </Button>
          )}
        </div>
      </FadeInView>

      <FadeInView className="mb-6" delay={0.05}>
        <Label htmlFor="tradition-filter" className="mb-2 block text-xs uppercase tracking-wider">
          Filter by tradition
        </Label>
        <select
          id="tradition-filter"
          value={traditionFilter}
          onChange={(e) => setTraditionFilter(e.target.value)}
          className={cn(
            'h-8 w-full rounded-none border border-input bg-chamber-surface px-3 text-sm sm:max-w-xs',
          )}
        >
          <option value="">All traditions</option>
          {traditions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </FadeInView>

      {loading ? (
        <LoadingSpinner label="Loading breakdowns..." />
      ) : (
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {breakdowns.map((b) => (
            <motion.div key={b.id} variants={fadeUp}>
              <Card className="rounded-none border-chamber-border bg-chamber-surface py-0 ring-0">
                <CardHeader className="px-6 pt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="font-heading text-base text-primary">{b.artist_name}</CardTitle>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-sm text-muted-foreground">{b.track_title}</span>
                    {b.is_curated && (
                      <Badge variant="outline" className="rounded-none border-primary text-primary">
                        Curated
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <blockquote className="mb-3 border-l-2 border-primary pl-4 italic text-foreground/90">
                    &ldquo;{b.lyric_excerpt}&rdquo;
                  </blockquote>
                  <p className="text-sm leading-relaxed text-muted-foreground">{b.philosophical_analysis}</p>
                  {b.tradition_name && (
                    <p className="mt-3 text-xs text-muted-foreground">{b.tradition_name}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {breakdowns.length === 0 && (
            <p className="text-muted-foreground">No breakdowns found for this filter.</p>
          )}
        </motion.div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {submitSuccess && <p className="mt-4 text-sm text-primary">{submitSuccess}</p>}

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="rounded-none border-chamber-border bg-chamber-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </DialogTitle>
            <DialogDescription>Access The Cipher to submit lyric breakdowns.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-none bg-chamber-bg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none bg-chamber-bg"
              />
            </div>
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button type="submit" className="w-full rounded-none uppercase tracking-wider">
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-none text-xs"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              >
                {authMode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border-chamber-border bg-chamber-surface sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Submit Breakdown</DialogTitle>
            {!accessToken && (
              <DialogDescription>Sign in required to submit.</DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmitBreakdown} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="track">Track</Label>
              <select
                id="track"
                value={formTrackId}
                onChange={(e) => setFormTrackId(e.target.value)}
                required
                className="h-8 w-full rounded-none border border-input bg-chamber-bg px-3 text-sm"
              >
                <option value="">Select track</option>
                {tracks.map((t) => {
                  const artist = artists.find((a) => a.id === t.artist_id)
                  return (
                    <option key={t.id} value={t.id}>
                      {artist?.name} — {t.title}
                    </option>
                  )
                })}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Lyric excerpt</Label>
              <Textarea
                id="excerpt"
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                required
                rows={3}
                className="rounded-none bg-chamber-bg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analysis">Philosophical analysis</Label>
              <Textarea
                id="analysis"
                value={formAnalysis}
                onChange={(e) => setFormAnalysis(e.target.value)}
                required
                rows={6}
                className="rounded-none bg-chamber-bg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradition">Tradition (optional)</Label>
              <select
                id="tradition"
                value={formTraditionId}
                onChange={(e) => setFormTraditionId(e.target.value)}
                className="h-8 w-full rounded-none border border-input bg-chamber-bg px-3 text-sm"
              >
                <option value="">None</option>
                {traditions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="submit"
                disabled={submitting || !accessToken}
                className="flex-1 rounded-none uppercase tracking-wider"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-none uppercase tracking-wider"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <motion.div
        className="size-4 border-2 border-primary border-t-transparent"
        variants={spinnerVariants}
        animate="animate"
      />
      <span>{label}</span>
    </div>
  )
}
