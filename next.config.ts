import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zoom/meetingsdk"],
  turbopack: {
    resolveAlias: {
      "@zoom/download-manager": "./src/lib/empty-module.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@zoom/download-manager": false,
    };
    return config;
  },
};

export default nextConfig;
