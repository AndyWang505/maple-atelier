"use client";

import { useMemo, useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import IconButton from "@mui/material/IconButton";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import { useSimulator } from "@/store/simulator";
import type { Gender } from "@/types/maplestory";
import {
  earFlagsForId,
  getCharacterRenderUrl,
  isSyntheticSlot,
} from "@/lib/maplestory";
import {
  ATTACK_STANCES,
  BASIC_STANCES,
  BG_OPTIONS,
  DARK_SELECT_SX,
  DARK_TOGGLE_SX,
  STAND_STANCES,
  ZOOM_LEVELS,
  getCardBgClass,
} from "@/lib/preview-config";

type ImageStatus = "loading" | "loaded" | "error";

const STANCE_MENU_PROPS = {
  slotProps: { paper: { sx: { maxHeight: 420 } } },
} as const;

interface PreviewImageProps {
  url: string;
  scale: number;
  isDarkBg: boolean;
}

function PreviewImage({ url, scale, isDarkBg }: PreviewImageProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");
  return (
    <div className="relative w-48 h-48 flex items-end justify-center">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <CircularProgress size={36} thickness={4} color="primary" />
        </div>
      )}
      {status === "error" && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs ${
            isDarkBg ? "text-white/70" : "text-zinc-500"
          }`}
        >
          <span className="text-2xl">⚠️</span>
          <span>圖片載入失敗</span>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="角色預覽"
        className="max-w-full max-h-full object-contain"
        style={{
          imageRendering: "pixelated",
          transform: `scale(${scale})`,
          // 從腳往上縮放;角色腳永遠站在同一條線上,換裝 / 換 stance / zoom 都不會「亂跑」
          transformOrigin: "bottom center",
          transition: "transform 0.15s ease-out",
          visibility: status === "loaded" ? "visible" : "hidden",
        }}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}

export default function CharacterPreview() {
  const equipped = useSimulator((s) => s.equipped);
  const gender = useSimulator((s) => s.gender);
  const setGender = useSimulator((s) => s.setGender);
  // stance / animated 收進 store,讓「重置」能一併還原成預設
  const stanceId = useSimulator((s) => s.stanceId);
  const setStanceId = useSimulator((s) => s.setStanceId);
  const animated = useSimulator((s) => s.animated);
  const setAnimated = useSimulator((s) => s.setAnimated);
  const [zoomIdx, setZoomIdx] = useState(0);
  const scale = ZOOM_LEVELS[zoomIdx];
  const [bgIdx, setBgIdx] = useState(0);
  const bg = BG_OPTIONS[bgIdx];
  const isDarkBg = bg.id === "dark";

  const url = useMemo(() => {
    const skinItem = equipped.skin;
    const items = Object.values(equipped).flatMap((item) =>
      item && !isSyntheticSlot(item.slot)
        ? [{ itemId: item.id, region: item.region, version: item.version }]
        : [],
    );
    return getCharacterRenderUrl(items, {
      skin: skinItem?.id,
      skinRegion: skinItem?.region,
      skinVersion: skinItem?.version,
      stance: stanceId,
      frame: animated ? "animated" : 0,
      ...earFlagsForId(equipped.ear?.id),
    });
  }, [equipped, stanceId, animated]);

  const handleDownload = () => {
    const filename = `maple-atelier-${stanceId}.${animated ? "gif" : "png"}`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = filename;
    a.click();
  };

  const handleCopyUrl = () => {
    void navigator.clipboard.writeText(url).catch(() => {});
  };

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Maple Atelier", url });
        return;
      } catch {
        // 使用者取消或不支援 → fallback 走 copy
      }
    }
    handleCopyUrl();
  };

  return (
    <div
      className={`relative overflow-hidden isolate flex flex-col gap-4 w-full h-full min-h-[320px] rounded-2xl border border-white/80 backdrop-blur-md shadow-sm shadow-sky-200/40 p-4 transition-colors ${getCardBgClass(bg.id)}`}
    >
      <div className="relative z-20 flex items-center justify-between gap-2 flex-wrap">
        <ToggleButtonGroup
          value={gender}
          exclusive
          size="small"
          onChange={(_, v: Gender | null) => v && setGender(v)}
          aria-label="性別"
          sx={isDarkBg ? { "& .MuiToggleButton-root": DARK_TOGGLE_SX } : undefined}
        >
          <ToggleButton value="male" aria-label="男">
            <MaleIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="female" aria-label="女">
            <FemaleIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <div className="flex items-center gap-2">
          <ToggleButton
            value="bg"
            selected={bg.id !== "none"}
            size="small"
            onClick={() => setBgIdx((i) => (i + 1) % BG_OPTIONS.length)}
            aria-label="切換背景"
            sx={{ gap: 0.5, px: 1.25, ...(isDarkBg ? DARK_TOGGLE_SX : {}) }}
          >
            <WallpaperIcon fontSize="small" />
            {bg.label}
          </ToggleButton>

          <ToggleButton
            value="zoom"
            selected={scale !== 1}
            size="small"
            onClick={() => setZoomIdx((i) => (i + 1) % ZOOM_LEVELS.length)}
            aria-label="切換縮放"
            sx={{ gap: 0.5, px: 1.25, ...(isDarkBg ? DARK_TOGGLE_SX : {}) }}
          >
            <ZoomInIcon fontSize="small" />
            {scale}x
          </ToggleButton>
        </div>
      </div>

      <div className="relative z-0 flex-1 flex items-end justify-center pb-6">
        <PreviewImage key={url} url={url} scale={scale} isDarkBg={isDarkBg} />
      </div>

      <div className="relative z-20 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs ${isDarkBg ? "text-white/85" : "text-zinc-500"}`}
          >
            動作
          </span>
          <Select
            size="small"
            value={stanceId}
            onChange={(e: SelectChangeEvent<string>) =>
              setStanceId(e.target.value)
            }
            aria-label="切換動作"
            sx={{ minWidth: 140, ...(isDarkBg ? DARK_SELECT_SX : {}) }}
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

          <ToggleButtonGroup
            value={animated ? "animated" : "static"}
            exclusive
            size="small"
            onChange={(_, v: "static" | "animated" | null) =>
              v && setAnimated(v === "animated")
            }
            aria-label="圖片 / 動畫"
            sx={isDarkBg ? { "& .MuiToggleButton-root": DARK_TOGGLE_SX } : undefined}
          >
            <ToggleButton value="static">圖片</ToggleButton>
            <ToggleButton value="animated">動畫</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            size="small"
            onClick={handleDownload}
            aria-label="下載"
            title="下載"
            sx={isDarkBg ? { color: "rgba(255,255,255,0.85)" } : undefined}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleCopyUrl}
            aria-label="複製連結"
            title="複製連結"
            sx={isDarkBg ? { color: "rgba(255,255,255,0.85)" } : undefined}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleShare}
            aria-label="分享"
            title="分享"
            sx={isDarkBg ? { color: "rgba(255,255,255,0.85)" } : undefined}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
