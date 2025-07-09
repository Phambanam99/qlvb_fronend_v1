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
