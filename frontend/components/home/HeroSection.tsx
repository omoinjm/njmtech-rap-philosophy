'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/button'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function HeroSection() {
  return (
    <section className="grain-overlay relative flex min-h-[70vh] flex-col items-center justify-center border-b border-chamber-border px-4 py-20 text-center">
      <motion.div
        className="relative z-10 max-w-3xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
        }}
      >
        <motion.p
          variants={fadeUp}
          className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-chamber-gold"
        >
          Rap Philosophy Platform
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="font-heading mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl"
        >
          THE 37TH CHAMBER
        </motion.h1>
        <motion.p variants={fadeUp} className="mb-10 text-lg text-muted-foreground sm:text-xl">
          Street Knowledge. Mapped.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/lineage"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-auto rounded-none border-2 border-primary bg-primary px-8 py-4 font-heading text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-transparent hover:text-primary',
            )}
          >
            Enter The Chamber
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
