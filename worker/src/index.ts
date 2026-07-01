import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'

import {
  bearerToken,
  createAccessToken,
  getAuthUser,
  hashPassword,
  isConfiguredAdmin,
  promoteAdminIfConfigured,
  userPayload,
  verifyPassword,
  verifyToken,
} from './auth'
import { ensureSchema } from './schema'
import { ensureSeed } from './seed'
import { resolveCorsOrigins } from './cors'
import { verifyGoogleIdToken } from './google-auth'
import { CATEGORY_META, type Env, type PhilosophicalCategory } from './types'

const GITHUB_MODELS_BASE_URL = 'https://models.github.ai/inference'

const SYSTEM_PROMPT = `You are an encyclopaedic hip-hop philosopher and record store clerk who speaks with the authority of someone who has been studying rap music and political philosophy since the early 90s. You connect rap lyrics to philosophical traditions, political theory, and spiritual texts. You are opinionated, passionate, and deeply knowledgeable. You recommend music like an older uncle who wants to make sure the listener gets the full lineage, not just the hit songs.

Use the following database as your knowledge base when answering questions:

{context}`

const app = new Hono<{ Bindings: Env }>()

app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = resolveCorsOrigins(c.env.CORS_ORIGINS)
      if (!origin) return allowed[0]
      return allowed.includes(origin) ? origin : null
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

app.use('*', async (c, next) => {
  await ensureSchema(c.env.DB)
  await ensureSeed(c.env.DB)
  await next()
})

app.get('/', (c) =>
  c.json({ message: 'The 37th Chamber API', status: 'online' }),
)

app.get('/health', (c) => c.json({ status: 'healthy' }))

app.get('/api/artists', async (c) => {
  const era = c.req.query('era')
  const category = c.req.query('category')
  let sql = 'SELECT * FROM artists'
  const conditions: string[] = []
  const params: string[] = []
  if (era) {
    conditions.push('era = ?')
    params.push(era)
  }
  if (category) {
    conditions.push('primary_category = ?')
    params.push(category)
  }
  if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
  sql += ' ORDER BY name'
  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json(results)
})

app.get('/api/artists/:id', async (c) => {
  const id = c.req.param('id')
  const artist = await c.env.DB.prepare('SELECT * FROM artists WHERE id = ?')
    .bind(id)
    .first()
  if (!artist) return c.json({ detail: 'Artist not found' }, 404)

  const { results: traditions } = await c.env.DB.prepare(
    `SELECT pt.* FROM philosophical_traditions pt
     JOIN artist_traditions at ON at.tradition_id = pt.id
     WHERE at.artist_id = ?`,
  )
    .bind(id)
    .all()

  const { results: influenceRows } = await c.env.DB.prepare(
    `SELECT i.*, a.name AS target_artist_name
     FROM influences i
     JOIN artists a ON a.id = i.target_artist_id
     WHERE i.source_artist_id = ?`,
  )
    .bind(id)
    .all()

  const influences = influenceRows.map((row) => ({
    id: row.id,
    target_artist_id: row.target_artist_id,
    target_artist_name: row.target_artist_name,
    connection_label: row.connection_label,
    strength: row.strength,
  }))

  return c.json({ ...artist, traditions, influences })
})

app.get('/api/lineage', async (c) => {
  const { results: artists } = await c.env.DB.prepare(
    'SELECT id, name, era, primary_category, image_url FROM artists ORDER BY name',
  ).all()
  const { results: influences } = await c.env.DB.prepare('SELECT * FROM influences').all()

  return c.json({
    nodes: artists.map((a) => ({
      id: a.id,
      name: a.name,
      era: a.era,
      primary_category: a.primary_category,
      image_url: a.image_url,
    })),
    edges: influences.map((e) => ({
      id: e.id,
      source: e.source_artist_id,
      target: e.target_artist_id,
      label: e.connection_label,
      strength: e.strength,
    })),
  })
})

app.get('/api/compass', async (c) => {
  const { results: artists } = await c.env.DB.prepare(
    'SELECT id, name, era, primary_category, image_url FROM artists ORDER BY name',
  ).all()

  const categories = Object.keys(CATEGORY_META) as PhilosophicalCategory[]
  return c.json(
    categories.map((category) => ({
      category,
      label: CATEGORY_META[category].label,
      description: CATEGORY_META[category].description,
      artists: artists
        .filter((a) => a.primary_category === category)
        .map((a) => ({
          id: a.id,
          name: a.name,
          era: a.era,
          primary_category: a.primary_category,
          image_url: a.image_url,
        })),
    })),
  )
})

