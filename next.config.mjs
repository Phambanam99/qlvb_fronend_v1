import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  //  output: 'export',
  // ESM configuration
  experimental: {
    // Speed up builds
    turbo: {
      rules: {},
    },
    // Faster builds with SWC
    swcTraceProfiling: false,
    // Disable strict mode for faster builds
    strictNextHead: false,
  },
  
  // Server external packages (updated from experimental)
  serverExternalPackages: [],
  
  // ✅ CRITICAL: Output configuration for Docker standalone mode
  output: 'standalone',
  
  // Build optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    styledComponents: true,
  },
  
  // Build performance optimization
  transpilePackages: [],
  
  // Webpack optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // ESM optimization
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    
    // Speed up builds
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [path.resolve(__dirname, 'next.config.mjs')], // ✅ Fixed: .mjs extension
        },
      }
    }
    
    // Optimize bundle
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true
          },
          lib: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 30
          }
        }
      }
    }
    
    // Optimize imports - using pre-defined __dirname
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    
    return config
  },
  
  // Performance optimization
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  
  // ✅ Image optimization - FIXED: Add Docker container IPs
  images: {
    domains: [
      'localhost', 
      '127.0.0.1', 
      '192.168.0.103',  // Add your server IP
      '0.0.0.0'         // Add for Docker binding
    ],
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    // Allow all hostnames in development
    ...(process.env.NODE_ENV === 'development' && {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: '**',
        },
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    }),
  },
  
  // ✅ Headers optimization with CORS for Docker
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // CORS headers for Docker networking
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'http://192.168.0.103:3000,http://192.168.88.130:3000,http://localhost:3000'
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
        ],
      },
    ]
  },
  
  // ✅ API rewrites for backend communication
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
      },
    ]
  },
  
  // Environment variables
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
    // ✅ Ensure these are available at build time
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  
  // ✅ CRITICAL: Server configuration for Docker networking
  serverRuntimeConfig: {
    // Server-side environment variables
    port: process.env.PORT || 3000,
    hostname: process.env.HOSTNAME || '0.0.0.0',
  },
  
  // ✅ Public runtime configuration
  publicRuntimeConfig: {
    // Client-side environment variables
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  },
  
  // Build optimization
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Trailing slash handling
  trailingSlash: false,
  
  // Redirects if needed
  async redirects() {
    return [
      // Add any redirects here if needed
    ]
  },
  
  // ✅ IMPORTANT: For Docker deployment
  distDir: '.next',
  cleanDistDir: true,
}

export default nextConfig