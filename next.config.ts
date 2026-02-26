import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "zormolo.github.io" },
      { protocol: "https", hostname: "dotgg.gg" },
      // Add CDN hostnames as discovered
    ],
  },
};

export default nextConfig;
