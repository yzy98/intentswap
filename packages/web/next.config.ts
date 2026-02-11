import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@packages/contract-deployments"],
};

export default nextConfig;
