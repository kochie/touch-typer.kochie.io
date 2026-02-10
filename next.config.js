/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {},
  // Acknowledge Turbopack (Next.js 16 default); custom webpack rules below still apply when using --webpack
  turbopack: {},
  webpack(config) {
    config.module.rules.push({
      test: /\.(md)$/i,
      type: "asset",
    });

    return config;
  },
};
