import { CompassView } from '@/components/CompassView'
import { serverApi } from '@/lib/api-server'

export const dynamic = 'force-dynamic'

export default async function CompassPage() {
  const quadrants = await serverApi.getCompass()
  return <CompassView quadrants={quadrants} />
}
