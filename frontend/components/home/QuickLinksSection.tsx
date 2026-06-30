'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/button'
import { FadeInView } from '@/components/motion/FadeInView'
import { QUICK_LINKS } from '@/data/navigation'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function QuickLinksSection() {
  return (
    <section className="border-t border-chamber-border bg-chamber-surface/50 px-4 py-16">
      <FadeInView className="mx-auto max-w-7xl">
        <motion.div
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {QUICK_LINKS.map(({ href, label }) => (
            <motion.div key={href} variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={href}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'rounded-none border-chamber-border px-6 py-3 text-sm uppercase tracking-wider',
                )}
              >
                {label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </FadeInView>
    </section>
  )
}
