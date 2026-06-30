import Link from 'next/link'

export default function ArtistNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-chamber-red">Artist not found</p>
      <Link href="/lineage" className="text-chamber-gold underline">
        Back to Lineage
      </Link>
    </div>
  )
}
