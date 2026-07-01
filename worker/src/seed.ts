import type { PhilosophicalCategory } from './types'

const TRADITIONS: Array<{
  name: string
  description: string
  category: PhilosophicalCategory
}> = [
  {
    name: 'Five-Percent Nation',
    description:
      'Nation of Gods and Earths teachings on knowledge of self, Supreme Mathematics, and divine identity.',
    category: 'epistemology_mysticism',
  },
  {
    name: 'Stoicism',
    description:
      'Ancient philosophy of endurance, discipline, and acceptance of fate under harsh conditions.',
    category: 'street_stoicism',
  },
  {
    name: 'Marxist Theory',
    description: 'Class analysis, dialectical materialism, and critique of capitalist structures.',
    category: 'revolutionary_geopolitics',
  },
  {
    name: 'Afrocentric Humanism',
    description: 'Black consciousness, community ethics, and cultural self-determination.',
    category: 'social_ethics',
  },
  {
    name: 'Taoism',
    description: 'The way of natural flow, balance, and wu wei — action through non-action.',
    category: 'epistemology_mysticism',
  },
  {
    name: 'Existentialism',
    description: 'Radical freedom, authenticity, and creating meaning in an absurd world.',
    category: 'social_ethics',
  },
]

const ARTISTS: Array<{
  name: string
  era: string
  primary_category: PhilosophicalCategory
  secondary_category: PhilosophicalCategory | null
  bio: string
  spotify_artist_id: string
  image_url: string
}> = [
  {
    name: 'The RZA',
    era: 'old_school',
    primary_category: 'epistemology_mysticism',
    secondary_category: 'revolutionary_geopolitics',
    bio: 'Abbot of the Wu-Tang Clan. Architect of Shaolin mathematics, chess strategy, and cinematic kung-fu philosophy applied to beat-making and street knowledge.',
    spotify_artist_id: '690sxjOsFr2w0k3JNQkH7T',
    image_url: 'https://r2.theaudiodb.com/images/media/artist/thumb/rza-5051ece0eadfa.jpg',
  },
  {
    name: 'Roc Marciano',
    era: 'old_school',
    primary_category: 'street_stoicism',
    secondary_category: 'epistemology_mysticism',
    bio: 'Marci Beaucoup. The godfather of drumless luxury loops — criminal stoicism rendered as minimalist street scripture.',
    spotify_artist_id: '4kYSro6naA4h99UJvo89B1',
    image_url: 'https://r2.theaudiodb.com/images/media/artist/thumb/xwsypt1409025539.jpg',
  },
  {
    name: 'Immortal Technique',
    era: 'old_school',
    primary_category: 'revolutionary_geopolitics',
    secondary_category: 'social_ethics',
    bio: 'Peruvian-American revolutionary MC. Uncompromising geopolitical analysis, class consciousness, and guerrilla rhetoric.',
    spotify_artist_id: '6jBq8hE0u6Ov3VMSUkmplX',
    image_url: 'https://r2.theaudiodb.com/images/media/artist/thumb/wruqww1361058448.jpg',
  },
  {
    name: 'Westside Gunn',
    era: 'bridge',
    primary_category: 'street_stoicism',
    secondary_category: 'epistemology_mysticism',
    bio: 'Flygod. Griselda co-founder. Wrestler aesthetics meet luxury crime rap — the bridge between RZA\'s mysticism and Roc\'s stoicism.',
    spotify_artist_id: '0FjnQ8lJOM3L4zN1Q2j8lO',
    image_url: 'https://r2.theaudiodb.com/images/media/artist/thumb/twqssw1587200347.jpg',
  },
  {
    name: 'Joey Bada$$',
    era: 'bridge',
    primary_category: 'epistemology_mysticism',
    secondary_category: 'social_ethics',
    bio: 'Pro Era founder. Brooklyn\'s bridge generation — 90s consciousness reimagined for the streaming era.',
    spotify_artist_id: '2P5sC9C1bM9Z2f0vFUXGLO',
    image_url: 'https://r2.theaudiodb.com/images/media/artist/thumb/n7oq9n1658631854.jpg',
  },
  {
    name: 'A Tribe Called Quest',
    era: 'old_school',
    primary_category: 'social_ethics',
    secondary_category: 'epistemology_mysticism',
    bio: 'Native Tongues architects. Jazz-inflected Afrocentric humanism, community ethics, and the low end theory of conscious rap.',
    spotify_artist_id: '09ABFppSlC3DXuLtXq6C2O',
    image_url:
      'https://r2.theaudiodb.com/images/media/artist/thumb/tribe-called-quest-a-5012b67a6702e.jpg',
  },
  {
    name: 'Navy Blue',
    era: 'new_school',
    primary_category: 'social_ethics',
    secondary_category: 'epistemology_mysticism',
    bio: 'Def Jam A&R turned producer-MC. Introspective new school ethics rooted in Tribe Called Quest lineage.',
    spotify_artist_id: '1QAJqy2dA3ihHRCdP0ut1N',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/1/1f/Navy_Blue_performing_12.7.21.png',
  },
  {
    name: 'Armand Hammer',
    era: 'new_school',
    primary_category: 'revolutionary_geopolitics',
    secondary_category: 'epistemology_mysticism',
    bio: 'billy woods and ELUCID. Abstract revolutionary geopolitics — paranoia, poetry, and post-colonial theory over alchemical beats.',
    spotify_artist_id: '3cQO7jp5S9qLBoIVtbkSM1',
    image_url: 'https://r2.theaudiodb.com/images/media/artist/thumb/qhj13a1696754751.jpg',
  },
  {
    name: 'Boldy James',
    era: 'new_school',
    primary_category: 'street_stoicism',
    secondary_category: 'social_ethics',
    bio: 'Detroit\'s measured narrator. Roc Marciano\'s heir apparent — unhurried stoic storytelling over Alchemist and Real Bad Man production.',
    spotify_artist_id: '4kH4Nup7e1GlsTSECiimmI',
    image_url: 'https://r2.theaudiodb.com/images/media/artist/thumb/z3w22k1689579549.jpg',
  },
]

