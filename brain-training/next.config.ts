import type { NextConfig } from "next";
import createNextPWA from "@ducanh2912/next-pwa";

const withPWA = createNextPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  cacheOnFrontEndNav: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@upstash/redis", "zod"],
  },
};

export default withPWA(nextConfig);
