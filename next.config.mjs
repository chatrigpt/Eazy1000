/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    qualities: [75],
  },
};
export default nextConfig;
