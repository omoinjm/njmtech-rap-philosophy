export type Era = 'old_school' | 'bridge' | 'new_school'

export type PhilosophicalCategory =
  | 'epistemology_mysticism'
  | 'street_stoicism'
  | 'social_ethics'
  | 'revolutionary_geopolitics'

export interface Env {
  DB: D1Database
  JWT_SECRET: string
  JWT_EXPIRE_HOURS?: string
  GITHUB_TOKEN?: string
  GITHUB_MODEL?: string
  /** Comma-separated browser origins allowed for cross-origin API calls */
  CORS_ORIGINS?: string
  /** Comma-separated emails granted admin on register/login */
  ADMIN_EMAILS?: string
  /** Google OAuth client ID for Sign in with Google */
  GOOGLE_CLIENT_ID?: string
  /** Per-IP API rate limit (200/min) — optional in local dev */
  RATE_LIMIT_GLOBAL?: RateLimit
  /** Per-IP auth rate limit (10/10s) — optional in local dev */
  RATE_LIMIT_AUTH?: RateLimit
  /** Per-IP Tape Deck rate limit (20/min) — optional in local dev */
  RATE_LIMIT_CHAT?: RateLimit
  /** Per-IP write rate limit (30/min) — optional in local dev */
  RATE_LIMIT_WRITE?: RateLimit
}

export const CATEGORY_META: Record<
  PhilosophicalCategory,
  { label: string; description: string }
> = {
  epistemology_mysticism: {
    label: 'Epistemology & Mysticism',
    description:
      'Knowledge of self, Supreme Mathematics, spiritual cipher — the path inward.',
  },
  street_stoicism: {
    label: 'Street Stoicism',
    description:
      'Endurance under pressure, criminal discipline, measured narrative over luxury loops.',
  },
  social_ethics: {
    label: 'Social Ethics',
    description: 'Community consciousness, Afrocentric humanism, the cipher as democratic space.',
  },
  revolutionary_geopolitics: {
    label: 'Revolutionary Geopolitics',
    description:
      'Class analysis, guerrilla rhetoric, uncompromising critique of power structures.',
  },
}
