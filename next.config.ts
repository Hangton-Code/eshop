import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      new URL("https://iczan2dkjknou4uq.public.blob.vercel-storage.com/**"),
    ],
  },
};

export default nextConfig;