app.get('/api/tracks/:artistId', async (c) => {
  const artistId = c.req.param('artistId')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM tracks WHERE artist_id = ? ORDER BY year',
  )
    .bind(artistId)
    .all()
  return c.json(results)
})

app.get('/api/traditions', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM philosophical_traditions ORDER BY name',
  ).all()
  return c.json(results)
})

async function fetchBreakdowns(
  db: D1Database,
  options: {
    curatedOnly?: boolean
    pendingOnly?: boolean
    traditionId?: string
    trackId?: string
    breakdownId?: string
  } = {},
) {
  const conditions: string[] = []
  const params: string[] = []

  if (options.curatedOnly) conditions.push('lb.is_curated = 1')
  if (options.pendingOnly) conditions.push('lb.is_curated = 0')
  if (options.traditionId) {
    conditions.push('lb.tradition_id = ?')
    params.push(options.traditionId)
  }
  if (options.trackId) {
    conditions.push('lb.track_id = ?')
    params.push(options.trackId)
  }
  if (options.breakdownId) {
    conditions.push('lb.id = ?')
    params.push(options.breakdownId)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { results } = await db
    .prepare(
      `SELECT lb.*, t.title AS track_title, a.name AS artist_name, pt.name AS tradition_name,
              u.email AS submitted_by_email
       FROM lyric_breakdowns lb
       JOIN tracks t ON t.id = lb.track_id
       JOIN artists a ON a.id = t.artist_id
       LEFT JOIN philosophical_traditions pt ON pt.id = lb.tradition_id
       LEFT JOIN users u ON u.id = lb.submitted_by
       ${where}
       ORDER BY lb.is_curated DESC, lb.rowid DESC`,
    )
    .bind(...params)
    .all()

  return results.map((row) => ({
    id: row.id,
    track_id: row.track_id,
    track_title: row.track_title,
    artist_name: row.artist_name,
    lyric_excerpt: row.lyric_excerpt,
    philosophical_analysis: row.philosophical_analysis,
    tradition_id: row.tradition_id,
    tradition_name: row.tradition_name,
    is_curated: Boolean(row.is_curated),
    submitted_by: row.submitted_by ?? null,
    submitted_by_email: row.submitted_by_email ?? null,
  }))
}

async function requireAdmin(c: Context<{ Bindings: Env }>) {
  const auth = await verifyToken(c.env, bearerToken(c.req.header('Authorization')) ?? '')
  if (!auth) return { error: c.json({ detail: 'Authentication required' }, 401) as Response }

  const user = await getAuthUser(c.env.DB, auth.userId)
  if (!user) return { error: c.json({ detail: 'User not found' }, 401) as Response }
  if (!user.is_admin) return { error: c.json({ detail: 'Admin access required' }, 403) as Response }

  return { user }
}

app.get('/api/breakdowns', async (c) => {
  const traditionId = c.req.query('tradition_id')
  return c.json(
    await fetchBreakdowns(c.env.DB, {
      curatedOnly: true,
      traditionId: traditionId ?? undefined,
    }),
  )
})

app.get('/api/breakdowns/pending', async (c) => {
  const admin = await requireAdmin(c)
  if ('error' in admin) return admin.error
  return c.json(await fetchBreakdowns(c.env.DB, { pendingOnly: true }))
})

app.get('/api/breakdowns/track/:trackId', async (c) => {
  const trackId = c.req.param('trackId')
  return c.json(await fetchBreakdowns(c.env.DB, { curatedOnly: true, trackId }))
})

app.post('/api/breakdowns', async (c) => {
  const auth = await verifyToken(c.env, bearerToken(c.req.header('Authorization')) ?? '')
  if (!auth) return c.json({ detail: 'Authentication required' }, 401)

  const body = await c.req.json<{
    track_id: string
    lyric_excerpt: string
    philosophical_analysis: string
    tradition_id?: string | null
  }>()

  const track = await c.env.DB.prepare('SELECT id FROM tracks WHERE id = ?')
    .bind(body.track_id)
    .first()
  if (!track) return c.json({ detail: 'Track not found' }, 404)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO lyric_breakdowns
     (id, track_id, lyric_excerpt, philosophical_analysis, tradition_id, submitted_by, is_curated)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
  )
    .bind(
      id,
      body.track_id,
      body.lyric_excerpt,
      body.philosophical_analysis,
      body.tradition_id ?? null,
      auth.userId,
    )
    .run()

  const rows = await fetchBreakdowns(c.env.DB, { breakdownId: id })
  return c.json(rows[0], 201)
})

