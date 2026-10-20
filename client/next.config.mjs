import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_URL || "http://localhost:5000";

const nextConfig = {
  // Silence the multi-lockfile root warning: this app lives inside a repo that
  // also has a root package-lock.json, which Next.js would otherwise mis-detect.
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react", "jspdf", "jspdf-autotable", "framer-motion", "@tanstack/react-table"],
  },
  async rewrites() {
    // Catch-all: every /api/* request proxies to the Express backend.
    // This fixed the 404s for /api/users, /api/subjects and /api/classes,
    // which the previous explicit rewrite list never included.
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
