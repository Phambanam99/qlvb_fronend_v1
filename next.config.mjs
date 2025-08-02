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
      '*',   // Cho phép mạng private 172.16-31.x.x
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/ajax.php',
        destination: '/api/ajax-fallback',
      },
      {
        source: '/api/:path*',
        destination: 'http://192.168.0.103:8080/api/:path*', // Proxy to Backend
      },
    ]
  },
}

export default nextConfig
