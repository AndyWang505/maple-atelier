import { eq, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { outfits, outfitTags } from "@/db/schema";
import type { TagCount } from "@/lib/api/types";

export async function queryTopTags(db: Db, limit: number): Promise<TagCount[]> {
  const rows = await db
    .select({
      tag: outfitTags.tag,
      count: sql<number>`COUNT(*)`,
    })
    .from(outfitTags)
    .innerJoin(outfits, eq(outfits.id, outfitTags.outfitId))
    .where(eq(outfits.isPublic, true))
    .groupBy(outfitTags.tag)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);
  return rows.map((r) => ({ tag: r.tag, count: Number(r.count) }));
}
