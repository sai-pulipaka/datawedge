/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "barcode.tec-it.com",
      },
    ],
  },
};

export default nextConfig;
