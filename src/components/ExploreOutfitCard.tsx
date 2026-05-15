"use client";

import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { tagChipSx } from "@/lib/mui/theme";
import type { OutfitPayload } from "@/db/schema";
import { outfitThumbnailUrl } from "@/lib/outfit-preview";
import LikeButton from "./LikeButton";

interface ExploreOutfitCardProps {
  outfit: {
    id: number;
    userId: string;
    title: string;
    payload: OutfitPayload;
    tags: string[] | null;
    upvotes: number;
    authorName: string | null;
    authorImage: string | null;
    liked: boolean;
  };
  currentUserId: string | null;
  /** 1-based 排名,1-3 會顯示金/銀/銅獎牌,其他不顯示 */
  rank?: number;
  /** 縮小字體與間距,用於空間受限的容器(如 mobile podium) */
  compact?: boolean;
}

const MEDAL_STYLES: Record<1 | 2 | 3, { src: string; label: string }> = {
  1: { src: "/medal-1.png", label: "金牌" },
  2: { src: "/medal-2.png", label: "銀牌" },
  3: { src: "/medal-3.png", label: "銅牌" },
};

const RANK_GLOW: Record<1 | 2 | 3, string> = {
  1: "0 0 18px 5px rgba(245,197,24,0.45)",
  2: "0 0 16px 4px rgba(162,172,184,0.45)",
  3: "0 0 16px 4px rgba(185,112,73,0.45)",
};

const IMAGE_BG_DEFAULT =
  "bg-gradient-to-br from-sky-50 via-white to-amber-50/40";

const IMAGE_BG_BY_RANK: Record<1 | 2 | 3, string> = {
  1: "bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-50/60",
  2: "bg-gradient-to-br from-slate-200 via-slate-100 to-blue-50/40",
  3: "bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50/60",
};

function cardBorderClass(rank?: number): string {
  if (rank === 1) return "border-2 border-[#F5C518]";
  if (rank === 2) return "border-2 border-[#A2ACB8]";
  if (rank === 3) return "border-2 border-[#B97049]";
  if (rank !== undefined && rank <= 8) return "border-2 border-[#F3A378]";
  return "border border-zinc-300";
}

/**
 * /explore 專用卡片 — 1:1 square 圖區 + 獨立資訊區。視覺與首頁的 ShowcaseOutfitCard 區隔:
 * 一個是「精選展示」(全圖 + 漂浮文字)、這個是「社群瀏覽」(白底卡 + 互動按鈕)。
 */
export default function ExploreOutfitCard({
  outfit,
  currentUserId,
  rank,
  compact = false,
}: ExploreOutfitCardProps) {
  const isMine = currentUserId === outfit.userId;
  const detailHref = `/outfit/${outfit.id}`;
  const authorName = outfit.authorName ?? "(no name)";
  const isMedal = rank === 1 || rank === 2 || rank === 3;
  const imageBg = isMedal ? IMAGE_BG_BY_RANK[rank] : IMAGE_BG_DEFAULT;
  const borderClass = cardBorderClass(rank);
  const maxTags = compact ? 2 : 3;

  return (
    <div
      className={`group relative rounded-xl bg-white ${borderClass} overflow-hidden hover:-translate-y-0.5 transition-all duration-200 ${isMedal ? "" : "hover:shadow-xl hover:shadow-maple-red/15"}`}
      style={isMedal ? { boxShadow: RANK_GLOW[rank] } : undefined}
    >
      {isMedal && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={MEDAL_STYLES[rank].src}
          alt={`第 ${rank} 名 · ${MEDAL_STYLES[rank].label}`}
          className="absolute top-2 left-2 z-10 drop-shadow-md"
          style={{ width: compact ? 22 : 32, height: compact ? 22 : 32 }}
        />
      )}
      <Link
        href={detailHref}
        className={`block relative aspect-square overflow-hidden ${imageBg}`}
        aria-label={`查看 ${outfit.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={outfitThumbnailUrl(outfit.payload)}
          alt={outfit.title}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ imageRendering: "pixelated" }}
          loading="lazy"
        />
      </Link>

      <div className={compact ? "p-1.5 space-y-0.5" : "p-2 space-y-1"}>
        <Link
          href={detailHref}
          className="block min-w-0 no-underline text-current hover:opacity-80 transition"
        >
          <h3
            className={`mt-0 mb-0.5 font-semibold truncate text-zinc-900 leading-snug ${compact ? "text-xs" : "text-sm"}`}
            title={outfit.title}
          >
            {outfit.title}
          </h3>
          <div className="flex items-center gap-1 min-w-0">
            <Avatar
              src={outfit.authorImage ?? undefined}
              alt={authorName}
              sx={compact
                ? { width: 12, height: 12, fontSize: 7, flexShrink: 0 }
                : { width: 16, height: 16, fontSize: 9, flexShrink: 0 }}
            >
              {authorName.charAt(0)}
            </Avatar>
            <span className={`text-zinc-500 truncate ${compact ? "text-[10px]" : "text-xs"}`}>
              {authorName}
            </span>
          </div>
        </Link>

        {outfit.tags && outfit.tags.length > 0 && (
          <div className="relative flex flex-nowrap gap-1 overflow-hidden">
            {outfit.tags.slice(0, maxTags).map((t) => (
              <Chip
                key={t}
                label={`#${t}`}
                size="small"
                variant="outlined"
                sx={{ ...tagChipSx, flexShrink: 0, height: compact ? 16 : 20 }}
              />
            ))}
            {outfit.tags.length > maxTags && (
              <Chip
                label={`+${outfit.tags.length - maxTags}`}
                size="small"
                variant="outlined"
                sx={{ ...tagChipSx, flexShrink: 0, opacity: 0.6, height: compact ? 16 : 20 }}
                title={outfit.tags.slice(maxTags).map((t) => `#${t}`).join(" ")}
              />
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white"
            />
          </div>
        )}

        <div className="-ml-1">
          <LikeButton
            outfitId={outfit.id}
            upvotes={outfit.upvotes}
            liked={outfit.liked}
            isAuthenticated={!!currentUserId}
            isOwnOutfit={isMine}
          />
        </div>
      </div>
    </div>
  );
}
