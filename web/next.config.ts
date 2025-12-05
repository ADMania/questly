const STRAPI_BASE_URL = (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/+$/, "");

export default {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${STRAPI_BASE_URL}/api/:path*`
      },
      {
        source: "/uploads/:path*",
        destination: `${STRAPI_BASE_URL}/uploads/:path*`
      }
    ];
  },
  output: "standalone",
};
