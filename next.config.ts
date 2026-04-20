import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Allowlist rather than `hostname: '*'` — a wildcard lets anyone route
    // arbitrary remote images through the Next image optimizer. The only
    // remote images this app renders are OAuth avatars, and the only
    // configured providers are GitHub and Google (see auth.config.ts).
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: "https",
        hostname: 'lh3.googleusercontent.com',
      },
    ]
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  
  reactStrictMode: false
};

export default nextConfig;
