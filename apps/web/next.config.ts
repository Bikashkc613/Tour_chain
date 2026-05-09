import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // outputFileTracingRoot is required for Vercel monorepo deploys so that
  // the build can trace files outside apps/web. It is intentionally omitted
  // in development because Turbopack uses it to determine the CSS module
  // resolution root, which causes "Can't resolve 'tailwindcss'" errors when
  // the root package.json has no node_modules.
  ...(process.env.VERCEL
    ? { outputFileTracingRoot: path.join(__dirname, "../../") }
    : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {},
  // Webpack config for non-Turbopack builds
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
