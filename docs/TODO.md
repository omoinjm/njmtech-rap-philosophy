# TODO — post-launch setup

Items below are **not required** for the initial deploy. Email/password auth works without them.

---

## Google Sign-In

Code is implemented (`POST /api/auth/google`, Cipher UI). The button stays hidden until env vars are set.

### 1. Create a Google OAuth client

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. **Authorized JavaScript origins:**
   - `https://YOUR_DOMAIN`
   - `https://www.YOUR_DOMAIN`
   - `http://localhost:3000` (local dev)
4. **Authorized redirect URIs:** not required for the One Tap / credential flow used here.
5. Copy the **Client ID** (ends in `.apps.googleusercontent.com`).

### 2. Worker secret (production)

```bash
cd worker
npx wrangler secret put GOOGLE_CLIENT_ID
# paste your client ID when prompted
```

### 3. Frontend env (local dev)

In `frontend/.env`:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4. Frontend env (production)

Set the same client ID on the **frontend** Cloudflare Worker (`chamber`):

```bash
cd frontend
npx wrangler secret put NEXT_PUBLIC_GOOGLE_CLIENT_ID
# paste the same client ID
```

Or add it to the frontend worker vars in the Cloudflare dashboard (Workers & Pages → `chamber` → Settings → Variables).

### 5. Local API (optional)

In `worker/.dev.vars`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 6. Verify

- Open `https://YOUR_DOMAIN/cipher` — **Sign in with Google** should appear.
- Sign in with a Google account; you should receive a JWT like email/password login.
- Existing users with the same email are linked automatically.

### Notes

- `GOOGLE_CLIENT_ID` (worker) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend) must be the **same** value.
- Without these vars, Cipher uses email/password only; `/api/auth/google` returns 503.
