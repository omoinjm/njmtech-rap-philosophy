'use client'

import { motion } from 'framer-motion'
import type { CompassQuadrant } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/constants'
import { ArtistCard } from './ArtistCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeInView } from '@/components/motion/FadeInView'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function CompassView({ quadrants }: { quadrants: CompassQuadrant[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <FadeInView className="mb-10">
        <h1 className="font-heading mb-2 text-3xl font-bold text-white sm:text-4xl">
          The Philosophical Compass
        </h1>
        <p className="text-muted-foreground">
          Four quadrants of rap philosophy — click an artist to enter their chamber.
        </p>
      </FadeInView>

      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={staggerContainer}
      >
        {quadrants.map((q) => (
          <motion.section
            key={q.category}
            id={q.category}
            variants={fadeUp}
            className="overflow-hidden"
          >
            <Card
              className={cn('rounded-none border-chamber-border bg-chamber-surface py-0 ring-0')}
              style={{ borderTopWidth: 4, borderTopColor: CATEGORY_COLORS[q.category] }}
            >
              <CardHeader className="border-b border-chamber-border px-5 py-5">
                <CardTitle className="font-heading text-xl text-white">{q.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{q.description}</p>
              </CardHeader>
              <CardContent className="grid gap-px bg-chamber-border p-0 sm:grid-cols-2">
                {q.artists.length === 0 ? (
                  <p className="col-span-2 bg-chamber-surface p-6 text-sm text-muted-foreground">
                    No artists in this quadrant yet.
                  </p>
                ) : (
                  q.artists.map((a) => (
                    <div key={a.id} className="bg-chamber-surface">
                      <ArtistCard artist={a} compact />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.section>
        ))}
      </motion.div>
    </div>
  )
}
