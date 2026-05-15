import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { queryTopTags } from "@/lib/queries/top-tags";


const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * GET /api/tags?limit=20
 * 公開搭配的標籤計數,熱度排序。標籤雲 / 探索頁的 tag chip 來源。
 */
export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT)),
    );

    const db = getDb();
    const rows = await queryTopTags(db, limit);

    return NextResponse.json(rows, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[api/tags GET]", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
