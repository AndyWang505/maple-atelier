import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import {
  queryPublicOutfits,
  parsePublicOutfitsParams,
  PUBLIC_DEFAULT_LIMIT,
} from "@/lib/queries/public-outfits";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

export const runtime = "edge";

// q triggers LIKE full-table scan → IP rate-limited.
export async function GET(req: NextRequest) {
  const params = parsePublicOutfitsParams(req.nextUrl.searchParams, PUBLIC_DEFAULT_LIMIT);
  const db = getDb();

  const [session, qRl] = await Promise.all([
    auth(),
    params.q
      ? checkRateLimit(db, {
          scope: `ip:${getClientIp(req)}:search`,
          windowSec: 60,
          max: 30,
        })
      : Promise.resolve(null),
  ]);
  if (qRl && !qRl.ok) return rateLimitResponse(qRl.resetIn);

  const me = session?.user?.id ?? null;
  const result = await queryPublicOutfits(db, me, params);

  // Anonymous responses are user-agnostic → edge-cacheable; logged-in carry per-user `liked`.
  const cacheControl = me
    ? "private, max-age=10"
    : "public, s-maxage=30, stale-while-revalidate=60";
  return NextResponse.json(result, {
    headers: { "Cache-Control": cacheControl },
  });
}
