/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['mapbox-gl'],
  experimental: {
    serverComponentsExternalPackages: ['@duckdb/node-api', '@duckdb/node-bindings'],
  },
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/icon.svg' }];
  },
};

export default nextConfig;
