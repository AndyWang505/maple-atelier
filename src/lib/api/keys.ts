import type { PublicOutfitsQuery } from "./types";

/**
 * SWR cache key 集中管理。
 * 規則:key 用「實際打 API 的 URL 字串」,跟 fetcher 一一對應,key match → URL match。
 * 跨 key invalidate 用 prefix 比對(SWR `mutate(predicate)` 模式)。
 */
export const KEYS = {
  publicOutfits: (params: PublicOutfitsQuery): string => {
    const sp = new URLSearchParams();
    if (params.sort && params.sort !== "new") sp.set("sort", params.sort);
    if (params.tag) sp.set("tag", params.tag);
    if (params.q) sp.set("q", params.q);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    if (params.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return qs ? `/api/outfits/public?${qs}` : "/api/outfits/public";
  },
  myOutfits: (): string => "/api/outfits?mine=1",
  outfitById: (id: number): string => `/api/outfits/${id}`,
  topTags: (limit = 20): string => `/api/tags?limit=${limit}`,
} as const;

/** 任何更動公開搭配的清單 / 排序的場合(讚 / 改公開 / 刪除 / 新增公開款),用這 predicate 全 invalidate */
export const isPublicOutfitsKey = (key: unknown): key is string =>
  typeof key === "string" && key.startsWith("/api/outfits/public");

export const isTagsKey = (key: unknown): key is string =>
  typeof key === "string" && key.startsWith("/api/tags");
