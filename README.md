# The 37th Chamber

A Rap Philosophy exploration platform that maps hip-hop artists to philosophical traditions and their generational influences.

**Tagline:** Street Knowledge. Mapped.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS |
| Graph | React Flow |
| Backend | FastAPI (Python) |
| Database | PostgreSQL via SQLAlchemy (async) |
| AI Chat | Anthropic Claude (claude-sonnet-4-6) |
| Music | Spotify Web API |
| Auth | Supabase Auth |

## Quick Start (Local Dev)

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for frontend, later steps)

### Backend + Database

```bash
# Copy env template and fill in API keys as needed
cp backend/.env.example backend/.env

# Start Postgres + FastAPI
docker compose up --build
```

The API will be available at `http://localhost:8000`.

- Health check: `GET /health`
- API docs: `http://localhost:8000/docs`

On first startup, the database is automatically migrated and seeded with 9 artists, 6 philosophical traditions, influence edges, tracks, and curated lyric breakdowns.

### Environment Variables

```env
ANTHROPIC_API_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
DATABASE_URL=postgresql+asyncpg://chamber:chamber@localhost:5432/chamber
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Project Structure

```
/
├── frontend/          # Vite + React + TypeScript (Step 3+)
├── backend/
│   ├── app/
│   │   ├── models/    # SQLAlchemy models
│   │   ├── routers/   # API route groups
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── seed.py    # Database seeder
│   │   └── main.py
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## Database Schema

- **artists** — MCs mapped to philosophical categories and eras
- **philosophical_traditions** — Five-Percent Nation, Stoicism, Marxist Theory, etc.
- **artist_traditions** — join table linking artists to traditions
- **influences** — self-referencing lineage edges (source → target)
- **tracks** — key tracks with Spotify IDs
- **lyric_breakdowns** — curated philosophical analyses of lyrics
- **users** — Supabase auth sync (Step 9)

## Build Progress

- [x] Step 1: Docker Compose + FastAPI + SQLAlchemy models + seed data
- [ ] Step 2: API routes
- [ ] Step 3: React app scaffold
- [ ] Step 4: Lineage Map (React Flow)
- [ ] Step 5: Philosophical Compass
- [ ] Step 6: Artist Profile + Spotify embed
- [ ] Step 7: Tape Deck AI chat
- [ ] Step 8: The Cipher lyric breakdowns
- [ ] Step 9: Supabase auth
- [ ] Step 10: Polish

## License

Private — NJM Tech