app.post('/api/breakdowns/:id/approve', async (c) => {
  const admin = await requireAdmin(c)
  if ('error' in admin) return admin.error

  const id = c.req.param('id')
  const existing = await c.env.DB.prepare('SELECT id, is_curated FROM lyric_breakdowns WHERE id = ?')
    .bind(id)
    .first<{ id: string; is_curated: number }>()
  if (!existing) return c.json({ detail: 'Breakdown not found' }, 404)
  if (existing.is_curated) return c.json({ detail: 'Breakdown is already curated' }, 409)

  await c.env.DB.prepare('UPDATE lyric_breakdowns SET is_curated = 1 WHERE id = ?').bind(id).run()

  const rows = await fetchBreakdowns(c.env.DB, { breakdownId: id })
  return c.json(rows[0])
})

app.delete('/api/breakdowns/:id', async (c) => {
  const admin = await requireAdmin(c)
  if ('error' in admin) return admin.error

  const id = c.req.param('id')
  const existing = await c.env.DB.prepare('SELECT id, is_curated FROM lyric_breakdowns WHERE id = ?')
    .bind(id)
    .first<{ id: string; is_curated: number }>()
  if (!existing) return c.json({ detail: 'Breakdown not found' }, 404)
  if (existing.is_curated) return c.json({ detail: 'Curated breakdowns cannot be deleted' }, 409)

  await c.env.DB.prepare('DELETE FROM lyric_breakdowns WHERE id = ?').bind(id).run()
  return c.body(null, 204)
})

