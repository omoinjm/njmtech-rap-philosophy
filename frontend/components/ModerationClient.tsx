'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { clientApi } from '@/lib/api-client'
import type { Breakdown } from '@/lib/types'
import { useAuth } from '@/providers/AuthProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeInView } from '@/components/motion/FadeInView'
import { fadeUp, spinnerVariants, staggerContainer } from '@/lib/motion'

export function ModerationClient() {
  const { user, accessToken, loading: authLoading } = useAuth()
  const [pending, setPending] = useState<Breakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const loadPending = useCallback(async () => {
    if (!accessToken || !user?.is_admin) return
    setLoading(true)
    setError(null)
    try {
      setPending(await clientApi.getPendingBreakdowns(accessToken))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }, [accessToken, user?.is_admin])

  useEffect(() => {
    void loadPending()
  }, [loadPending])

  const handleApprove = async (id: string) => {
    if (!accessToken) return
    setActingId(id)
    setError(null)
    try {
      await clientApi.approveBreakdown(id, accessToken)
      setPending((items) => items.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approve failed')
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!accessToken) return
    setActingId(id)
    setError(null)
    try {
      await clientApi.rejectBreakdown(id, accessToken)
      setPending((items) => items.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reject failed')
    } finally {
      setActingId(null)
    }
  }

  if (authLoading) {
    return <LoadingSpinner label="Checking access..." />
  }

  if (!user || !user.is_admin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-heading mb-4 text-2xl font-bold text-white">Admin access required</h1>
        <p className="mb-6 text-muted-foreground">
          This page is for moderators only. Sign in with an admin account or return to The Cipher.
        </p>
        <Button render={<Link href="/cipher" />} className="rounded-none uppercase tracking-wider">
          Back to Cipher
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <FadeInView className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Moderation Queue</h1>
          <p className="mt-2 text-muted-foreground">
            Review community breakdown submissions before they appear in The Cipher.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadPending()}
          className="rounded-none uppercase tracking-wider"
        >
          Refresh
        </Button>
      </FadeInView>

      {loading ? (
        <LoadingSpinner label="Loading pending submissions..." />
      ) : pending.length === 0 ? (
        <p className="text-muted-foreground">No pending submissions — the queue is clear.</p>
      ) : (
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {pending.map((b) => (
            <motion.div key={b.id} variants={fadeUp}>
              <Card className="rounded-none border-chamber-border bg-chamber-surface py-0 ring-0">
                <CardHeader className="px-6 pt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="font-heading text-base text-primary">{b.artist_name}</CardTitle>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-sm text-muted-foreground">{b.track_title}</span>
                    <Badge variant="outline" className="rounded-none border-chamber-red text-chamber-red">
                      Pending
                    </Badge>
                  </div>
                  {b.submitted_by_email && (
                    <p className="mt-2 text-xs text-muted-foreground">Submitted by {b.submitted_by_email}</p>
                  )}
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <blockquote className="mb-3 border-l-2 border-primary pl-4 italic text-foreground/90">
                    &ldquo;{b.lyric_excerpt}&rdquo;
                  </blockquote>
                  <p className="text-sm leading-relaxed text-muted-foreground">{b.philosophical_analysis}</p>
                  {b.tradition_name && (
                    <p className="mt-3 text-xs text-muted-foreground">Tradition: {b.tradition_name}</p>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button
                      onClick={() => void handleApprove(b.id)}
                      disabled={actingId === b.id}
                      className="rounded-none uppercase tracking-wider"
                    >
                      {actingId === b.id ? 'Working...' : 'Approve'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleReject(b.id)}
                      disabled={actingId === b.id}
                      className="rounded-none border-chamber-red uppercase tracking-wider text-chamber-red hover:bg-chamber-red hover:text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
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
