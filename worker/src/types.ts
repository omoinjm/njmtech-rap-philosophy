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
