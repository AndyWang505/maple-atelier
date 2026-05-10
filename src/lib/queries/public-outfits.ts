import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { outfits, users, votes } from "@/db/schema";
import type { PublicOutfitsResponse } from "@/lib/api/types";
import { authorNameSql, toWireRow } from "./utils";

export const PUBLIC_DEFAULT_LIMIT = 24;
export const PUBLIC_MAX_LIMIT = 60;
export const PUBLIC_MAX_Q_LEN = 50;

export interface PublicOutfitsParams {
  sort: "hot" | "trending" | "new";
  tag: string | null;
  q: string;
  page: number;
  limit: number;
}

export function parsePublicOutfitsParams(
  sp: URLSearchParams,
  defaultLimit: number,
): PublicOutfitsParams {
  const sortParam = sp.get("sort");
  const sort: PublicOutfitsParams["sort"] =
    sortParam === "trending" ? "trending" : sortParam === "new" ? "new" : "hot";
  const q = (sp.get("q") ?? "")
    .trim()
    .slice(0, PUBLIC_MAX_Q_LEN)
    .replace(/[%_]/g, "");
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const rawLimit = sp.get("limit");
  const limit = rawLimit
    ? Math.min(PUBLIC_MAX_LIMIT, Math.max(1, Number(rawLimit)))
    : defaultLimit;
  return { sort, tag: sp.get("tag"), q, page, limit };
}

// Authenticated callers get `liked` via LEFT JOIN votes; anonymous always false.
export async function queryPublicOutfits(
  db: Db,
  currentUserId: string | null,
  params: PublicOutfitsParams,
): Promise<PublicOutfitsResponse> {
  const { sort, tag, q, page, limit } = params;
  const offset = (page - 1) * limit;

  const tagFilter = tag
    ? sql`EXISTS (SELECT 1 FROM outfit_tags WHERE outfit_id = ${outfits.id} AND tag = ${tag})`
    : undefined;
  const searchFilter = q
    ? or(
        like(outfits.title, `%${q}%`),
        like(outfits.description, `%${q}%`),
        like(authorNameSql, `%${q}%`),
      )
    : undefined;
  const where = and(eq(outfits.isPublic, true), tagFilter, searchFilter);

  const orderBy =
    sort === "hot"
      ? [desc(outfits.upvotes), desc(outfits.createdAt)]
      : sort === "trending"
        ? [
            // upvotes / (age_in_days + 2):2 是 dampen 常數,避免剛 publish 的作品分母逼近 0 瞬間衝頂
            desc(
              sql`CAST(${outfits.upvotes} AS REAL) / ((unixepoch() - ${outfits.createdAt}) / 86400.0 + 2)`,
            ),
            desc(outfits.createdAt),
          ]
        : [desc(outfits.createdAt), asc(outfits.id)];

  const baseSelect = {
    id: outfits.id,
    userId: outfits.userId,
    title: outfits.title,
    description: outfits.description,
    payload: outfits.payload,
    tags: outfits.tags,
    upvotes: outfits.upvotes,
    isPublic: outfits.isPublic,
    createdAt: outfits.createdAt,
    updatedAt: outfits.updatedAt,
    authorName: authorNameSql,
    authorImage: users.image,
  };

  const rawRows = currentUserId
    ? (
        await db
          .select({ ...baseSelect, likedKey: votes.userId })
          .from(outfits)
          .leftJoin(users, eq(users.id, outfits.userId))
          .leftJoin(
            votes,
            and(
              eq(votes.outfitId, outfits.id),
              eq(votes.userId, currentUserId),
            ),
          )
          .where(where)
          .orderBy(...orderBy)
          .limit(limit)
          .offset(offset)
      ).map(({ likedKey, ...rest }) => ({
        ...rest,
        liked: likedKey !== null,
      }))
    : (
        await db
          .select(baseSelect)
          .from(outfits)
          .leftJoin(users, eq(users.id, outfits.userId))
          .where(where)
          .orderBy(...orderBy)
          .limit(limit)
          .offset(offset)
      ).map((r) => ({ ...r, liked: false }));

  const rows = rawRows.map(toWireRow);

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(outfits)
    .leftJoin(users, eq(users.id, outfits.userId))
    .where(where);

  return {
    rows,
    page,
    limit,
    total: Number(total),
    hasMore: offset + rows.length < Number(total),
  };
}
