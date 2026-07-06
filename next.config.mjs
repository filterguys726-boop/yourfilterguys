/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  devIndicators: false,
  experimental: {
    devtoolSegmentExplorer: false,
    serverActions: {
      bodySizeLimit: "8mb"
    }
  }
};

export default nextConfig;
