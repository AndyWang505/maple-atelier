import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { outfits } from "@/db/schema";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 3600;

const MAX_OUTFITS = 10_000;

const staticEntries: MetadataRoute.Sitemap = [
  { url: "/", changeFrequency: "daily", priority: 1.0 },
  { url: "/explore", changeFrequency: "hourly", priority: 0.9 },
  { url: "/simulator", changeFrequency: "weekly", priority: 0.8 },
  { url: "/about", changeFrequency: "monthly", priority: 0.5 },
  { url: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();
  const rows = await db
    .select({ id: outfits.id, updatedAt: outfits.updatedAt })
    .from(outfits)
    .where(eq(outfits.isPublic, true))
    .orderBy(desc(outfits.updatedAt))
    .limit(MAX_OUTFITS);

  const outfitEntries: MetadataRoute.Sitemap = rows.map((r) => ({
    url: `${SITE_URL}/outfit/${r.id}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticEntries.map((e) => ({
      ...e,
      url: e.url.startsWith("http") ? e.url : `${SITE_URL}${e.url}`,
    })),
    ...outfitEntries,
  ];
}
