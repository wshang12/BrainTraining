import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  eslint: {
    // 在生产构建时将 ESLint 错误转为警告
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建时忽略 TypeScript 错误（仅用于开发）
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
  },
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
