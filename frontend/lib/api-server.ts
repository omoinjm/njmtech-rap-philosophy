const DEFAULT_API = process.env.INTERNAL_API_URL ?? 'http://127.0.0.1:8787'

async function serverFetch<T>(path: string): Promise<T> {
  let res: Response

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = await getCloudflareContext({ async: true })
    const api = (env as { API?: { fetch: typeof fetch } }).API
    if (api) {
      res = await api.fetch(new Request(`https://internal${path}`))
    } else {
      res = await fetch(`${DEFAULT_API}${path}`, { next: { revalidate: 60 } })
    }
  } catch {
    res = await fetch(`${DEFAULT_API}${path}`, { next: { revalidate: 60 } })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

export const serverApi = {
  getArtists: () => serverFetch<import('./types').Artist[]>('/api/artists'),
  getArtist: (id: string) => serverFetch<import('./types').ArtistDetail>(`/api/artists/${id}`),
  getLineage: () => serverFetch<import('./types').LineageGraph>('/api/lineage'),
  getCompass: () => serverFetch<import('./types').CompassQuadrant[]>('/api/compass'),
  getTracks: (artistId: string) =>
    serverFetch<import('./types').Track[]>(`/api/tracks/${artistId}`),
  getBreakdowns: (traditionId?: string) => {
    const qs = traditionId ? `?tradition_id=${traditionId}` : ''
    return serverFetch<import('./types').Breakdown[]>(`/api/breakdowns${qs}`)
  },
  getBreakdownsForTrack: (trackId: string) =>
    serverFetch<import('./types').Breakdown[]>(`/api/breakdowns/track/${trackId}`),
  getTraditions: () => serverFetch<import('./types').Tradition[]>('/api/traditions'),
}
