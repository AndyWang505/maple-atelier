import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import PageShell from "@/components/layout/PageShell";
import {
  queryPublicOutfits,
  parsePublicOutfitsParams,
} from "@/lib/queries/public-outfits";
import { queryTopTags } from "@/lib/queries/top-tags";
import { queryWeeklyTop } from "@/lib/queries/weekly-top";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import WeeklyPodium from "@/components/WeeklyPodium";
import ExploreClient, { EXPLORE_PAGE_SIZE } from "./ExploreClient";

export const metadata: Metadata = {
  title: "探索搭配",
  description: `瀏覽其他楓友在 ${SITE_NAME}（楓葉工坊）分享的時裝搭配與紙娃娃造型，依熱門 / 趨勢 / 最新排序，或用標籤、關鍵字尋找靈感。`,
  alternates: { canonical: "/explore" },
  openGraph: {
    title: `探索搭配 | ${SITE_NAME}`,
    description: "瀏覽楓友分享的時裝搭配與紙娃娃造型，依熱門 / 趨勢 / 最新排序，或用標籤尋找靈感。",
    url: `${SITE_URL}/explore`,
  },
};

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

  const session = await auth();
  const me = session?.user?.id ?? null;

  const [fallbackOutfits, fallbackTopTags, weeklyTop] = await Promise.all([
    queryPublicOutfits(db, me, params),
    queryTopTags(db, 20),
    queryWeeklyTop(me),
  ]);

  return (
    <PageShell>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
        探索搭配
      </h1>
      <WeeklyPodium outfits={weeklyTop} currentUserId={me} />
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
