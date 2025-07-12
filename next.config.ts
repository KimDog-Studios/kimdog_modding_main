import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "upload.wikimedia.org",   // For the speed test image
      "raw.githubusercontent.com", // For any GitHub raw assets like icons you referenced
      // Add your own image hosting domains here as needed
    ],
  },
  // Add other config options here if needed
};

export default nextConfig;
