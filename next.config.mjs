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
      // Ignore sockjs-client warnings about missing supports-color
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'supports-color': false,
      };
    }
    return config;
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
