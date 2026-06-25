/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisation Vercel
  experimental: {
    // Améliore le build time
    optimizePackageImports: ['lucide-react', 'drizzle-orm'],
  },
  // Exclure better-sqlite3 du bundle client
  serverExternalPackages: ['better-sqlite3', '@neondatabase/serverless'],
};

export default nextConfig;
