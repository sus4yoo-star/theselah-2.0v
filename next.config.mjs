/** @type {import('next').NextConfig} */

// Two build targets from ONE codebase:
//   • default (Netlify)   → server mode. Serves /api/* + the web version.
//   • BUILD_TARGET=capacitor → static export to /out for the mobile app.
//     API routes are excluded by the build:app script; the app calls the
//     remote API on Netlify instead.
const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Static export settings — only when building the mobile app.
  ...(isCapacitor
    ? {
        output: "export",
        // next/image optimization needs a server; disable for static.
        images: { unoptimized: true },
        // Capacitor serves files from a directory, so trailing-slash
        // routing avoids 404s on nested routes inside the WebView.
        trailingSlash: true,
      }
    : {}),

  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
    // Where the mobile app should send API calls. In the web build this
    // is empty (same-origin "/api/..."). In the app build it must point
    // at the deployed backend.
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || "",
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // headers() is a server feature and is not compatible with `output:
  // 'export'`, so only attach it for the web/server build.
  ...(isCapacitor
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/sw.js",
              headers: [
                {
                  key: "Cache-Control",
                  value: "no-cache, no-store, must-revalidate",
                },
                { key: "Service-Worker-Allowed", value: "/" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
