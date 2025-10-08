import bundleAnalyzer from '@next/bundle-analyzer'

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
  // Removed 'standalone' output to avoid Windows symlink (EPERM) issues during build
  // output: 'standalone',
  devIndicators: false,
  // Cấu hình cho phép truy cập từ các IP trong mạng LAN
  experimental: {
    allowedDevOrigins: [
      '192.168.88.130',      // IP cụ thể của backend server
      '192.168.88.130/16',     // Cho phép toàn bộ mạng 192.168.x.x
      '172.16.0.0/12',      // Cho phép mạng private 172.16-31.x.x
      '10.0.0.0/8',         // Cho phép mạng private 10.x.x.x
      'localhost',          // Localhost
      '127.0.0.1',          // Loopback
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Disable node-only debug package and stub 'supports-color' in the browser build
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        debug: false,
        'supports-color': false,
      };
    }
    return config;
  },
  
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:8080';
    return [
      {
        source: '/ajax.php',
        destination: '/api/ajax-fallback',
      },
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`, // Proxy to Backend
      },
    ]
  },
}

// Enable with: $env:ANALYZE="true"; pnpm build
const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default withAnalyzer(nextConfig)
