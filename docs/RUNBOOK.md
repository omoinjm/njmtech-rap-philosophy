# Runbook — commands to run on your laptop

Copy/paste these from the repo root unless a step says otherwise. Replace placeholders before running.

| Placeholder | Meaning |
|---|---|
| `YOUR_DOMAIN` | Production hostname, e.g. `37thchamber.com` |
| `YOUR_GITHUB_TOKEN` | GitHub PAT with `models:read` (for Tape Deck AI) |
| `YOUR_JWT_SECRET` | Long random string for signing auth tokens |

---

## 0. Get the code

```bash
git clone https://github.com/omoinjm/njmtech-rap-philosophy.git
cd njmtech-rap-philosophy
git checkout cursor/development-7b6e
```

---

## 1. One-time: Cloudflare login

```bash
npx wrangler login
```

---

## 2. One-time: D1 database (skip if `worker/wrangler.jsonc` already has a real `database_id`)

Create the database:

```bash
npx wrangler d1 create chamber
```

Copy the `database_id` from the output into **both**:

- `worker/wrangler.jsonc` → `d1_databases[0].database_id`
- `wrangler.toml` → `[[d1_databases]].database_id`

---

## 3. Local development

### API worker

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars
```

Edit `worker/.dev.vars` — set at least `JWT_SECRET`. Optionally set `GITHUB_TOKEN` for Tape Deck chat.

```bash
npm run dev
```

API runs at http://127.0.0.1:8787 (leave this terminal open).

### Frontend (new terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at http://localhost:3000

### Apply migrations locally (optional — also runs automatically on first API request)

From repo root:

```bash
npm run db:migrate:local
```

---

## 4. Production deploy

Run from repo root after merging/pulling the latest branch.

### 4a. Apply D1 migrations to production

```bash
npm run db:migrate:remote
```

This applies all migrations including `0003_fix_seed_media.sql` (Spotify IDs + artist images) and `0005_add_seed_breakdowns.sql` (curated lyric analyses for all artists).

### 4b. Set API worker secrets

```bash
cd worker
npx wrangler secret put JWT_SECRET
# paste YOUR_JWT_SECRET when prompted

npx wrangler secret put GITHUB_TOKEN
# paste YOUR_GITHUB_TOKEN when prompted (required for /tapedeck)

npx wrangler secret put CORS_ORIGINS
# paste: https://YOUR_DOMAIN,https://www.YOUR_DOMAIN
# (add workers.dev URL too if testing before custom domain — see section 5)

npx wrangler secret put ADMIN_EMAILS
# paste: your@email.com
# comma-separated — these accounts get admin + moderation queue access
```

Optional:

```bash
npx wrangler secret put GITHUB_MODEL
# default is openai/gpt-4o if omitted

npx wrangler secret put JWT_EXPIRE_HOURS
# default is 168 (hours) if omitted
```

### 4c. Deploy API worker

```bash
cd worker
npm install
npm run deploy
```

Or from repo root:

```bash
npm run deploy:api
```

Note the `*.workers.dev` URL printed for `chamber-api` (e.g. `https://chamber-api.<account>.workers.dev`).

### 4d. Deploy frontend worker

```bash
cd frontend
npm install
npm run deploy
```

Or from repo root:

```bash
npm run deploy:web
```

Note the `*.workers.dev` URL for `chamber`.

### 4e. Deploy both in one step (after secrets are set)

From repo root:

```bash
npm install
npm run deploy
```

---

## 5. Custom domain routes (Cloudflare dashboard)

In **Cloudflare Dashboard → Workers & Pages → your domain → Routes**, add:

| Route pattern | Worker |
|---|---|
| `YOUR_DOMAIN/api*` | `chamber-api` |
| `www.YOUR_DOMAIN/api*` | `chamber-api` |
| `YOUR_DOMAIN/*` | `chamber` |
| `www.YOUR_DOMAIN/*` | `chamber` |

Order matters: `/api*` routes must be registered for `chamber-api` before the catch-all `/*` on `chamber`.

After routes are live, update CORS if needed:

```bash
cd worker
npx wrangler secret put CORS_ORIGINS
# https://YOUR_DOMAIN,https://www.YOUR_DOMAIN
```

---

## 6. Post-deploy verification

Replace URLs with yours.

```bash
# API health (use workers.dev URL, or skip — custom domain routes /api* only)
curl -s https://chamber-api.<account>.workers.dev/health

# Artists (should include image_url for all 9)
curl -s https://YOUR_DOMAIN/api/artists | python3 -m json.tool

# Tracks (spotify_track_id should not contain placeholder patterns)
curl -s https://YOUR_DOMAIN/api/tracks/<ARTIST_ID> | python3 -m json.tool
```

Open in browser:

- `https://YOUR_DOMAIN/` — landing page
- `https://YOUR_DOMAIN/lineage` — graph loads
- `https://YOUR_DOMAIN/artist/<id>` — photo + Spotify embed plays
- `https://YOUR_DOMAIN/tapedeck` — chat streams (needs `GITHUB_TOKEN`)
- `https://YOUR_DOMAIN/cipher` — login + submit breakdown

---

## 7. Updating after code changes

```bash
git pull origin cursor/development-7b6e
npm run db:migrate:remote
npm run deploy
```

If only the API changed:

```bash
npm run deploy:api
```

If only the frontend changed:

```bash
npm run deploy:web
```

---

## 8. Optional: preview frontend in Workers runtime locally

```bash
cd frontend
npm install
npm run preview
```

Requires the API worker running at http://127.0.0.1:8787.

---

## 9. Optional: Docker frontend only

```bash
docker compose up frontend
```

Run `npm run dev:api` separately in another terminal for the API.

---

## Environment reference

| Variable | Where | Required |
|---|---|---|
| `JWT_SECRET` | `worker` secret / `.dev.vars` | Yes |
| `GITHUB_TOKEN` | `worker` secret / `.dev.vars` | For Tape Deck |
| `CORS_ORIGINS` | `worker` secret / `.dev.vars` | Production (comma-separated origins) |
| `ADMIN_EMAILS` | `worker` secret / `.dev.vars` | Moderator emails (comma-separated) |
| `GITHUB_MODEL` | `worker` secret / `.dev.vars` | No (default `openai/gpt-4o`) |
| `JWT_EXPIRE_HOURS` | `worker` secret / `.dev.vars` | No (default `168`) |
| `INTERNAL_API_URL` | `frontend/.env` | Local dev only |

Production SSR uses the Cloudflare `API` service binding — the frontend worker does not need database secrets.
