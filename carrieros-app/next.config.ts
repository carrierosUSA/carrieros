import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Validation remains authoritative at 15 MB. The transport margin covers
    // multipart metadata without widening the accepted document size.
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
