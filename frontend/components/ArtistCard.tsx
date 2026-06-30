'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { LineageNode } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { EraBadge } from './EraBadge'
import { cn } from '@/lib/utils'

interface Props {
  artist: LineageNode
  compact?: boolean
}

export function ArtistCard({ artist, compact }: Props) {
  const accent = CATEGORY_COLORS[artist.primary_category]

  return (
    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
      <Link href={`/artist/${artist.id}`} className="block">
        <Card
          className={cn(
            'rounded-none border-chamber-border bg-chamber-surface py-0 ring-0 transition-colors hover:border-primary',
          )}
          style={{ borderLeftWidth: 3, borderLeftColor: accent }}
        >
          <CardContent className={cn('p-3', !compact && 'sm:p-4')}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-sm font-semibold text-white sm:text-base">{artist.name}</h3>
              <EraBadge era={artist.era} />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
