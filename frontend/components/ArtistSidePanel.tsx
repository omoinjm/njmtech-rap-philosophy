'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { LineageNode } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { slidePanel } from '@/lib/motion'
import { EraBadge } from './EraBadge'
import { CategoryBadge } from './CategoryBadge'

interface Props {
  artist: LineageNode | null
  onClose: () => void
}

export function ArtistSidePanel({ artist, onClose }: Props) {
  return (
    <AnimatePresence>
      {artist && (
        <motion.div
          key={artist.id}
          variants={slidePanel}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-0 top-0 z-10 h-full w-full max-w-sm sm:max-w-md"
        >
          <Card className="h-full rounded-none border-l border-chamber-border bg-chamber-bg/95 py-0 ring-0 backdrop-blur-md">
            <CardHeader className="flex-row items-start justify-between space-y-0 px-6 pt-6">
              <div className="h-1 w-12" style={{ backgroundColor: CATEGORY_COLORS[artist.primary_category] }} />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="rounded-none text-muted-foreground hover:text-foreground"
                aria-label="Close panel"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="flex h-[calc(100%-4rem)] flex-col px-6 pb-6">
              <CardTitle className="font-heading mb-2 text-2xl text-white">{artist.name}</CardTitle>
              <div className="mb-4 flex flex-wrap gap-2">
                <EraBadge era={artist.era} />
                <CategoryBadge category={artist.primary_category} />
              </div>
              <Button
                render={<Link href={`/artist/${artist.id}`} />}
                className="mt-auto h-auto w-full rounded-none border border-primary bg-transparent py-3 text-sm uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Enter Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
