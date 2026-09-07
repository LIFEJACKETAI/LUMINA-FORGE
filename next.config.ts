import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {
    root: "/home/c-jay69/Documents/GitHub/LUMINA-FORGE",
  },
};

export default nextConfig;
