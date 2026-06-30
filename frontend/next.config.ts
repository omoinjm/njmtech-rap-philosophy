import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

const apiUrl = process.env.INTERNAL_API_URL ?? 'http://127.0.0.1:8787'

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }]
  },
}

export default nextConfig

initOpenNextCloudflareForDev()
