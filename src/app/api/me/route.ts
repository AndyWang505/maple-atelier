import { NextResponse } from "next/server";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import { outfits, users, votes } from "@/db/schema";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";


export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const db = getDb();
    const rl = await checkRateLimit(db, {
      scope: `user:${userId}:delete-account`,
      windowSec: 3600,
      max: 3,
    });
    if (!rl.ok) return rateLimitResponse(rl.resetIn);

    // 自己 outfit 隨之 cascade,只 recount 他人 outfit
    const votedOnOthers = await db
      .select({ outfitId: votes.outfitId })
      .from(votes)
      .innerJoin(outfits, eq(outfits.id, votes.outfitId))
      .where(and(eq(votes.userId, userId), ne(outfits.userId, userId)));
    const affectedIds = votedOnOthers.map((r) => r.outfitId);

    await db.delete(users).where(eq(users.id, userId));

    // CASCADE 清掉 votes 但不更新對方 outfit.upvotes cache,要重算
    if (affectedIds.length > 0) {
      await db
        .update(outfits)
        .set({
          upvotes: sql<number>`(SELECT COUNT(*) FROM votes WHERE outfit_id = ${outfits.id})`,
        })
        .where(inArray(outfits.id, affectedIds));
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[api/me DELETE]", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
