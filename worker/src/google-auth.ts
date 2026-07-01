export interface GoogleProfile {
  sub: string
  email: string
}

export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string,
): Promise<GoogleProfile> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  )
  if (!res.ok) {
    throw new Error('Invalid Google token')
  }

  const data = (await res.json()) as {
    aud?: string
    email?: string
    email_verified?: string
    sub?: string
  }

  if (data.aud !== clientId || !data.sub || !data.email) {
    throw new Error('Invalid Google token')
  }
  if (data.email_verified !== 'true') {
    throw new Error('Google email not verified')
  }

  return { sub: data.sub, email: data.email.toLowerCase() }
}
