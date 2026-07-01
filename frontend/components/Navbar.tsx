'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { NAV_ITEMS } from '@/data/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = user?.is_admin
    ? [...NAV_ITEMS, { href: '/admin', label: 'Admin' }]
    : [...NAV_ITEMS]

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-chamber-border bg-chamber-bg/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight text-chamber-gold sm:text-xl"
        >
          THE 37TH CHAMBER
        </Link>

        <NavigationMenu className="max-w-none flex-none">
          <NavigationMenuList className="flex-wrap justify-end gap-1 sm:gap-2">
            {navItems.map(({ href, label }) => {
              const active = pathname === href
              return (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink
                    render={<Link href={href} />}
                    className={cn(
                      'rounded-none px-2 py-1 text-xs font-medium uppercase tracking-wider sm:px-3 sm:text-sm',
                      active
                        ? 'border-b-2 border-primary text-primary bg-transparent'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </motion.header>
  )
}
