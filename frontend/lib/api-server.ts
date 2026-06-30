const API_URL = process.env.INTERNAL_API_URL ?? 'http://127.0.0.1:8000'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

export const serverApi = {
  getArtists: () => fetchJson<import('./types').Artist[]>('/api/artists'),
  getArtist: (id: string) => fetchJson<import('./types').ArtistDetail>(`/api/artists/${id}`),
  getLineage: () => fetchJson<import('./types').LineageGraph>('/api/lineage'),
  getCompass: () => fetchJson<import('./types').CompassQuadrant[]>('/api/compass'),
  getTracks: (artistId: string) =>
    fetchJson<import('./types').Track[]>(`/api/tracks/${artistId}`),
  getBreakdowns: (traditionId?: string) => {
    const qs = traditionId ? `?tradition_id=${traditionId}` : ''
    return fetchJson<import('./types').Breakdown[]>(`/api/breakdowns${qs}`)
  },
  getBreakdownsForTrack: (trackId: string) =>
    fetchJson<import('./types').Breakdown[]>(`/api/breakdowns/track/${trackId}`),
  getTraditions: () => fetchJson<import('./types').Tradition[]>('/api/traditions'),
}
