"use client";

import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { tagChipSx } from "@/lib/mui/theme";
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
  Icon: SvgIconComponent;
  iconColor: string;
  label: string;
}

const MEDAL_STYLES: Record<1 | 2 | 3, MedalStyle> = {
  1: { Icon: EmojiEventsIcon, iconColor: "text-amber-500", label: "金牌" },
  2: { Icon: WorkspacePremiumIcon, iconColor: "text-zinc-500", label: "銀牌" },
  3: { Icon: MilitaryTechIcon, iconColor: "text-orange-500", label: "銅牌" },
};

const IMAGE_BG_DEFAULT =
  "bg-gradient-to-br from-sky-50 via-white to-amber-50/40";

const IMAGE_BG_BY_RANK: Record<1 | 2 | 3, string> = {
  1: "bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-50/60",
  2: "bg-gradient-to-br from-slate-200 via-slate-100 to-blue-50/40",
  3: "bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50/60",
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
  const imageBg = isMedal ? IMAGE_BG_BY_RANK[rank] : IMAGE_BG_DEFAULT;

  return (
    <div className="group relative rounded-xl bg-white border border-zinc-200 overflow-hidden hover:shadow-xl hover:shadow-maple-red/15 hover:-translate-y-0.5 transition-all duration-200">
      {isMedal && (() => {
        const medal = MEDAL_STYLES[rank];
        const Icon = medal.Icon;
        return (
          <Icon
            className={`absolute top-2 left-2 z-10 ${medal.iconColor} drop-shadow-md`}
            style={{ fontSize: 32 }}
            aria-label={`${medal.label} - 第 ${rank} 名`}
            titleAccess={`第 ${rank} 名 · ${medal.label}`}
          />
        );
      })()}
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
          <div className="relative flex flex-nowrap gap-1 overflow-hidden">
            {outfit.tags.slice(0, 3).map((t) => (
              <Chip
                key={t}
                label={`#${t}`}
                size="small"
                variant="outlined"
                sx={{ ...tagChipSx, flexShrink: 0 }}
              />
            ))}
            {outfit.tags.length > 3 && (
              <Chip
                label={`+${outfit.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ ...tagChipSx, flexShrink: 0, opacity: 0.6 }}
                title={outfit.tags.slice(3).map((t) => `#${t}`).join(" ")}
              />
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white"
            />
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
