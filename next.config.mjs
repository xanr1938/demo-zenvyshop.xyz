import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://unpkg.com https://static.cloudflareinsights.com https://vercel.live",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://sgp.cloud.appwrite.io wss://sgp.cloud.appwrite.io https://vercel.live https://unpkg.com",
  "frame-src https://vercel.live",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security",  value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Frame-Options",            value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",     value: "nosniff" },
  { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",         value: "geolocation=(), microphone=(), camera=()" },
  { key: "X-DNS-Prefetch-Control",     value: "on" },
  { key: "Content-Security-Policy",    value: CSP },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias["@appwrite"] = path.resolve(__dirname, "Appwrite_Main");
    return config;
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
