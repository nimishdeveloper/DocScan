/** @type {import('next').NextConfig} */
const nextConfig = {
  
  // Configuration for Tesseract.js to work in the browser
  webpack: (config, { isServer }) => {
    // Disable node.js specific modules in the browser
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },

  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;