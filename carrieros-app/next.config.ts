import type { NextConfig } from "next";
import path from "path";
import {
  BASELINE_SECURITY_HEADERS,
  CSP_REPORT_ONLY,
} from "./lib/security/headers";

const securityHeaderList = [
  ...Object.entries(BASELINE_SECURITY_HEADERS).map(([key, value]) => ({
    key,
    value,
  })),
  {
    key: "Content-Security-Policy-Report-Only",
    value: CSP_REPORT_ONLY,
  },
];

const nextConfig: NextConfig = {
  // Pin Turbopack to this app — parent monorepo lockfile otherwise wins and
  // can corrupt/miss `.next/dev` manifests when builds share the tree.
  turbopack: {
    root: path.join(__dirname),
  },
  // Allow isolated production builds while `next dev` holds `.next`
  ...(process.env.NEXT_DIST_DIR
    ? { distDir: process.env.NEXT_DIST_DIR }
    : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaderList,
      },
    ];
  },
};

export default nextConfig;
