import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "upload.wikimedia.org",
      "raw.githubusercontent.com",
      "lh3.googleusercontent.com",
      "firebasestorage.googleapis.com",  // Added this line
    ],
  },
};

export default nextConfig;
