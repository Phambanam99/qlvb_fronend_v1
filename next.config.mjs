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
  output: 'standalone', // ✅ Thêm dòng này để tối ưu build cho Docker
  
  // Cấu hình cho phép truy cập từ các IP trong mạng LAN
  experimental: {
    allowedDevOrigins: [
      '192.168.0.104',
      '192.168.1.0/24',  // Cho phép toàn bộ subnet 192.168.1.x
      '192.168.0.0/24',  // Cho phép toàn bộ subnet 192.168.0.x
      '10.0.0.0/8',      // Cho phép mạng private 10.x.x.x
      '172.16.0.0/12',   // Cho phép mạng private 172.16-31.x.x
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/ajax.php',
        destination: '/api/ajax-fallback',
      },
    ]
  },
}

export default nextConfig
