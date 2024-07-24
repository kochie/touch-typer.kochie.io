/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(md)$/i,
      type: "asset",
    });

    return config;
  },
};
