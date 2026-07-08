/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb"
    }
  },
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
        protocol: "https"
      }
    ]
  }
};

export default nextConfig;
