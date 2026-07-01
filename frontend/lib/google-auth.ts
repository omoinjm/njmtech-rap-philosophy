export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

export const googleAuthEnabled = Boolean(GOOGLE_CLIENT_ID)
