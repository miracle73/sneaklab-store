import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile in a parent
  // directory can otherwise be inferred as the root).
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i8.amplience.net",
      },
      {
        protocol: "https",
        hostname: "*.amplience.net",
      },
    ],
  },
};

export default nextConfig;
