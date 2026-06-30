# The 37th Chamber

A Rap Philosophy exploration platform that maps hip-hop artists to philosophical traditions and their generational influences.

**Tagline:** Street Knowledge. Mapped.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + Turbopack + SSR + Tailwind CSS |
| Graph | React Flow |
| Backend | FastAPI (Python) |
| Database | PostgreSQL via SQLAlchemy (async) |
| AI Chat | Anthropic Claude (claude-sonnet-4-6) |
| Music | Spotify Web API (embedded player) |
| Auth | Cloudflare D1 (users) + JWT sessions |

## Quick Start

### 1. Database

```bash
docker compose up db -d
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add ANTHROPIC_API_KEY, etc.

DATABASE_URL=postgresql+asyncpg://chamber:chamber@localhost:5432/chamber \
  uvicorn app.main:app --reload --port 8002
```

API docs: `http://localhost:8002/docs`

### 3. Frontend (Next.js + Turbopack)

```bash
cd frontend
npm install
cp .env.example .env

INTERNAL_API_URL=http://127.0.0.1:8002 npm run dev
```

App: `http://localhost:3000` (Turbopack dev server)

Production build:

```bash
INTERNAL_API_URL=http://127.0.0.1:8002 npm run build && npm start
```

### Full Docker Stack

```bash
docker compose up --build
```

Backend on `:8000`, frontend on `:3000`, Postgres on `:5432`.

```bash
docker compose up --build
```

Open **http://localhost:3000**

## Pages

| Route | Feature |
|---|---|
| `/` | Landing — hero, category hub cards, CTA |
| `/compass` | Four-quadrant philosophical compass |
| `/lineage` | Interactive React Flow lineage graph |
| `/artist/:id` | Artist profile, Spotify, breakdowns |
| `/tapedeck` | AI chat with streaming SSE |
| `/cipher` | Browse/submit lyric breakdowns |

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/artists` | List artists (`?era=`, `?category=`) |
| GET | `/api/artists/:id` | Artist detail + influences |
| GET | `/api/lineage` | Nodes + edges for React Flow |
| GET | `/api/compass` | Artists grouped by category |
| GET | `/api/tracks/:artist_id` | Tracks for artist |
| GET | `/api/breakdowns` | All breakdowns (`?tradition_id=`) |
| GET | `/api/breakdowns/track/:track_id` | Breakdowns for track |
| POST | `/api/auth/register` | Create account (D1) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user (Bearer token) |
| POST | `/api/breakdowns` | Submit breakdown (auth required) |
| POST | `/api/tapedeck/chat` | Stream Claude response (SSE) |
| GET | `/api/traditions` | Philosophical traditions |

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+asyncpg://chamber:chamber@localhost:5432/chamber
ANTHROPIC_API_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRE_HOURS=168

# Cloudflare D1 — leave empty for local SQLite at D1_LOCAL_PATH
D1_DATABASE_ID=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
D1_LOCAL_PATH=.data/auth.db
```

### Frontend (`frontend/.env`)

```env
INTERNAL_API_URL=http://127.0.0.1:8002
```

### Cloudflare D1 (production auth)

1. Create a D1 database: `npx wrangler d1 create chamber-auth`
2. Update `database_id` in `wrangler.toml`
3. Apply migrations: `npx wrangler d1 migrations apply chamber-auth --remote`
4. Set `D1_DATABASE_ID`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN` on the backend

Local dev uses SQLite at `.data/auth.db` (same schema as D1) when Cloudflare credentials are unset.

## Project Structure

```
/
├── frontend/          # Next.js 15 + Turbopack + SSR
│   ├── app/           # App Router pages (SSR data fetching)
│   ├── components/
│   ├── lib/           # api-server (SSR), api-client (browser)
│   └── providers/     # D1-backed JWT auth client
├── backend/
│   └── app/
│       ├── models/
│       ├── routers/
│       ├── schemas/
│       ├── seed.py
│       └── main.py
├── docker-compose.yml
└── README.md
```

## Build Progress

- [x] Step 1: Docker Compose + FastAPI + SQLAlchemy models + seed data
- [x] Step 2: API routes
- [x] Step 3: React app scaffold with routing + Tailwind theme
- [x] Step 4: Lineage Map (React Flow)
- [x] Step 5: Philosophical Compass
- [x] Step 6: Artist Profile + Spotify embed
- [x] Step 7: Tape Deck AI chat with streaming
- [x] Step 8: The Cipher lyric breakdown browser
- [x] Step 9: D1 auth (breakdown submissions)
- [x] Step 10: Polish (grain overlay, mobile nav, sharp edges, transitions)

## License

Private — NJM Tech
