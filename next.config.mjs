/** 
 * REQ: OFP-TECH-001, OFP-TECH-002
 * Next.js 15 App Router Konfiguration für den Office Seating Planner.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  }
};

export default nextConfig;

