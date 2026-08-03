/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_URL || "http://localhost:5000";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react", "jspdf", "jspdf-autotable", "framer-motion"],
  },
  async rewrites() {
    return {
      // Explicit list: a "/api/:path*" catch-all would swallow the dynamic
      // NextAuth route (app/api/auth/[...nextauth]). Backend auth endpoints
      // and other prefixes are listed individually; NextAuth paths
      // (/api/auth/session, /api/auth/callback/*, ...) fall through to it.
      afterFiles: [
        { source: "/api/auth/login", destination: `${backend}/api/auth/login` },
        { source: "/api/auth/signup", destination: `${backend}/api/auth/signup` },
        { source: "/api/auth/logout", destination: `${backend}/api/auth/logout` },
        { source: "/api/auth/profile", destination: `${backend}/api/auth/profile` },
        { source: "/api/auth/password", destination: `${backend}/api/auth/password` },
        { source: "/api/course/:path*", destination: `${backend}/api/course/:path*` },
        { source: "/api/students/:path*", destination: `${backend}/api/students/:path*` },
        { source: "/api/quizzes/:path*", destination: `${backend}/api/quizzes/:path*` },
        { source: "/api/analytics/:path*", destination: `${backend}/api/analytics/:path*` },
        { source: "/api/public/:path*", destination: `${backend}/api/public/:path*` },
      ],
    };
  },
};

export default nextConfig;
