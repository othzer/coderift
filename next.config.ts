import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'lh3.googleusercontent.com', // Google OAuth avatars
      },
      {
        protocol: "https",
        hostname: 'avatars.githubusercontent.com', // GitHub OAuth avatars
      },
      {
        protocol: "https",
        hostname: 'platform-lookaside.fbsbx.com', // Facebook OAuth avatars
      },
      // Add other trusted domains as needed
      {
        protocol: "https",
        hostname: 'your-cdn-domain.com',
      }
    ]
  }
};

export default nextConfig;