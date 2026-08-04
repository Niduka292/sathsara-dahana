import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent corrupted webpack pack files on Windows during HMR.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
