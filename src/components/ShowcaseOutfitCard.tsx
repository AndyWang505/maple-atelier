import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import type { OutfitCardData } from "@/components/OutfitCard";
import { outfitThumbnailUrl } from "@/lib/outfit-preview";

interface ShowcaseOutfitCardProps {
  outfit: OutfitCardData;
  /** 首屏第一張卡用 high priority + eager,讓 LCP 別等其他資源 */
  priority?: boolean;
}

/**
 * 角色為主的展示卡 — 3:4 portrait,角色全版背景、底部漸層覆蓋顯示資訊。
 * 用於首頁 carousel / 將來的「精選」區塊。整張 Link 包外。
 */
export default function ShowcaseOutfitCard({
  outfit,
  priority = false,
}: ShowcaseOutfitCardProps) {
  return (
    <Link
      href={`/outfit/${outfit.id}`}
      className="group relative block aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 shadow-sm ring-1 ring-zinc-200/70 hover:shadow-md transition-shadow"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={outfitThumbnailUrl(outfit.payload)}
        alt={outfit.title}
        className="absolute inset-0 w-full h-full object-contain group-hover:scale-115 transition-transform duration-300 ease-out"
        style={{
          imageRendering: "pixelated",
          // 角色貼齊卡片上緣,腳剛好落在底部 overlay 起點;免掉中間置中產生的上下空白
          objectPosition: "center top",
        }}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3 text-white pointer-events-none">
        <h3
          className="text-base font-semibold truncate leading-tight"
          title={outfit.title}
        >
          {outfit.title}
        </h3>
        {outfit.tags && outfit.tags.length > 0 && (
          <p className="text-xs text-white/70 truncate leading-tight">
            {outfit.tags.map((t) => `#${t}`).join(" ")}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between text-sm leading-tight">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={outfit.authorImage ?? undefined}
              alt={outfit.authorName ?? "?"}
              sx={{ width: 22, height: 22, fontSize: 12 }}
            >
              {outfit.authorName?.charAt(0) ?? "?"}
            </Avatar>
            <span className="truncate text-white/90">
              {outfit.authorName ?? "(no name)"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-white/85 shrink-0">
            <FavoriteIcon fontSize="small" />
            {outfit.upvotes}
          </div>
        </div>
      </div>
    </Link>
  );
}
