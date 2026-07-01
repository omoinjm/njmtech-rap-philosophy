# The 37th Chamber

A Rap Philosophy exploration platform that maps hip-hop artists to philosophical traditions and their generational influences.

**Tagline:** Street Knowledge. Mapped.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 on Cloudflare Workers ([OpenNext](https://opennext.js.org/cloudflare)) |
| API | Hono Worker on Cloudflare (`chamber-api`) |
| Database | Cloudflare D1 (SQLite) |
| AI Chat | GitHub Models (`openai/gpt-4o` via GitHub token) |
| Music | Spotify Web API (embedded player) |
| Auth | JWT sessions (users in D1) |

## Project Structure

```
/
├── frontend/          # Next.js app → Cloudflare Worker (chamber)
├── worker/            # Hono API → Cloudflare Worker (chamber-api)
├── migrations/d1/     # D1 SQL migrations
├── backend/           # Legacy FastAPI (local dev only, optional)
└── package.json       # Root deploy scripts
```

## Local Development

### 1. API worker

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars   # JWT_SECRET, GITHUB_TOKEN, etc.

npm run dev    # http://127.0.0.1:8787
```

Schema and seed data run automatically on first request.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env              # INTERNAL_API_URL=http://127.0.0.1:8787

npm run dev    # http://localhost:3000
```

The Next.js dev server proxies `/api/*` to the worker at `:8787`.

## Deploy to Cloudflare

Both workers share one D1 database.

**Full step-by-step commands:** see [docs/RUNBOOK.md](docs/RUNBOOK.md)

### 1. D1 setup

```bash
npx wrangler d1 create chamber
```

Copy the `database_id` into `worker/wrangler.jsonc` (replace `REPLACE_WITH_D1_DATABASE_ID`).

Apply migrations:

```bash
npm run db:migrate:remote
```

### 2. API worker secrets

```bash
cd worker
npx wrangler secret put JWT_SECRET
npx wrangler secret put GITHUB_TOKEN
# optional: GITHUB_MODEL (defaults to openai/gpt-4o)
```

Deploy:

```bash
npm run deploy:api
```

### 3. Frontend worker

Deploy (requires `chamber-api` already deployed — service binding):

```bash
npm run deploy:web
```

Or deploy both from the repo root:

```bash
npm run deploy
```

### 4. Custom domain routes

In the Cloudflare dashboard (or `wrangler.jsonc` routes), point traffic on your domain:

| Pattern | Worker |
|---|---|
| `yourdomain.com/api*` | `chamber-api` |
| `yourdomain.com/*` | `chamber` |

Same-origin `/api` calls from the browser hit the API worker directly. SSR uses the `API` service binding.

### Preview locally in the Workers runtime

```bash
cd frontend
npm run preview
```

## Environment Variables

### API worker (`worker/.dev.vars` / Wrangler secrets)

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Signs auth tokens |
| `JWT_EXPIRE_HOURS` | No | Default `168` |
| `GITHUB_TOKEN` | For Tape Deck | PAT with `models:read` |
| `GITHUB_MODEL` | No | Default `openai/gpt-4o` |
| `CORS_ORIGINS` | Production | Comma-separated browser origins, e.g. `https://yourdomain.com` |
| `ADMIN_EMAILS` | For moderation | Comma-separated emails granted admin on register/login |

### Frontend (`frontend/.env` — local dev only)

| Variable | Description |
|---|---|
| `INTERNAL_API_URL` | API worker URL (default `http://127.0.0.1:8787`) |

Production SSR uses the Cloudflare `API` service binding — no frontend secrets needed for the database.

## Pages

| Route | Feature |
|---|---|
| `/` | Landing — hero, category hub cards, CTA |
| `/compass` | Four-quadrant philosophical compass |
| `/lineage` | Interactive React Flow lineage graph |
| `/artist/:id` | Artist profile, Spotify, breakdowns |
| `/tapedeck` | AI chat with streaming SSE |
| `/cipher` | Browse/submit lyric breakdowns |
| `/admin` | Moderation queue (admin only) |

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/artists` | List artists (`?era=`, `?category=`) |
| GET | `/api/artists/:id` | Artist detail + influences |
| GET | `/api/lineage` | Nodes + edges for React Flow |
| GET | `/api/compass` | Artists grouped by category |
| GET | `/api/tracks/:artist_id` | Tracks for artist |
| GET | `/api/breakdowns` | Curated breakdowns only (`?tradition_id=`) |
| GET | `/api/breakdowns/pending` | Pending submissions (admin) |
| GET | `/api/breakdowns/track/:track_id` | Curated breakdowns for track |
| POST | `/api/breakdowns/:id/approve` | Approve submission (admin) |
| DELETE | `/api/breakdowns/:id` | Reject pending submission (admin) |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user (Bearer token) |
| POST | `/api/breakdowns` | Submit breakdown (auth required) |
| POST | `/api/tapedeck/chat` | Stream GitHub Models response (SSE) |
| GET | `/api/traditions` | Philosophical traditions |

## License

Private — NJM Tech
