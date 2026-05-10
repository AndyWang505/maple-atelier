import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import { outfits, votes } from "@/db/schema";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "edge";

interface VoteBody {
  liked?: boolean;
}

/**
 * POST /api/outfits/:id/vote
 * body: { liked: boolean }
 *  - true → 寫入「推」(votes 表插入紀錄)
 *  - false → 移除「推」(刪除紀錄)
 *
 * votes 表存在 = 推。寫完從 votes 重算 outfits.upvotes,避免 increment 漏算 drift。
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) return new NextResponse("bad id", { status: 400 });

  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const db = getDb();
  const rl = await checkRateLimit(db, {
    scope: `user:${userId}:vote`,
    windowSec: 60,
    max: 30,
  });
  if (!rl.ok) return rateLimitResponse(rl.resetIn);

  const body = (await req.json()) as VoteBody;
  if (typeof body.liked !== "boolean") {
    return new NextResponse("invalid body", { status: 400 });
  }

  const [outfit] = await db
    .select({ id: outfits.id, userId: outfits.userId, isPublic: outfits.isPublic })
    .from(outfits)
    .where(eq(outfits.id, id));
  if (!outfit) return new NextResponse("not found", { status: 404 });
  if (!outfit.isPublic) {
    return new NextResponse("not found", { status: 404 });
  }
  if (outfit.userId === userId) {
    return new NextResponse("cannot vote on own outfit", { status: 403 });
  }

  if (body.liked) {
    // INSERT OR IGNORE — 已推過就 no-op
    await db
      .insert(votes)
      .values({ userId, outfitId: id })
      .onConflictDoNothing();
  } else {
    await db
      .delete(votes)
      .where(and(eq(votes.userId, userId), eq(votes.outfitId, id)));
  }

  const [counts] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(votes)
    .where(eq(votes.outfitId, id));
  const upvotes = Number(counts?.count ?? 0);
  await db.update(outfits).set({ upvotes }).where(eq(outfits.id, id));

  return NextResponse.json({ upvotes, liked: body.liked });
}
