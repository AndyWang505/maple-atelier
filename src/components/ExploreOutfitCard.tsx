"use client";

import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import type { SvgIconComponent } from "@mui/icons-material";
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
}

interface MedalStyle {
  bg: string;
  ring: string;
  Icon: SvgIconComponent;
  label: string;
}

const MEDAL_STYLES: Record<1 | 2 | 3, MedalStyle> = {
  1: {
    bg: "bg-gradient-to-br from-amber-300 to-amber-500",
    ring: "ring-amber-300/50",
    Icon: EmojiEventsIcon,
    label: "金牌",
  },
  2: {
    bg: "bg-gradient-to-br from-zinc-300 to-zinc-400",
    ring: "ring-zinc-300/50",
    Icon: WorkspacePremiumIcon,
    label: "銀牌",
  },
  3: {
    bg: "bg-gradient-to-br from-orange-400 to-orange-600",
    ring: "ring-orange-400/50",
    Icon: MilitaryTechIcon,
    label: "銅牌",
  },
};

/**
 * /explore 專用卡片 — 1:1 square 圖區 + 獨立資訊區。視覺與首頁的 ShowcaseOutfitCard 區隔:
 * 一個是「精選展示」(全圖 + 漂浮文字)、這個是「社群瀏覽」(白底卡 + 互動按鈕)。
 */
export default function ExploreOutfitCard({
  outfit,
  currentUserId,
  rank,
}: ExploreOutfitCardProps) {
  const isMine = currentUserId === outfit.userId;
  const detailHref = `/outfit/${outfit.id}`;
  const authorName = outfit.authorName ?? "(no name)";
  const isMedal = rank === 1 || rank === 2 || rank === 3;

  return (
    <div className="group relative rounded-xl bg-white border border-zinc-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {isMedal && (() => {
        const medal = MEDAL_STYLES[rank];
        const Icon = medal.Icon;
        return (
          <div
            className={`absolute top-2 left-2 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full ${medal.bg} ring-4 ${medal.ring} text-white shadow-md`}
            aria-label={`${medal.label} - 第 ${rank} 名`}
            title={`第 ${rank} 名 · ${medal.label}`}
          >
            <Icon style={{ fontSize: 20 }} />
          </div>
        );
      })()}
      <Link
        href={detailHref}
        className="block relative aspect-square overflow-hidden"
        aria-label={`查看 ${outfit.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={outfitThumbnailUrl(outfit.payload)}
          alt={outfit.title}
          className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          style={{ imageRendering: "pixelated" }}
          loading="lazy"
        />
      </Link>

      <div className="p-3 space-y-2">
        <Link
          href={detailHref}
          className="block min-w-0 no-underline text-current hover:opacity-80 transition"
        >
          <h3
            className="mt-0 mb-2 text-sm font-semibold truncate text-zinc-900 leading-snug"
            title={outfit.title}
          >
            {outfit.title}
          </h3>
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar
              src={outfit.authorImage ?? undefined}
              alt={authorName}
              sx={{ width: 18, height: 18, fontSize: 10, flexShrink: 0 }}
            >
              {authorName.charAt(0)}
            </Avatar>
            <span className="text-xs text-zinc-500 truncate">
              {authorName}
            </span>
          </div>
        </Link>

        {outfit.tags && outfit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {outfit.tags.slice(0, 3).map((t) => (
              <Chip
                key={t}
                label={`#${t}`}
                size="small"
                variant="outlined"
              />
            ))}
            {outfit.tags.length > 3 && (
              <Chip
                label={`+${outfit.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ opacity: 0.6 }}
                title={outfit.tags.slice(3).map((t) => `#${t}`).join(" ")}
              />
            )}
          </div>
        )}

        <div className="-ml-1 pt-1 border-t border-zinc-100">
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
