const USERS_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`

const APP_SQL = `
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  era TEXT NOT NULL,
  primary_category TEXT NOT NULL,
  secondary_category TEXT,
  bio TEXT,
  spotify_artist_id TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS philosophical_traditions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS artist_traditions (
  artist_id TEXT NOT NULL,
  tradition_id TEXT NOT NULL,
  PRIMARY KEY (artist_id, tradition_id),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (tradition_id) REFERENCES philosophical_traditions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS influences (
  id TEXT PRIMARY KEY,
  source_artist_id TEXT NOT NULL,
  target_artist_id TEXT NOT NULL,
  connection_label TEXT,
  strength INTEGER NOT NULL DEFAULT 5,
  FOREIGN KEY (source_artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (target_artist_id) REFERENCES artists(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  spotify_track_id TEXT,
  album TEXT,
  year INTEGER,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS lyric_breakdowns (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL,
  lyric_excerpt TEXT NOT NULL,
  philosophical_analysis TEXT NOT NULL,
  tradition_id TEXT,
  submitted_by TEXT,
  is_curated INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (tradition_id) REFERENCES philosophical_traditions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_artists_era ON artists(era);
CREATE INDEX IF NOT EXISTS idx_artists_primary_category ON artists(primary_category);
CREATE INDEX IF NOT EXISTS idx_influences_source ON influences(source_artist_id);
CREATE INDEX IF NOT EXISTS idx_influences_target ON influences(target_artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_breakdowns_track ON lyric_breakdowns(track_id);
`

function splitSql(sql: string): string[] {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function ensureSchema(db: D1Database): Promise<void> {
  for (const statement of [...splitSql(USERS_SQL), ...splitSql(APP_SQL)]) {
    await db.prepare(statement).run()
  }
}