const INFLUENCES: Array<[string, string, string, number]> = [
  ['Westside Gunn', 'Roc Marciano', 'Criminal Stoicism; Drumless Luxury Loops', 9],
  ['Westside Gunn', 'The RZA', 'Shaolin Mathematics; Cinematic Mysticism', 8],
  ['Joey Bada$$', 'The RZA', 'Five-Percent Knowledge; Beat Architecture', 7],
  ['Joey Bada$$', 'A Tribe Called Quest', 'Native Tongues Ethics; Jazz Consciousness', 9],
  ['Navy Blue', 'A Tribe Called Quest', 'Low End Theory Lineage; Community Ethics', 8],
  ['Armand Hammer', 'Immortal Technique', 'Revolutionary Geopolitics; Guerrilla Rhetoric', 8],
  ['Boldy James', 'Roc Marciano', 'Measured Stoicism; Crime Narrative Minimalism', 9],
]

const TRACKS: Array<[string, string, string, string, number]> = [
  ['The RZA', 'Protect Ya Neck', '743mgbaWbrZEkofD66ZGR0', 'Enter the Wu-Tang (36 Chambers)', 1993],
  ['Roc Marciano', 'Snow', '78WpL30JbFhkbPoeprZ2fr', 'Marcberg', 2010],
  ['Immortal Technique', 'Dance with the Devil', '7MDUVH4ITohsIjdynRwCJp', 'Revolutionary Vol. 1', 2001],
  ['Westside Gunn', '327', '5sxRbu2Oi9lgmLO8taA3Rf', 'Pray for Paris', 2020],
  ['Joey Bada$$', 'Waves', '3AM2ihc5RFzbC47eCpTg2I', '1999', 2012],
  ['A Tribe Called Quest', 'Can I Kick It?', '5q6pg1kvXfT7z5MqG0KKSs', "People's Instinctive Travels", 1990],
  ['Navy Blue', 'Post Panic!', '6uMqJQvja5YpIWqcGOLRoj', 'Song of Sage: Post Panic!', 2020],
  ['Armand Hammer', 'Falling out the Sky', '1jvbeXQgI7SA47MaXXGixh', 'Haram', 2021],
  ['Boldy James', 'First 48 Freestyle', '30F9xlqPC7R9I4H4Qj3LAF', 'Bo Jackson', 2021],
]

