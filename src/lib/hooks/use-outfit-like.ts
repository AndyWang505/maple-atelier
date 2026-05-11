"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useApiVoteOutfit } from "@/lib/api/hooks/use-api-outfits";

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

// Optimistic toggle with rollback; per-button local state.
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

  const toggle = async () => {
    if (!isAuthenticated) {
      toast.info("需要登入後才能推");
      return;
    }
    if (isOwnOutfit || isMutating) return;
    const next = !liked;
    const prev = { upvotes, liked };
    setUpvotes(upvotes + (next ? 1 : -1));
    setLiked(next);
    try {
      const data = await trigger({ liked: next });
      if (data) {
        setUpvotes(data.upvotes);
        setLiked(data.liked);
      }
    } catch {
      setUpvotes(prev.upvotes);
      setLiked(prev.liked);
    }
  };

  return { upvotes, liked, pending: isMutating, toggle };
}
