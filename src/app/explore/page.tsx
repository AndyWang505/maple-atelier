import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import PageShell from "@/components/layout/PageShell";
import {
  queryPublicOutfits,
  parsePublicOutfitsParams,
} from "@/lib/queries/public-outfits";
import { queryTopTags } from "@/lib/queries/top-tags";
import ExploreClient, { EXPLORE_PAGE_SIZE } from "./ExploreClient";

export const runtime = "edge";

interface ExplorePageProps {
  searchParams: Promise<{
    sort?: string;
    tag?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const sp = await searchParams;
  const params = parsePublicOutfitsParams(
    new URLSearchParams(
      Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][],
    ),
    EXPLORE_PAGE_SIZE,
  );

  const db = getDb();

  // auth + 兩個 query 互不依賴(query 只在「登入帶 liked」時讀 userId,但讀本身不阻塞 query 啟動)
  // 三者並行:auth 拿 session,query 直接跑(不帶 currentUserId 也能組 SQL)
  const session = await auth();
  const me = session?.user?.id ?? null;

  const [fallbackOutfits, fallbackTopTags] = await Promise.all([
    queryPublicOutfits(db, me, params),
    queryTopTags(db, 20),
  ]);

  return (
    <PageShell bg="soft">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
        探索搭配
      </h1>
      {/* Suspense:ExploreClient 用 useSearchParams 讀 URL,需要 boundary */}
      <Suspense fallback={null}>
        <ExploreClient
          currentUserId={me}
          fallbackOutfits={fallbackOutfits}
          fallbackTopTags={fallbackTopTags}
        />
      </Suspense>
    </PageShell>
  );
}