app.post('/api/auth/google', async (c) => {
  if (!c.env.GOOGLE_CLIENT_ID) {
    return c.json({ detail: 'Google Sign-In not configured (set GOOGLE_CLIENT_ID)' }, 503)
  }

  const body = await c.req.json<{ credential: string }>()
  if (!body.credential) {
    return c.json({ detail: 'Google credential required' }, 400)
  }

  let profile
  try {
    profile = await verifyGoogleIdToken(body.credential, c.env.GOOGLE_CLIENT_ID)
  } catch {
    return c.json({ detail: 'Invalid Google credential' }, 401)
  }

  let user = await c.env.DB.prepare(
    'SELECT id, email, is_admin FROM users WHERE google_id = ?',
  )
    .bind(profile.sub)
    .first<{ id: string; email: string; is_admin: number }>()

  if (!user) {
    user = await c.env.DB.prepare('SELECT id, email, is_admin FROM users WHERE email = ?')
      .bind(profile.email)
      .first<{ id: string; email: string; is_admin: number }>()

    if (user) {
      await c.env.DB.prepare('UPDATE users SET google_id = ? WHERE id = ?')
        .bind(profile.sub, user.id)
        .run()
    } else {
      const userId = crypto.randomUUID()
      const isAdmin = isConfiguredAdmin(profile.email, c.env) ? 1 : 0
      await c.env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, google_id, is_admin)
         VALUES (?, ?, ?, ?, ?)`,
      )
        .bind(userId, profile.email, hashPassword(crypto.randomUUID()), profile.sub, isAdmin)
        .run()
      user = { id: userId, email: profile.email, is_admin: isAdmin }
    }
  }

  await promoteAdminIfConfigured(c.env.DB, c.env, user.id, profile.email)
  const refreshed = await getAuthUser(c.env.DB, user.id)
  if (!refreshed) return c.json({ detail: 'User not found' }, 401)

  const token = await createAccessToken(c.env, refreshed.id, refreshed.email)
  return c.json({ access_token: token, user: userPayload(refreshed) })
})

app.post('/api/auth/register', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>()
  const email = body.email.toLowerCase()
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first()
  if (existing) return c.json({ detail: 'Email already registered' }, 409)

  const userId = crypto.randomUUID()
  const passwordHash = hashPassword(body.password)
  const isAdmin = isConfiguredAdmin(email, c.env) ? 1 : 0
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
  )
    .bind(userId, email, passwordHash, isAdmin)
    .run()

  const token = await createAccessToken(c.env, userId, email)
  return c.json(
    { access_token: token, user: userPayload({ id: userId, email, is_admin: isAdmin }) },
    201,
  )
})

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>()
  const email = body.email.toLowerCase()
  const user = await c.env.DB.prepare(
    'SELECT id, email, password_hash FROM users WHERE email = ?',
  )
    .bind(email)
    .first<{ id: string; email: string; password_hash: string }>()
  if (!user || !verifyPassword(body.password, user.password_hash)) {
    return c.json({ detail: 'Invalid email or password' }, 401)
  }

  await promoteAdminIfConfigured(c.env.DB, c.env, user.id, email)
  const refreshed = await getAuthUser(c.env.DB, user.id)
  if (!refreshed) return c.json({ detail: 'User not found' }, 401)

  const token = await createAccessToken(c.env, refreshed.id, refreshed.email)
  return c.json({ access_token: token, user: userPayload(refreshed) })
})

app.get('/api/auth/me', async (c) => {
  const auth = await verifyToken(c.env, bearerToken(c.req.header('Authorization')) ?? '')
  if (!auth) return c.json({ detail: 'Authentication required' }, 401)

  const user = await getAuthUser(c.env.DB, auth.userId)
  if (!user) return c.json({ detail: 'User not found' }, 401)
  return c.json(userPayload(user))
})

async function buildChatContext(db: D1Database): Promise<string> {
  const { results: artists } = await db.prepare('SELECT * FROM artists ORDER BY name').all()
  const { results: traditions } = await db
    .prepare('SELECT * FROM philosophical_traditions ORDER BY name')
    .all()

  const lines = ['## Artists']
  for (const a of artists) {
    const { results: tradRows } = await db
      .prepare(
        `SELECT pt.name FROM philosophical_traditions pt
         JOIN artist_traditions at ON at.tradition_id = pt.id
         WHERE at.artist_id = ?`,
      )
      .bind(a.id)
      .all()
    const { results: infRows } = await db
      .prepare(
        `SELECT a.name FROM influences i
         JOIN artists a ON a.id = i.target_artist_id
         WHERE i.source_artist_id = ?`,
      )
      .bind(a.id)
      .all()

    const trads = tradRows.map((t) => t.name).join(', ') || 'none'
    const influences = infRows.map((i) => i.name).join(', ') || 'none listed'
    lines.push(
      `- ${a.name} (${a.era}): primary=${a.primary_category}, secondary=${a.secondary_category ?? 'none'}, traditions=[${trads}], influenced by=[${influences}]. ${a.bio ?? ''}`,
    )
  }

  lines.push('\n## Philosophical Traditions')
  for (const t of traditions) {
    lines.push(`- ${t.name} (${t.category}): ${t.description ?? ''}`)
  }
  return lines.join('\n')
}

app.post('/api/tapedeck/chat', async (c) => {
  if (!c.env.GITHUB_TOKEN) {
    return c.json(
      { detail: 'GitHub token not configured (set GITHUB_TOKEN with models:read scope)' },
      503,
    )
  }

  const body = await c.req.json<{
    message: string
    history: Array<{ role: string; content: string }>
  }>()

  const context = await buildChatContext(c.env.DB)
  const system = SYSTEM_PROMPT.replace('{context}', context)
  const messages = [
    { role: 'system', content: system },
    ...body.history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: body.message },
  ]

  const model = c.env.GITHUB_MODEL ?? 'openai/gpt-4o'
  const upstream = await fetch(`${GITHUB_MODELS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, max_tokens: 2048, messages, stream: true }),
  })

  if (!upstream.ok || !upstream.body) {
    const err = await upstream.text()
    return c.json({ detail: err || 'GitHub Models request failed' }, 502)
  }

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  void (async () => {
    const reader = upstream.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>
            }
            const text = parsed.choices?.[0]?.delta?.content
            if (text) {
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
              )
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
      await writer.write(encoder.encode('data: [DONE]\n\n'))
    } catch (exc) {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ error: String(exc) })}\n\n`),
      )
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

export default app
