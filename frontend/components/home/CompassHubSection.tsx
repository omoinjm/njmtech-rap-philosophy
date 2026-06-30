'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeInView } from '@/components/motion/FadeInView'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from '@/lib/constants'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function CompassHubSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <FadeInView>
        <h2 className="font-heading mb-2 text-2xl font-bold text-white">The Philosophical Compass</h2>
        <p className="mb-10 text-muted-foreground">Four traditions. One lineage. Choose your quadrant.</p>
      </FadeInView>

      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        {CATEGORIES.map((cat) => (
          <motion.div key={cat} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Link href={`/compass#${cat}`} className="block h-full">
              <Card
                className={cn(
                  'h-full rounded-none border-chamber-border bg-chamber-surface py-0 ring-0 transition-colors hover:border-primary',
                )}
                style={{ borderTopWidth: 3, borderTopColor: CATEGORY_COLORS[cat] }}
              >
                <CardHeader className="px-6 pt-6">
                  <CardTitle className="font-heading text-lg text-white transition-colors group-hover:text-primary">
                    {CATEGORY_LABELS[cat]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-sm text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[cat]}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
