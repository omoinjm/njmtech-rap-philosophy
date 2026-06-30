import { CipherClient } from '@/components/CipherClient'
import { serverApi } from '@/lib/api-server'

export const dynamic = 'force-dynamic'

export default async function CipherPage() {
  const [breakdowns, traditions, artists] = await Promise.all([
    serverApi.getBreakdowns(),
    serverApi.getTraditions(),
    serverApi.getArtists(),
  ])

  const tracks = (
    await Promise.all(artists.map((artist) => serverApi.getTracks(artist.id)))
  ).flat()

  return (
    <CipherClient
      initialBreakdowns={breakdowns}
      traditions={traditions}
      artists={artists}
      tracks={tracks}
    />
  )
}
