import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "upload.wikimedia.org",
      "raw.githubusercontent.com",
      "lh3.googleusercontent.com",  // Add this line
    ],
  },
};

export default nextConfig;
