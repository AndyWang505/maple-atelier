"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { useSimulator } from "@/store/simulator";
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

const CANVAS_W = 192;
const CANVAS_H = 192;

const STANCE_MENU_PROPS = {
  slotProps: { paper: { sx: { maxHeight: 420 } } },
} as const;

interface PreviewImageProps {
  url: string;
  scale: number;
  isDarkBg: boolean;
  animated: boolean;
}

function PreviewImage({ url, scale, isDarkBg, animated }: PreviewImageProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      Math.round((canvas.width - img.naturalWidth) / 2),
      Math.round((canvas.height - img.naturalHeight) / 2),
    );
  }, []);

  // canvas buffer 跟著 CSS 顯示尺寸同步,避免 CSS 拉伸造成模糊;resize 時重繪
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        redraw();
      }
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  // 靜態模式:用 canvas 置中繪製,避免 object-contain 的 aspect ratio 縮放讓角色跳位。
  // 動畫 GIF 無法逐幀 decode,保留 <img> 原有行為。
  useEffect(() => {
    if (animated) return;
    imgRef.current = null;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      redraw();
      setStatus("loaded");
    };
    img.onerror = () => setStatus("error");
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url, animated, redraw]);

  const previewSx: CSSProperties = {
    imageRendering: "pixelated",
    transform: `scale(${scale})`,
    transformOrigin: "center",
    transition: "transform 0.15s ease-out",
    visibility: status === "loaded" ? "visible" : "hidden",
  };

  return (
    <div className="absolute inset-0">
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
      {animated ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="角色預覽"
          className="w-full h-full object-contain"
          style={previewSx}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          aria-label="角色預覽"
          style={{ ...previewSx, width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

export default function CharacterPreview() {
  const equipped = useSimulator((s) => s.equipped);
  // stance / animated / expression 收進 store,讓「重置」能一併還原成預設
  const stanceId = useSimulator((s) => s.stanceId);
  const setStanceId = useSimulator((s) => s.setStanceId);
  const animated = useSimulator((s) => s.animated);
  const setAnimated = useSimulator((s) => s.setAnimated);
  const expression = useSimulator((s) => s.expression);
  const [zoomIdx, setZoomIdx] = useState(0);
  const scale = ZOOM_LEVELS[zoomIdx];
  const [bgIdx, setBgIdx] = useState(0);
  const bg = BG_OPTIONS[bgIdx];
  const isDarkBg = bg.id === "dark";
  const [flipped, setFlipped] = useState(false);

  const url = useMemo(() => {
    const skinItem = equipped.skin;
    const items = Object.values(equipped).flatMap((item) => {
      if (!item || isSyntheticSlot(item.slot)) return [];
      return [{
        itemId: item.id,
        region: item.region,
        version: item.version,
        ...(item.slot === "face" ? { animationName: expression } : {}),
      }];
    });
    return getCharacterRenderUrl(items, {
      skin: skinItem?.id,
      skinRegion: skinItem?.region,
      skinVersion: skinItem?.version,
      stance: stanceId,
      frame: animated ? "animated" : 0,
      flipX: flipped,
      ...earFlagsForId(equipped.ear?.id),
    });
  }, [equipped, stanceId, animated, flipped, expression]);

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
          value={flipped ? "reverse" : "forward"}
          exclusive
          size="small"
          onChange={(_, v: "forward" | "reverse" | null) =>
            v && setFlipped(v === "reverse")
          }
          aria-label="方向"
          sx={isDarkBg ? { "& .MuiToggleButton-root": DARK_TOGGLE_SX } : undefined}
        >
          <ToggleButton value="forward">正向</ToggleButton>
          <ToggleButton value="reverse">反向</ToggleButton>
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

      <div className="relative z-0 flex-1 min-h-[280px]">
        <PreviewImage key={url} url={url} scale={scale} isDarkBg={isDarkBg} animated={animated} />
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
