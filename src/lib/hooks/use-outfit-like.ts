"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mutate as globalMutate } from "swr";
import { useToast } from "@/components/ToastProvider";
import { useApiVoteOutfit } from "@/lib/api/hooks/use-api-outfits";
import { ApiError, getApiErrorMessage } from "@/lib/api/fetcher";
import { isPublicOutfitsKey } from "@/lib/api/keys";
import type { PublicOutfitsResponse } from "@/lib/api/types";

const DEBOUNCE_MS = 500;

function getLikeFailureMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return "登入狀態已過期，請重新登入再推";
    if (e.status === 403) return "不能推自己的搭配";
    if (e.status === 404) return "這個搭配已被作者下架";
    if (e.status === 429) return "操作太頻繁，請稍候再試";
    const msg = getApiErrorMessage(e);
    if (msg) return msg;
  }
  return "推送失敗，請稍後再試";
}

function patchPublicOutfitsCache(
  outfitId: number,
  liked: boolean,
  upvotes: number,
) {
  void globalMutate(
    isPublicOutfitsKey,
    (current?: PublicOutfitsResponse) =>
      current && {
        ...current,
        rows: current.rows.map((r) =>
          r.id === outfitId ? { ...r, liked, upvotes } : r,
        ),
      },
    { revalidate: false },
  );
}

export interface UseOutfitLikeOptions {
  outfitId: number;
  initialUpvotes: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
  isOwnOutfit: boolean;
}

export interface OutfitLike {
  upvotes: number;
  liked: boolean;
  pending: boolean;
  toggle: () => Promise<void>;
}

export function getLikeTooltip(opts: {
  isOwnOutfit: boolean;
  isAuthenticated: boolean;
  liked: boolean;
}): string {
  if (opts.isOwnOutfit) return "不能推自己的搭配";
  if (!opts.isAuthenticated) return "需要登入";
  return opts.liked ? "取消推" : "推";
}

/** 樂觀 UI + 500ms debounce 收斂 spam toggle;pagehide / unmount 用 keepalive 兜底。 */
export function useOutfitLike({
  outfitId,
  initialUpvotes,
  initialLiked,
  isAuthenticated,
  isOwnOutfit,
}: UseOutfitLikeOptions): OutfitLike {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [liked, setLiked] = useState(initialLiked);
  const toast = useToast();
  const { trigger, isMutating } = useApiVoteOutfit(outfitId);

  const lastSentLikedRef = useRef(initialLiked);
  const lastSentUpvotesRef = useRef(initialUpvotes);
  const pendingTargetRef = useRef<boolean | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    debounceTimerRef.current = null;
    const target = pendingTargetRef.current;
    if (target === null || target === lastSentLikedRef.current) {
      pendingTargetRef.current = null;
      return;
    }
    pendingTargetRef.current = null;
    try {
      const data = await trigger({ liked: target });
      if (data) {
        lastSentLikedRef.current = data.liked;
        lastSentUpvotesRef.current = data.upvotes;
        // 若 in-flight 中又被 toggle,不要把 server 回應蓋掉使用者最新意圖
        if (pendingTargetRef.current === null) {
          setLiked(data.liked);
          setUpvotes(data.upvotes);
        }
      }
    } catch (e) {
      setLiked(lastSentLikedRef.current);
      setUpvotes(lastSentUpvotesRef.current);
      patchPublicOutfitsCache(outfitId, lastSentLikedRef.current, lastSentUpvotesRef.current);
      toast.error(getLikeFailureMessage(e));
    }
  }, [trigger, toast, outfitId]);

  // fetch keepalive 比 sendBeacon 容易帶 JSON content-type;瀏覽器保證在 page unload 後仍送出
  useEffect(() => {
    const flushBeacon = () => {
      const target = pendingTargetRef.current;
      if (target === null || target === lastSentLikedRef.current) return;
      pendingTargetRef.current = null;
      void fetch(`/api/outfits/${outfitId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: target }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("pagehide", flushBeacon);
    return () => {
      window.removeEventListener("pagehide", flushBeacon);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      flushBeacon();
    };
  }, [outfitId]);

  const toggle = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info("需要登入後才能推");
      return;
    }
    if (isOwnOutfit) {
      toast.info("不能推自己的搭配");
      return;
    }
    const next = !liked;
    const nextUpvotes = upvotes + (next ? 1 : -1);
    setLiked(next);
    setUpvotes(nextUpvotes);
    pendingTargetRef.current = next;
    // Optimistic cache patch on click — ensures back-nav reflects the latest state
    // even when the user navigates before the debounce fires (flushBeacon path bypasses trigger)
    patchPublicOutfitsCache(outfitId, next, nextUpvotes);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // toggle 後回到 server 已知 state → 沒必要送 API,把 pending 清掉
    if (next === lastSentLikedRef.current) {
      pendingTargetRef.current = null;
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      void flush();
    }, DEBOUNCE_MS);
  }, [liked, upvotes, isAuthenticated, isOwnOutfit, toast, flush, outfitId]);

  return { upvotes, liked, pending: isMutating, toggle };
}
