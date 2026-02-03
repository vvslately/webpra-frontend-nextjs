import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.cdn-files-a.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pic.in.th",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "pic.in.th",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
