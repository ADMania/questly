import type { NextConfig } from "next";

const STRAPI_BASE_URL = (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/cms/:path*",
        destination: `${STRAPI_BASE_URL}/:path*`,
      },
    ];
  },
  output: "standalone",
};

export default nextConfig;
