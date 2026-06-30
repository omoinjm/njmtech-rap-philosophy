import type { NextConfig } from 'next'

const internalApi = process.env.INTERNAL_API_URL ?? 'http://127.0.0.1:8000'

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${internalApi}/api/:path*` }]
  },
}

export default nextConfig
