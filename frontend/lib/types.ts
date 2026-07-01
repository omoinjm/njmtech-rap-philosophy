export type Era = 'old_school' | 'bridge' | 'new_school'

export type PhilosophicalCategory =
  | 'epistemology_mysticism'
  | 'street_stoicism'
  | 'social_ethics'
  | 'revolutionary_geopolitics'

export interface Artist {
  id: string
  name: string
  era: Era
  primary_category: PhilosophicalCategory
  secondary_category: PhilosophicalCategory | null
  bio: string | null
  spotify_artist_id: string | null
  image_url: string | null
  created_at: string
}

export interface Tradition {
  id: string
  name: string
  description: string | null
  category: PhilosophicalCategory
}

export interface Influence {
  id: string
  target_artist_id: string
  target_artist_name: string
  connection_label: string | null
  strength: number
}

export interface ArtistDetail extends Artist {
  traditions: Tradition[]
  influences: Influence[]
}

export interface LineageNode {
  id: string
  name: string
  era: Era
  primary_category: PhilosophicalCategory
  image_url: string | null
}

export interface LineageEdge {
  id: string
  source: string
  target: string
  label: string | null
  strength: number
}

export interface LineageGraph {
  nodes: LineageNode[]
  edges: LineageEdge[]
}

export interface CompassQuadrant {
  category: PhilosophicalCategory
  label: string
  description: string
  artists: LineageNode[]
}

export interface Track {
  id: string
  artist_id: string
  title: string
  spotify_track_id: string | null
  album: string | null
  year: number | null
}

export interface Breakdown {
  id: string
  track_id: string
  track_title: string
  artist_name: string
  lyric_excerpt: string
  philosophical_analysis: string
  tradition_id: string | null
  tradition_name: string | null
  is_curated: boolean
  submitted_by?: string | null
  submitted_by_email?: string | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
