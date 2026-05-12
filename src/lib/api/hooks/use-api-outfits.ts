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
import { isPublicOutfitsKey, isTagsKey, KEYS } from "@/lib/api/keys";
import type {
  CreateOutfitBody,
  MyOutfitRow,
  PublicOutfitsQuery,
  PublicOutfitsResponse,
  UpdateOutfitBody,
} from "@/lib/api/types";

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
 * 刻意不 globalMutate publicOutfits — 重抓會讓 server 依 upvotes 重排,卡片位置會跳。
 * 樂觀 UI 已在 useOutfitLike 處理,下次 mount / focus 自然 revalidate 即可。
 */
export function useApiVoteOutfit(outfitId: number) {
  return useSWRMutation(
    ["outfit-vote", outfitId] as const,
    (_key, { arg }: { arg: { liked: boolean } }) => voteOutfit(outfitId, arg.liked),
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
