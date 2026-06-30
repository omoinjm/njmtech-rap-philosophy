import { Navbar } from './Navbar'

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-chamber-border px-4 py-6 text-center text-xs text-gray-500">
        Street Knowledge. Mapped. &mdash; The 37th Chamber
      </footer>
    </div>
  )
}
