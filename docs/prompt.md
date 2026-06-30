You are building a web application called "The 37th Chamber" — a Rap Philosophy
exploration platform that maps hip-hop artists to philosophical traditions and their
generational influences.

---

## TECH STACK

- Frontend: React (Vite) + TypeScript
- Styling: Tailwind CSS
- Graph/Lineage Visualization: React Flow
- Backend: FastAPI (Python)
- Database: PostgreSQL (Neon serverless) via SQLAlchemy (async)
- AI Chatbot: Anthropic Claude API (claude-sonnet-4-6)
- Music: Spotify Web API (embedded player + metadata)
- Auth: Supabase Auth (email + Google OAuth)
- Deployment: Frontend on Vercel, Backend on Railway or Azure Container Apps

---

## VISUAL DESIGN

- Dark mode only
- Background: #0A0A0A (near black)
- Primary accent: #C9A84C (gold)
- Secondary accent: #8B0000 (graffiti red)
- Font: "Space Grotesk" for headings, "Inter" for body
- Aesthetic: Clean modern typography over gritty, textured dark backgrounds
- Subtle grain/noise overlay on hero sections (CSS or SVG filter)
- No rounded-corner softness — sharp edges, hard lines

---

## DATABASE SCHEMA

Create the following PostgreSQL tables via SQLAlchemy models:

### artists

- id: UUID (primary key)
- name: TEXT
- era: ENUM('old_school', 'bridge', 'new_school')
- primary_category: ENUM('epistemology_mysticism', 'street_stoicism', 'social_ethics', 'revolutionary_geopolitics')
- secondary_category: same ENUM (nullable)
- bio: TEXT
- spotify_artist_id: TEXT
- image_url: TEXT
- created_at: TIMESTAMP

### philosophical_traditions

- id: UUID
- name: TEXT (e.g. "Five-Percent Nation", "Marxist Theory", "Stoicism")
- description: TEXT
- category: same ENUM as artists

### artist_traditions (join table)

- artist_id: UUID (FK → artists)
- tradition_id: UUID (FK → philosophical_traditions)

### influences (self-referencing)

- id: UUID
- source_artist_id: UUID (FK → artists) — the influenced artist
- target_artist_id: UUID (FK → artists) — the blueprint/influence
- connection_label: TEXT (e.g. "Criminal Stoicism; Drumless Luxury Loops")
- strength: INTEGER (1–10)

### tracks

- id: UUID
- artist_id: UUID (FK → artists)
- title: TEXT
- spotify_track_id: TEXT
- album: TEXT
- year: INTEGER

### lyric_breakdowns

- id: UUID
- track_id: UUID (FK → tracks)
- lyric_excerpt: TEXT
- philosophical_analysis: TEXT
- tradition_id: UUID (FK → philosophical_traditions, nullable)
- submitted_by: UUID (FK → users, nullable)
- is_curated: BOOLEAN (default false)

---

## SEED DATA

Seed the database with the following artists on first run:

| Name                 | Era        | Primary                   | Secondary                 | Influences (source→target) |
| -------------------- | ---------- | ------------------------- | ------------------------- | -------------------------- |
| The RZA              | old_school | epistemology_mysticism    | revolutionary_geopolitics | —                          |
| Roc Marciano         | old_school | street_stoicism           | epistemology_mysticism    | —                          |
| Immortal Technique   | old_school | revolutionary_geopolitics | social_ethics             | —                          |
| Westside Gunn        | bridge     | street_stoicism           | epistemology_mysticism    | Roc Marciano, The RZA      |
| Joey Bada$$          | bridge     | epistemology_mysticism    | social_ethics             | The RZA, ATCQ              |
| A Tribe Called Quest | old_school | social_ethics             | epistemology_mysticism    | —                          |
| Navy Blue            | new_school | social_ethics             | epistemology_mysticism    | A Tribe Called Quest       |
| Armand Hammer        | new_school | revolutionary_geopolitics | epistemology_mysticism    | Immortal Technique         |
| Boldy James          | new_school | street_stoicism           | social_ethics             | Roc Marciano               |

