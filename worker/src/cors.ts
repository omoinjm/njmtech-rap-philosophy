const DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

/** Comma-separated list in CORS_ORIGINS, e.g. https://example.com,https://www.example.com */
export function resolveCorsOrigins(value?: string): string[] {
  if (!value?.trim()) return DEV_ORIGINS

  const configured = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return configured.length ? configured : DEV_ORIGINS
}
