import { sql } from "drizzle-orm";
import { outfits, users } from "@/db/schema";

// displayName overrides Discord name in public-facing queries.
export const authorNameSql = sql<string | null>`COALESCE(${users.displayName}, ${users.name})`;

export const publicOutfitBaseSelect = {
  id: outfits.id,
  userId: outfits.userId,
  title: outfits.title,
  description: outfits.description,
  payload: outfits.payload,
  tags: outfits.tags,
  upvotes: outfits.upvotes,
  views: outfits.views,
  isPublic: outfits.isPublic,
  createdAt: outfits.createdAt,
  updatedAt: outfits.updatedAt,
  authorName: authorNameSql,
  authorImage: users.image,
};

// Drizzle returns Date; wire format uses epoch ms — apply at every server→client boundary.
export const toWireRow = <T extends { createdAt: Date; updatedAt: Date }>(
  r: T,
): Omit<T, "createdAt" | "updatedAt"> & { createdAt: number; updatedAt: number } => ({
  ...r,
  createdAt: r.createdAt.getTime(),
  updatedAt: r.updatedAt.getTime(),
});