const BREAKDOWNS: Array<[string, string, string, string, string, boolean]> = [
  [
    'The RZA',
    'Protect Ya Neck',
    "Shaolin shadowboxin' and the Wu-Tang sword style",
    "RZA encodes Five-Percent Nation mathematics into battle rhetoric — each member's verse is a cipher of self-knowledge, transforming the cipher into a philosophical proving ground.",
    'Five-Percent Nation',
    true,
  ],
  [
    'Immortal Technique',
    'Dance with the Devil',
    "I'mma tell you a story about a kid from Harlem",
    "A parable of moral collapse under capitalism's violence — existentialist horror rendered as street testimony, forcing the listener to confront complicity without redemption.",
    'Marxist Theory',
    true,
  ],
  [
    'A Tribe Called Quest',
    'Can I Kick It?',
    'Can I kick it? To all my people',
    'The call-and-response structure embodies Afrocentric community ethics — the cipher as democratic space where every voice validates the collective.',
    'Afrocentric Humanism',
    true,
  ],
]

export async function ensureSeed(db: D1Database): Promise<void> {
  const existing = await db.prepare('SELECT id FROM artists LIMIT 1').first()
  if (existing) return

  const traditionMap = new Map<string, string>()
  for (const t of TRADITIONS) {
    const id = crypto.randomUUID()
    traditionMap.set(t.name, id)
    await db
      .prepare(
        'INSERT INTO philosophical_traditions (id, name, description, category) VALUES (?, ?, ?, ?)',
      )
      .bind(id, t.name, t.description, t.category)
      .run()
  }

  const artistMap = new Map<string, string>()
  for (const a of ARTISTS) {
    const id = crypto.randomUUID()
    artistMap.set(a.name, id)
    await db
      .prepare(
        `INSERT INTO artists (id, name, era, primary_category, secondary_category, bio, spotify_artist_id, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        a.name,
        a.era,
        a.primary_category,
        a.secondary_category,
        a.bio,
        a.spotify_artist_id,
        a.image_url,
      )
      .run()
  }

  for (const a of ARTISTS) {
    const artistId = artistMap.get(a.name)!
    for (const t of TRADITIONS) {
      if (t.category === a.primary_category) {
        await db
          .prepare(
            'INSERT INTO artist_traditions (artist_id, tradition_id) VALUES (?, ?)',
          )
          .bind(artistId, traditionMap.get(t.name)!)
          .run()
      }
    }
  }

  for (const [source, target, label, strength] of INFLUENCES) {
    await db
      .prepare(
        `INSERT INTO influences (id, source_artist_id, target_artist_id, connection_label, strength)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        artistMap.get(source)!,
        artistMap.get(target)!,
        label,
        strength,
      )
      .run()
  }

  const trackMap = new Map<string, string>()
  for (const [artistName, title, spotifyId, album, year] of TRACKS) {
    const id = crypto.randomUUID()
    trackMap.set(`${artistName}:${title}`, id)
    await db
      .prepare(
        `INSERT INTO tracks (id, artist_id, title, spotify_track_id, album, year)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, artistMap.get(artistName)!, title, spotifyId, album, year)
      .run()
  }

  for (const [artistName, trackTitle, excerpt, analysis, traditionName, isCurated] of BREAKDOWNS) {
    await db
      .prepare(
        `INSERT INTO lyric_breakdowns
         (id, track_id, lyric_excerpt, philosophical_analysis, tradition_id, is_curated)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        trackMap.get(`${artistName}:${trackTitle}`)!,
        excerpt,
        analysis,
        traditionMap.get(traditionName) ?? null,
        isCurated ? 1 : 0,
      )
      .run()
  }
}
