"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { tagChipSx } from "@/lib/mui/theme";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockIcon from "@mui/icons-material/Lock";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import type { OutfitPayload } from "@/db/schema";
import { useSimulator } from "@/store/simulator";
import { outfitFullUrl } from "@/lib/outfit-preview";
import {
  ATTACK_STANCES,
  BASIC_STANCES,
  STAND_STANCES,
} from "@/lib/preview-config";
import { getLikeTooltip, useOutfitLike } from "@/lib/hooks/use-outfit-like";
import SlotBreakdown from "@/components/SlotBreakdown";

const STANCE_MENU_PROPS = {
  slotProps: { paper: { sx: { maxHeight: 420 } } },
} as const;

type ImageStatus = "loading" | "loaded" | "error";

interface OutfitDetailProps {
  outfit: {
    id: number;
    userId: string;
    title: string;
    description: string | null;
    payload: OutfitPayload;
    tags: string[] | null;
    upvotes: number;
    isPublic: boolean;
    createdAt: Date;
    authorName: string | null;
    authorImage: string | null;
  };
  liked: boolean;
  isAuthenticated: boolean;
  isOwnOutfit: boolean;
  itemInfo: Record<number, { name: string; isCash: boolean }>;
}

export default function OutfitDetail({
  outfit,
  liked: initialLiked,
  isAuthenticated,
  isOwnOutfit,
  itemInfo,
}: OutfitDetailProps) {
  const router = useRouter();
  const loadOutfit = useSimulator((s) => s.loadOutfit);
  const [copied, setCopied] = useState(false);
  const { upvotes, liked, pending, toggle: handleLike } = useOutfitLike({
    outfitId: outfit.id,
    initialUpvotes: outfit.upvotes,
    initialLiked,
    isAuthenticated,
    isOwnOutfit,
  });
  const [animated, setAnimated] = useState(false);
  const [stance, setStance] = useState(outfit.payload.stance);

  const previewUrl = outfitFullUrl(outfit.payload, { animated, stance });
  // 偵測 URL 變動,重置 image status 回 loading,讓動作切換時重新跑 spinner
  const [lastPreviewUrl, setLastPreviewUrl] = useState(previewUrl);
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");
  if (previewUrl !== lastPreviewUrl) {
    setLastPreviewUrl(previewUrl);
    setImageStatus("loading");
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleOpen = () => {
    loadOutfit(outfit.payload);
    router.push("/simulator");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <Avatar
          src={outfit.authorImage ?? undefined}
          alt={outfit.authorName ?? "?"}
          sx={{ width: 32, height: 32 }}
        >
          {outfit.authorName?.charAt(0) ?? "?"}
        </Avatar>
        <span>{outfit.authorName ?? "(no name)"}</span>
        {!outfit.isPublic && (
          <Chip
            icon={<LockIcon />}
            label="私密"
            size="small"
            color="default"
            variant="outlined"
          />
        )}
      </div>

      <div className="relative bg-zinc-50 rounded-xl border border-zinc-200 p-6 flex items-center justify-center min-h-[320px]">
        {imageStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <CircularProgress size={48} thickness={4} color="primary" />
          </div>
        )}
        {imageStatus === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 px-4 text-center">
            <ErrorOutlineIcon style={{ fontSize: 48 }} />
            <span className="text-sm font-medium">圖片載入失敗</span>
            <span className="text-xs">該動作可能不支援這套搭配,試試其他動作</span>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={outfit.title}
          className="max-w-full max-h-[480px] object-contain"
          style={{
            imageRendering: "pixelated",
            transform: "scale(2)",
            visibility: imageStatus === "loaded" ? "visible" : "hidden",
          }}
          onLoad={() => setImageStatus("loaded")}
          onError={() => setImageStatus("error")}
        />
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600">動作</span>
          <Select
            size="small"
            value={stance}
            onChange={(e: SelectChangeEvent<string>) => setStance(e.target.value)}
            aria-label="切換動作"
            sx={{ minWidth: 140 }}
            MenuProps={STANCE_MENU_PROPS}
          >
            <ListSubheader>站姿</ListSubheader>
            {STAND_STANCES.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.label}
              </MenuItem>
            ))}
            <ListSubheader>動作</ListSubheader>
            {BASIC_STANCES.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.label}
              </MenuItem>
            ))}
            <ListSubheader>攻擊</ListSubheader>
            {ATTACK_STANCES.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </div>
        <ToggleButtonGroup
          value={animated ? "animated" : "static"}
          exclusive
          size="small"
          onChange={(_, v: "static" | "animated" | null) =>
            v && setAnimated(v === "animated")
          }
          aria-label="圖片 / 動畫"
        >
          <ToggleButton value="static">圖片</ToggleButton>
          <ToggleButton value="animated">動畫</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0 flex-1">
          <h1 className="text-2xl font-bold break-all min-w-0">
            {outfit.title}
          </h1>
          <span className="text-xs text-zinc-400 shrink-0">#{outfit.id}</span>
        </div>
        <button
            type="button"
            onClick={() => void handleLike()}
            disabled={isOwnOutfit || pending}
            title={getLikeTooltip({ isOwnOutfit, isAuthenticated, liked })}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold transition ${
              liked
                ? "bg-maple-red/10 border-maple-red/30 text-maple-red hover:bg-maple-red/15"
                : "bg-white border-zinc-300 text-zinc-700 hover:border-maple-red/40 hover:text-maple-red"
            } ${
              isOwnOutfit
                ? "cursor-not-allowed opacity-60 hover:bg-white hover:border-zinc-300 hover:text-zinc-700"
                : ""
            }`}
          >
            {liked ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
            <span className="tabular-nums">{upvotes}</span>
          </button>
      </div>

      {outfit.description && (
        <p className="text-base leading-relaxed text-zinc-700 whitespace-pre-wrap">
          {outfit.description}
        </p>
      )}

      {outfit.tags && outfit.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {outfit.tags.map((t) => (
            <Chip key={t} label={`#${t}`} size="small" variant="outlined" sx={tagChipSx} />
          ))}
        </div>
      )}

      <SlotBreakdown payload={outfit.payload} itemInfo={itemInfo} />

      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200">
        <Button
          startIcon={<OpenInNewIcon />}
          variant="contained"
          color="primary"
          onClick={handleOpen}
        >
          載入到模擬器
        </Button>
        <IconButton onClick={() => void handleCopy()} title="複製連結">
          <ContentCopyIcon />
        </IconButton>
        {copied && <span className="text-xs text-emerald-600">已複製</span>}
      </div>
    </div>
  );
}
