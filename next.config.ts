import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow SVG in public folder to be served as images
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [],
    unoptimized: true,
  },
  // Turbopack config (Next.js 16 uses Turbopack by default)
  turbopack: {},
  // Suppress specific known harmless warnings
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
}

export default nextConfig
