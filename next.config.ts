import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.cdn-files-a.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    turbo: {
      // Turbopack configuration options
    },
  },
};

export default nextConfig;
