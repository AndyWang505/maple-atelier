"use client";

import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { getLikeTooltip, useOutfitLike } from "@/lib/use-outfit-like";

interface LikeButtonProps {
  outfitId: number;
  upvotes: number;
  liked: boolean;
  isAuthenticated: boolean;
  isOwnOutfit: boolean;
}

/**
 * 推 / 愛心按鈕(inline 版,/explore 卡片用)。三種「無法生效」狀態:
 * - 未登入:click 跳 info toast「需要登入後才能推」
 * - 自己的搭配:disabled + tooltip
 * - 已經推過:filled red,可再點取消
 */
export default function LikeButton({
  outfitId,
  upvotes: initialUpvotes,
  liked: initialLiked,
  isAuthenticated,
  isOwnOutfit,
}: LikeButtonProps) {
  const { upvotes, liked, pending, toggle } = useOutfitLike({
    outfitId,
    initialUpvotes,
    initialLiked,
    isAuthenticated,
    isOwnOutfit,
  });

  const tooltip = getLikeTooltip({ isOwnOutfit, isAuthenticated, liked });

  return (
    <div
      className={`flex items-center gap-1 text-xs transition-colors ${
        liked ? "text-maple-red" : "text-zinc-500"
      }`}
    >
      <IconButton
        size="small"
        onClick={() => void toggle()}
        disabled={isOwnOutfit || pending}
        aria-label={liked ? "取消推" : "推"}
        title={tooltip}
        sx={{ color: "inherit" }}
      >
        {liked ? (
          <FavoriteIcon fontSize="small" />
        ) : (
          <FavoriteBorderIcon fontSize="small" />
        )}
      </IconButton>
      <span>{upvotes}</span>
    </div>
  );
}
