'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import type { HTMLMotionProps } from 'framer-motion'
import { useInView } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUp } from '@/lib/motion'

interface FadeInViewProps extends HTMLMotionProps<'div'> {
  as?: 'div' | 'section' | 'article'
  delay?: number
}

export function FadeInView({
  as = 'div',
  className,
  children,
  delay = 0,
  ...props
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  if (as === 'section') {
    return (
      <motion.section
        ref={ref}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeUp}
        transition={{ delay }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.section>
    )
  }

  if (as === 'article') {
    return (
      <motion.article
        ref={ref}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeUp}
        transition={{ delay }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.article>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
