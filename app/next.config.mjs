/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_INFERABLE_API_URL || "https://api.inferable.ai"}/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
