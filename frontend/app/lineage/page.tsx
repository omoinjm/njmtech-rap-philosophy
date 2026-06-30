import { LineageGraphView } from '@/components/LineageGraphView'
import { serverApi } from '@/lib/api-server'

export const dynamic = 'force-dynamic'

export default async function LineagePage() {
  const graph = await serverApi.getLineage()
  return <LineageGraphView graph={graph} />
}
