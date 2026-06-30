import type { Metadata } from 'next'
import { Space_Grotesk, Inter, Geist } from 'next/font/google'
import { SiteShell } from '@/components/SiteShell'
import { AuthProvider } from '@/providers/AuthProvider'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'The 37th Chamber',
  description: 'Street Knowledge. Mapped. — Rap Philosophy exploration platform.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('dark', spaceGrotesk.variable, inter.variable, 'font-sans', geist.variable)}>
      <body>
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  )
}
