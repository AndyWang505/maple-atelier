"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { mutate as globalMutate } from "swr";
import {
  createOutfit,
  deleteOutfit,
  getMyOutfits,
  getPublicOutfits,
  updateOutfit,
  voteOutfit,
} from "@/lib/api/clients/outfits";
import { apiJson } from "@/lib/api/fetcher";
import { isPublicOutfitsKey, isTagsKey, KEYS } from "@/lib/api/keys";
import type {
  CreateOutfitBody,
  MyOutfitRow,
  OutfitDetailRow,
  PublicOutfitsQuery,
  PublicOutfitsResponse,
  UpdateOutfitBody,
} from "@/lib/api/types";

/** 模擬器 edit/load mode:SWR key 為 null 時不發請求。fetcher 直接從 key 解 URL,避免 closure 捕捉外部 id */
export function useApiOutfit(id: number | null) {
  return useSWR<OutfitDetailRow>(
    id !== null ? KEYS.outfitById(id) : null,
    (key: string) => apiJson<OutfitDetailRow>(key),
  );
}

export function useApiPublicOutfits(
  params: PublicOutfitsQuery,
  fallbackData?: PublicOutfitsResponse,
) {
  return useSWR<PublicOutfitsResponse>(
    KEYS.publicOutfits(params),
    () => getPublicOutfits(params),
    { keepPreviousData: true, fallbackData },
  );
}

export function useApiMyOutfits(fallbackData?: MyOutfitRow[]) {
  // 包一層:直接傳 getMyOutfits 會被 SWR 把 cache key 塞到 RequestInit 參數,fetch 會炸
  return useSWR<MyOutfitRow[]>(KEYS.myOutfits(), () => getMyOutfits(), {
    fallbackData,
  });
}

const revalidatePublicAndTags = () =>
  Promise.all([
    globalMutate(isPublicOutfitsKey, undefined, { revalidate: true }),
    globalMutate(isTagsKey, undefined, { revalidate: true }),
  ]);

/**
 * Key 帶 outfitId 避免 /explore 多張 LikeButton 共用 isMutating。
 * mutate 用 revalidate:false + updater fn — patch 既有 cache 裡那一筆 outfit
 * 的 upvotes/liked,不重抓避免 server 依 upvotes 重排造成卡片跳位置;同時
 * 上一頁回到 /explore 看到的快取也已是最新值,不會出現「我推過的不見了」。
 */
export function useApiVoteOutfit(outfitId: number) {
  return useSWRMutation(
    ["outfit-vote", outfitId] as const,
    async (_key, { arg }: { arg: { liked: boolean } }) => {
      const result = await voteOutfit(outfitId, arg.liked);
      void globalMutate(
        isPublicOutfitsKey,
        (current?: PublicOutfitsResponse) =>
          current && {
            ...current,
            rows: current.rows.map((r) =>
              r.id === outfitId
                ? { ...r, upvotes: result.upvotes, liked: result.liked }
                : r,
            ),
          },
        { revalidate: false },
      );
      return result;
    },
  );
}

export function useApiDeleteOutfit() {
  return useSWRMutation(
    "outfit-delete",
    async (_key, { arg: id }: { arg: number }) => {
      await globalMutate(
        KEYS.myOutfits(),
        async () => {
          await deleteOutfit(id);
          return undefined;
        },
        {
          optimisticData: (prev?: MyOutfitRow[]) =>
            prev?.filter((x) => x.id !== id) ?? [],
          rollbackOnError: true,
          revalidate: false,
        },
      );
      void revalidatePublicAndTags();
    },
  );
}

export function useApiUpdateOutfit() {
  return useSWRMutation(
    "outfit-update",
    async (
      _key,
      { arg }: { arg: { id: number; body: UpdateOutfitBody } },
    ) => {
      const updated = await updateOutfit(arg.id, arg.body);
      await globalMutate(
        KEYS.myOutfits(),
        (prev?: MyOutfitRow[]) =>
          prev?.map((x) => (x.id === arg.id ? { ...x, ...updated } : x)),
        { revalidate: false },
      );
      void revalidatePublicAndTags();
      return updated;
    },
  );
}

export function useApiTogglePublicOutfit() {
  return useSWRMutation(
    "outfit-toggle-public",
    async (
      _key,
      { arg }: { arg: { id: number; isPublic: boolean } },
    ) => {
      await globalMutate(
        KEYS.myOutfits(),
        async () => {
          await updateOutfit(arg.id, { isPublic: arg.isPublic });
          return undefined;
        },
        {
          optimisticData: (prev?: MyOutfitRow[]) =>
            prev?.map((x) =>
              x.id === arg.id ? { ...x, isPublic: arg.isPublic } : x,
            ) ?? [],
          rollbackOnError: true,
          revalidate: true,
        },
      );
      void revalidatePublicAndTags();
    },
  );
}

export function useApiCreateOutfit() {
  return useSWRMutation(
    "outfit-create",
    async (_key, { arg }: { arg: CreateOutfitBody }) => {
      const result = await createOutfit(arg);
      await globalMutate(KEYS.myOutfits());
      void revalidatePublicAndTags();
      return result;
    },
  );
}
