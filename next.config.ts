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

  // /api/template/[id] reads starter files off disk at runtime via
  // path.join(process.cwd(), ...). Because that path is built dynamically,
  // Next's file tracer can't prove the files are needed — it currently picks
  // them up only as a side effect of over-tracing, and already misses the
  // starters' .gitignore files. Declaring them explicitly guarantees the whole
  // directory ships with the serverless function.
  // The second pattern is not redundant: glob `*` does not match leading
  // dots, so without it the starters' .gitignore files are left out.
  outputFileTracingIncludes: {
    "/api/template/[id]": [
      "./vibecode-starters/**/*",
      "./vibecode-starters/**/.*",
    ],
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
