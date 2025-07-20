/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' to enable API routes
  // output: 'export', // Commented out to enable server-side functionality
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // Environment variable configuration
  env: {
    // These will be available at build time
    CUSTOM_BUILD_TIME: new Date().toISOString(),
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Webpack configuration for better environment handling
  webpack: (config, { dev, isServer }) => {
    // In development, validate environment variables at build time
    if (dev && isServer) {
      // Simple environment validation without importing TypeScript modules
      if (!process.env.OPENAI_API_KEY) {
        console.error('❌ Environment validation failed: OPENAI_API_KEY is required');
        console.error('Please check your .env.local file and ensure all required variables are set.');
      } else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
        console.error('❌ Environment validation failed: OPENAI_API_KEY appears to be invalid');
        console.error('OpenAI API keys should start with "sk-"');
      } else {
        console.log('✅ Environment variables validated successfully');
      }
    }
    
    return config;
  },
}

module.exports = nextConfig