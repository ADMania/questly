const STRAPI_BASE_URL = (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/+$/, "");

export default {
  async rewrites() {
    return [
      {
        source: "/cms/:path*",
        destination: `${STRAPI_BASE_URL}/:path*`
      }
    ];
  },
  output: "standalone",
};