---

## PAGES & FEATURES TO BUILD

### 1. Home / Landing Page (/)

- Full-width hero: App name, tagline ("Street Knowledge. Mapped.")
- Four category hub cards linking to the Compass view
- "Enter The Chamber" CTA button

### 2. The Philosophical Compass (/compass)

- Four quadrant grid, one per philosophical category
- Each quadrant: category name, short description, artist thumbnails
- Clicking an artist navigates to their profile

### 3. The Lineage Map (/lineage)

- Full-screen interactive graph built with React Flow
- Nodes: artist cards (name + era badge + category color)
- Edges: labeled with connection_label from the influences table
- Color coding by primary_category:
  - epistemology_mysticism → gold (#C9A84C)
  - street_stoicism → silver (#A8A8A8)
  - social_ethics → green (#2D6A4F)
  - revolutionary_geopolitics → red (#8B0000)
- Controls: filter by era, filter by category
- Clicking a node opens an artist side panel

### 4. Artist Profile (/artist/:id)

- Hero: artist image, name, era badge, Spotify follow button
- Philosophical DNA section: primary + secondary category with description
- Influences section: mini lineage showing who shaped them
- Tracks section: embedded Spotify player for their key tracks
- Lyric Breakdowns section: curated philosophical analyses of their lines

### 5. The Tape Deck AI (/tapedeck)

- Chat interface styled like an old-school messenger or iMessage bubble UI
- System prompt: "You are an encyclopaedic hip-hop philosopher and record store
  clerk who speaks with the authority of someone who has been studying rap music
  and political philosophy since the early 90s. You connect rap lyrics to
  philosophical traditions, political theory, and spiritual texts. You are
  opinionated, passionate, and deeply knowledgeable. You recommend music like an
  older uncle who wants to make sure the listener gets the full lineage, not just
  the hit songs."
- Send user messages to Anthropic claude-sonnet-4-6 with the full artist/philosophy
  database injected as context in the system prompt
- Stream the response token by token using SSE

### 6. The Cipher (/cipher)

- Browse tracks and their lyric breakdowns
- Filter by philosophical tradition
- Submit a new breakdown (authenticated users only)

---

## API ROUTES (FastAPI)

GET /api/artists — list all artists (with filters: era, category)
GET /api/artists/:id — single artist with influences + traditions
GET /api/lineage — all artists + all influence edges (for React Flow)
GET /api/compass — artists grouped by primary_category
GET /api/tracks/:artist_id — tracks for an artist
GET /api/breakdowns/:track_id — lyric breakdowns for a track
POST /api/breakdowns — submit a new breakdown (auth required)
POST /api/tapedeck/chat — send message, stream Claude response via SSE

---

## PROJECT STRUCTURE

/
├── frontend/ # Vite + React + TypeScript
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ ├── hooks/
│ │ └── lib/ # API client, Spotify helpers
├── backend/ # FastAPI
│ ├── app/
│ │ ├── models/ # SQLAlchemy models
│ │ ├── routers/ # One file per API route group
│ │ ├── schemas/ # Pydantic schemas
│ │ ├── seed.py # Database seeder
│ │ └── main.py
│ └── requirements.txt
├── docker-compose.yml # Local dev: FastAPI + Postgres
└── README.md

---

## ENVIRONMENT VARIABLES NEEDED

ANTHROPIC_API_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
DATABASE_URL= # Neon PostgreSQL connection string
SUPABASE_URL=
SUPABASE_ANON_KEY=

---

## BUILD ORDER

Build in this exact sequence:

1. Docker Compose + FastAPI skeleton + SQLAlchemy models + seed data
2. All API routes returning seeded data
3. React app scaffold with routing + Tailwind theme
4. Lineage Map page (React Flow) — this is the hero feature
5. Philosophical Compass page
6. Artist Profile page with Spotify embed
7. Tape Deck AI chat page with streaming
8. The Cipher lyric breakdown browser
9. Supabase auth (gate breakdown submissions)
10. Polish: transitions, mobile responsiveness, grain overlay

Start with Step 1.
