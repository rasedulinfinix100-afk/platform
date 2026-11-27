import type { NextConfig } from "next";

const repoName = "platform";
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isGitHubActions ? { basePath: `/${repoName}`, assetPrefix: `/${repoName}/` } : {}),
};

export default nextConfig;
