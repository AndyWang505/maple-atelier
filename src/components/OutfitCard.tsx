"use client";

import type { ReactNode } from "react";
import Chip from "@mui/material/Chip";
import type { OutfitPayload } from "@/db/schema";
import { outfitFullUrl } from "@/lib/outfit-preview";

export interface OutfitCardData {
  id: number;
  title: string;
  payload: OutfitPayload;
  tags: string[] | null;
  upvotes: number;
  authorName?: string | null;
  authorImage?: string | null;
}

interface OutfitCardProps {
  outfit: OutfitCardData;
  /** 卡片右下動作區(/me 放 toggle/load/delete) */
  actions?: ReactNode;
  /** 整張卡片可點(導詳情頁);未提供則不可點 */
  onClick?: () => void;
}

/**
 * /me 用的搭配卡:縮圖 + 標題 + tags + 動作區。
 * /explore 與首頁有自己的 ExploreOutfitCard / ShowcaseOutfitCard。
 */
export default function OutfitCard({
  outfit,
  actions,
  onClick,
}: OutfitCardProps) {
  const ImageBox = (
    <div className="relative bg-zinc-50 rounded-lg h-56 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 flex justify-center h-[92%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={outfitFullUrl(outfit.payload)}
          alt={outfit.title}
          className="h-full w-auto max-w-none object-contain"
          style={{ imageRendering: "pixelated" }}
          loading="lazy"
        />
      </div>
    </div>
  );

  return (
    <div className="rounded-xl bg-white border border-zinc-200 p-3 flex flex-col gap-2">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="block text-left focus:outline-none focus:ring-2 focus:ring-maple-red rounded-lg"
          aria-label={`查看 ${outfit.title}`}
        >
          {ImageBox}
        </button>
      ) : (
        ImageBox
      )}

      <div className="flex items-center justify-between -my-1">
        <h3
          className="text-sm font-semibold truncate flex-1"
          title={outfit.title}
        >
          {outfit.title}
        </h3>
        <span className="text-xs text-zinc-400 ml-2">#{outfit.id}</span>
      </div>

      {outfit.tags && outfit.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {outfit.tags.map((t) => (
            <Chip key={t} label={`#${t}`} size="small" variant="outlined" />
          ))}
        </div>
      )}

      {actions}
    </div>
  );
}
