import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db/client";
import { outfits, users, votes } from "@/db/schema";
import type { PublicOutfitRow } from "@/lib/api/types";
import { getPrevBiWeekWindow } from "@/lib/week";
import { publicOutfitBaseSelect, toWireRow } from "./utils";

const TOP_N = 3;

type BaseRow = Omit<PublicOutfitRow, "liked">;

const fetchBase = async (windowStartSec: number, windowEndSec: number): Promise<BaseRow[]> => {
  const db = getDb();

  const periodLikes = sql<number>`(
    SELECT COUNT(*) FROM votes
    WHERE votes.outfit_id = ${outfits.id}
      AND votes.created_at >= ${windowStartSec}
      AND votes.created_at < ${windowEndSec}
  )`;

  const rows = await db
    .select({ ...publicOutfitBaseSelect, periodLikes })
    .from(outfits)
    .leftJoin(users, eq(users.id, outfits.userId))
    .where(eq(outfits.isPublic, true))
    .orderBy(desc(periodLikes), desc(outfits.upvotes), desc(outfits.createdAt))
    .limit(TOP_N);

  return rows.map(({ periodLikes: _p, ...rest }) => toWireRow(rest));
};

export async function queryWeeklyTop(
  currentUserId: string | null,
): Promise<PublicOutfitRow[]> {
  const { start, end } = getPrevBiWeekWindow();
  const windowStartSec = Math.floor(start.getTime() / 1000);
  const windowEndSec = Math.floor(end.getTime() / 1000);

  const getCachedBase = unstable_cache(
    () => fetchBase(windowStartSec, windowEndSec),
    ["podium-base", String(windowStartSec)],
    { revalidate: 3600, tags: ["podium"] },
  );

  const base = await getCachedBase();
  if (!currentUserId) return base.map((r) => ({ ...r, liked: false }));

  const ids = base.map((r) => r.id);
  if (ids.length === 0) return [];

  const db = getDb();
  const likedRows = await db
    .select({ outfitId: votes.outfitId })
    .from(votes)
    .where(and(eq(votes.userId, currentUserId), inArray(votes.outfitId, ids)));
  const likedSet = new Set(likedRows.map((r) => r.outfitId));

  return base.map((r) => ({ ...r, liked: likedSet.has(r.id) }));
}
