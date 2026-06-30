import { notFound } from 'next/navigation'
import { ArtistProfile } from '@/components/ArtistProfile'
import { serverApi } from '@/lib/api-server'

export const dynamic = 'force-dynamic'

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const [artist, tracks] = await Promise.all([serverApi.getArtist(id), serverApi.getTracks(id)])
    const breakdowns = (
      await Promise.all(tracks.map((track) => serverApi.getBreakdownsForTrack(track.id)))
    ).flat()

    return <ArtistProfile artist={artist} tracks={tracks} breakdowns={breakdowns} />
  } catch {
    notFound()
  }
}
