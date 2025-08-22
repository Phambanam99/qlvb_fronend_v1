import path from 'node:path'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone', // ✅ Temporarily disabled to avoid symlink issues on Windows
  devIndicators: false,
  // Cấu hình cho phép truy cập từ các IP trong mạng LAN
  experimental: {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // LAN dev hosts (adjust to your machine IP/port as needed)
      'http://192.168.0.103:3000',
      // Ngrok dev tunnel
      'https://33e3b94c413f.ngrok-free.app',
    ]
  },
  webpack: (config, { isServer }) => {
    // Alias 'supports-color' to a local stub to avoid missing module errors from debug/sockjs-client
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
  'supports-color': path.resolve('./shims/supports-color.js')
    }
    // Keep fallback in case other modules probe it as a core/module
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      'supports-color': false,
    }
    return config
  },
  
  async rewrites() {
    return [
      {
        source: '/ajax.php',
        destination: '/api/ajax-fallback',
      },
      {
        source: '/api/:path*',
  destination: 'http://localhost:8080/api/:path*', // Proxy to Backend (dev)
      },
      {
  source: '/ws/:path*',
  // Keep HTTP here; client will use relative '/ws' on HTTPS pages to avoid mixed content
  destination: 'http://localhost:8080/ws/:path*', // Proxy to Backend WebSocket (dev)
      },
    ]
  },
}

export default nextConfig
