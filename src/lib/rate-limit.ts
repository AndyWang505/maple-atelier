import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Db } from "@/db/client";
import { rateLimits } from "@/db/schema";

export interface RateLimitConfig {
  /** 識別字串前綴,例如 "user:abc123:vote" / "ip:1.2.3.4:search" */
  scope: string;
  windowSec: number;
  /** 每個 window 容許的最大次數 */
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** 還剩幾秒這個 window 才結束(回 429 時放 Retry-After) */
  resetIn: number;
}

// Fixed-window: cheaper than sliding (1 D1 op) but allows up to 2× max at boundaries.
export async function checkRateLimit(
  db: Db,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / config.windowSec);
  const key = `${config.scope}:${bucket}`;
  const expiresAt = (bucket + 1) * config.windowSec;

  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, expiresAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });

  const count = Number(row?.count ?? 0);
  const ok = count <= config.max;

  // Probabilistic GC. Must use waitUntil — CF kills fire-forget Promises after response.
  if (Math.random() < 0.01) {
    try {
      const { ctx } = getCloudflareContext();
      ctx.waitUntil(
        db.delete(rateLimits).where(sql`${rateLimits.expiresAt} < ${now}`),
      );
    } catch {
      // skip this cycle
    }
  }

  return { ok, resetIn: Math.max(1, expiresAt - now) };
}

// Fallback "unknown" gets shared site-wide — acceptable for rate-limit bucket.
export function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { error: "請求太頻繁,請稍後再試", code: "rate_limited" },
    {
      status: 429,
      headers: { "Retry-After": String(resetIn) },
    },
  );
}
