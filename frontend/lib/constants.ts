import type { PhilosophicalCategory } from './types'

export const CATEGORY_COLORS: Record<PhilosophicalCategory, string> = {
  epistemology_mysticism: '#C9A84C',
  street_stoicism: '#A8A8A8',
  social_ethics: '#2D6A4F',
  revolutionary_geopolitics: '#8B0000',
}

export const CATEGORY_LABELS: Record<PhilosophicalCategory, string> = {
  epistemology_mysticism: 'Epistemology & Mysticism',
  street_stoicism: 'Street Stoicism',
  social_ethics: 'Social Ethics',
  revolutionary_geopolitics: 'Revolutionary Geopolitics',
}

export const CATEGORY_DESCRIPTIONS: Record<PhilosophicalCategory, string> = {
  epistemology_mysticism:
    'Knowledge of self, Supreme Mathematics, spiritual cipher — the path inward.',
  street_stoicism:
    'Endurance under pressure, criminal discipline, measured narrative over luxury loops.',
  social_ethics:
    'Community consciousness, Afrocentric humanism, the cipher as democratic space.',
  revolutionary_geopolitics:
    'Class analysis, guerrilla rhetoric, uncompromising critique of power structures.',
}

export const ERA_LABELS: Record<string, string> = {
  old_school: 'Old School',
  bridge: 'Bridge',
  new_school: 'New School',
}

export const CATEGORIES: PhilosophicalCategory[] = [
  'epistemology_mysticism',
  'street_stoicism',
  'social_ethics',
  'revolutionary_geopolitics',
]
