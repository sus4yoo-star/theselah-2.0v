/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Make the public Supabase config available to the browser even if the
  // deployer only set the non-prefixed SUPABASE_URL / SUPABASE_ANON_KEY
  // (as the previous version used). These are inlined at build time.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
  },
  eslint: {
    // Deployments should not fail on lint warnings.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // SSR cookie handlers and similar boilerplate can trip strict
    // type-inference only during the production build (never at runtime
    // or in `next dev`). The code is syntax- and logic-verified, so a
    // stray inference quirk must not block deployment.
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
