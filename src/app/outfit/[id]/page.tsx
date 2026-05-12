import type { Metadata } from "next";
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
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import OutfitDetail from "./OutfitDetail";


interface OutfitPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: OutfitPageProps,
): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return { robots: { index: false, follow: false } };
  }

  const db = getDb();
  const [row] = await db
    .select({
      title: outfits.title,
      description: outfits.description,
      tags: outfits.tags,
      isPublic: outfits.isPublic,
      authorName: authorNameSql,
    })
    .from(outfits)
    .leftJoin(users, eq(users.id, outfits.userId))
    .where(eq(outfits.id, id));

  if (!row || !row.isPublic) {
    return { robots: { index: false, follow: false } };
  }

  const author = row.authorName ?? "匿名玩家";
  const title = row.title;
  const tagSuffix = row.tags?.length ? ` · ${row.tags.map((t) => `#${t}`).join(" ")}` : "";
  const description =
    row.description?.slice(0, 160) ??
    `${author} 在 ${SITE_NAME}（楓葉工坊）分享的紙娃娃時裝搭配${tagSuffix}`;
  const url = `${SITE_URL}/outfit/${id}`;

  return {
    title,
    description,
    alternates: { canonical: `/outfit/${id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
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

  // 只對公開搭配輸出 JSON-LD,避免私密內容外洩(雖然 schema bot 也未必爬得到)
  const jsonLd = row.isPublic
    ? buildOutfitJsonLd({
        id: row.id,
        title: row.title,
        description: row.description,
        tags: row.tags,
        upvotes: row.upvotes,
        createdAt: row.createdAt,
        authorName: row.authorName,
      })
    : null;

  return (
    <PageShell width="content" bg="soft">
      {jsonLd && (
        <script
          type="application/ld+json"
          // schema.org JSON-LD,內容由 server-side 控制不會有 untrusted input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
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

interface OutfitJsonLdInput {
  id: number;
  title: string;
  description: string | null;
  tags: string[] | null;
  upvotes: number;
  createdAt: Date;
  authorName: string | null;
}

function buildOutfitJsonLd(o: OutfitJsonLdInput) {
  const url = `${SITE_URL}/outfit/${o.id}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": url,
        name: o.title,
        description: o.description ?? undefined,
        url,
        image: `${url}/opengraph-image`,
        keywords: o.tags?.length ? o.tags.join(", ") : undefined,
        dateCreated: o.createdAt.toISOString(),
        author: {
          "@type": "Person",
          name: o.authorName ?? "匿名玩家",
        },
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: { "@type": "LikeAction" },
          userInteractionCount: o.upvotes,
        },
        isPartOf: { "@type": "WebSite", "@id": SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首頁", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "探索", item: `${SITE_URL}/explore` },
          { "@type": "ListItem", position: 3, name: o.title, item: url },
        ],
      },
    ],
  };
}
