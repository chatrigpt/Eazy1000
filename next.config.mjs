/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.doculator.org", pathname: "/images/**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    qualities: [75],
  },
};
export default nextConfig;
