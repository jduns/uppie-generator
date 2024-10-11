// next.config.js

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    AI_HORDE_API_KEY: process.env.AI_HORDE_API_KEY,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
};
