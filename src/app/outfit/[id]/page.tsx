import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import {
  outfits,
  type OutfitPayload,
  type OutfitSlotRef,
  users,
  votes,
} from "@/db/schema";
import { fetchSlotItemInfo, type ItemInfo } from "@/lib/maplestory";
import type { Slot } from "@/types/maplestory";
import PageShell from "@/components/layout/PageShell";
import { authorNameSql } from "@/lib/queries/utils";
import OutfitDetail from "./OutfitDetail";


interface OutfitPageProps {
  params: Promise<{ id: string }>;
}

// 永遠不會在 votes.userId 出現的 sentinel,讓匿名 LEFT JOIN 一定 miss
const NO_USER_SENTINEL = "__none__";

async function fetchItemInfoForPayload(
  payload: OutfitPayload,
): Promise<Record<number, ItemInfo>> {
  const lookups = (Object.entries(payload.slots) as [Slot, OutfitSlotRef][])
    .filter(([, ref]) => ref !== undefined)
    .map(async ([slot, ref]): Promise<readonly [number, ItemInfo] | null> => {
      const info = await fetchSlotItemInfo(slot, ref.id, {
        region: ref.region,
        version: ref.version,
      });
      return info ? [ref.id, info] : null;
    });
  const results = await Promise.all(lookups);
  const map: Record<number, ItemInfo> = {};
  for (const r of results) {
    if (r) map[r[0]] = r[1];
  }
  return map;
}

export default async function OutfitPage({ params }: OutfitPageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) notFound();

  const session = await auth();
  const me = session?.user?.id ?? null;

  const db = getDb();
  const [rawRow] = await db
    .select({
      id: outfits.id,
      userId: outfits.userId,
      title: outfits.title,
      description: outfits.description,
      payload: outfits.payload,
      tags: outfits.tags,
      upvotes: outfits.upvotes,
      isPublic: outfits.isPublic,
      createdAt: outfits.createdAt,
      authorName: authorNameSql,
      authorImage: users.image,
      likedKey: votes.userId,
    })
    .from(outfits)
    .leftJoin(users, eq(users.id, outfits.userId))
    .leftJoin(
      votes,
      and(
        eq(votes.outfitId, outfits.id),
        eq(votes.userId, me ?? NO_USER_SENTINEL),
      ),
    )
    .where(eq(outfits.id, id));

  if (!rawRow) notFound();
  if (!rawRow.isPublic && rawRow.userId !== me) notFound();

  const itemInfo = await fetchItemInfoForPayload(rawRow.payload);

  const { likedKey, ...row } = rawRow;
  return (
    <PageShell width="content" bg="soft">
      <OutfitDetail
        outfit={row}
        liked={likedKey != null}
        isAuthenticated={!!me}
        isOwnOutfit={rawRow.userId === me}
        itemInfo={itemInfo}
      />
    </PageShell>
  );
}
