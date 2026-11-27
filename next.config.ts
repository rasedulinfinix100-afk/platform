import type { NextConfig } from "next";
const repoName = "platform";
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const config: NextConfig = { output: "export", trailingSlash: true, images: { unoptimized: true }, ...(isGitHubActions ? { basePath: `/${repoName}`, assetPrefix: `/${repoName}/` } : {}) };
export default config;
