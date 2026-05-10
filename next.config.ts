import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/**
 * CSP — 列出我們真正會載 / 連的 source。dev mode 加 'unsafe-eval' 是因 Webpack HMR 用 eval。
 * MUI / emotion 需要 inline style → style-src 'unsafe-inline'(沒 nonce 機制可走)。
 * 連線白名單:self、Discord(OAuth + avatar)、maplestory.io(item / character render)。
 */
const cspParts = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://maplestory.io https://cdn.discordapp.com data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://maplestory.io https://discord.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://discord.com",
];

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Content-Security-Policy", value: cspParts.join("; ") },
];

const nextConfig: NextConfig = {
  // 抑制 multi-lockfile 警告:pnpm-workspace.yaml 被誤認為 monorepo root,
  // 也避免 Next 把使用者家目錄(可能含其他 package-lock.json)當成 root。
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maplestory.io",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
