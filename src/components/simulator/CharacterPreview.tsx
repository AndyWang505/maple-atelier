"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
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
  type BgId,
  DARK_SELECT_SX,
  DARK_TOGGLE_SX,
  SIMULATOR_BG_IMAGE,
  STAND_STANCES,
  ZOOM_LEVELS,
  getCardBgClass,
} from "@/lib/preview-config";

type ImageStatus = "loading" | "loaded" | "error";

const PILL_BTN_SX = {
  px: 1.75,
  py: 0.5,
  fontSize: "0.78rem",
  fontWeight: 600,
  lineHeight: 1.4,
  color: "#71717a",
  "&.Mui-selected": {
    bgcolor: "#F59E0B",
    color: "#fff",
    "&:hover": { bgcolor: "#D97706" },
  },
  "&:hover:not(.Mui-selected)": { bgcolor: "transparent" },
} as const;

const PILL_GROUP_SX = (dark: boolean) => ({
  bgcolor: dark ? "rgba(255,255,255,0.12)" : "#f3f4f6",
  borderRadius: "999px",
  p: 0.5,
  "& .MuiToggleButtonGroup-grouped": {
    border: "none !important",
    borderRadius: "999px !important",
  },
});

const BG_SELECT_SX = {
  position: "relative",
  zIndex: 1,
  bgcolor: "rgba(255,255,255,0.88)",
  borderRadius: 999,
  boxShadow: "0 1px 6px rgba(0,0,0,0.18)",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
  "& .MuiSelect-select": { py: 0.75, px: 2, fontWeight: 600, fontSize: "0.875rem" },
} as const;

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

  const commonSx: CSSProperties = {
    imageRendering: "pixelated",
    transformOrigin: "center",
    transition: "transform 0.15s ease-out",
    visibility: status === "loaded" ? "visible" : "hidden",
  };

  // 動畫 GIF 無法用 canvas 繪製 — 改成絕對置中,保持原始像素尺寸,和 canvas 的行為對齊
  const animatedSx: CSSProperties = {
    ...commonSx,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) scale(${scale})`,
  };

  const canvasSx: CSSProperties = {
    ...commonSx,
    transform: `scale(${scale})`,
    width: "100%",
    height: "100%",
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
          style={animatedSx}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          aria-label="角色預覽"
          style={canvasSx}
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
  const randomize = useSimulator((s) => s.randomize);
  const reset = useSimulator((s) => s.reset);
  const [zoomIdx, setZoomIdx] = useState(0);
  const scale = ZOOM_LEVELS[zoomIdx];
  const [bgId, setBgId] = useState<BgId>("none");
  const bg = BG_OPTIONS.find((o) => o.id === bgId)!;
  const isDarkBg = bg.id === "dark";
  const pillGroupSx = useMemo(() => PILL_GROUP_SX(isDarkBg), [isDarkBg]);
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
    <>
    <div
      className={`relative overflow-hidden isolate flex flex-col gap-4 w-full h-full min-h-[320px] rounded-2xl shadow-sm p-4 transition-colors ${getCardBgClass(bg.id)}`}
    >
      <div className="relative z-20 flex items-center justify-between gap-2 flex-wrap">
        <ToggleButtonGroup
          value={flipped ? "reverse" : "forward"}
          exclusive
          size="small"
          onChange={(_, v: "forward" | "reverse" | null) => v && setFlipped(v === "reverse")}
          aria-label="方向"
          sx={pillGroupSx}
        >
          <ToggleButton value="forward" sx={PILL_BTN_SX}>正向</ToggleButton>
          <ToggleButton value="reverse" sx={PILL_BTN_SX}>反向</ToggleButton>
        </ToggleButtonGroup>

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

      <div className="relative z-0 flex-1 min-h-[280px]">
        <PreviewImage key={url} url={url} scale={scale} isDarkBg={isDarkBg} animated={animated} />
      </div>

      <div className="relative z-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isDarkBg ? "text-white/85" : "text-zinc-500"}`}>
            動作
          </span>
          <Select
            size="small"
            value={stanceId}
            onChange={(e: SelectChangeEvent<string>) => setStanceId(e.target.value)}
            aria-label="切換動作"
            sx={{ minWidth: 140, ...(isDarkBg ? DARK_SELECT_SX : {}) }}
            MenuProps={STANCE_MENU_PROPS}
          >
            <ListSubheader>站姿</ListSubheader>
            {STAND_STANCES.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
            ))}
            <ListSubheader>動作</ListSubheader>
            {BASIC_STANCES.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
            ))}
            <ListSubheader>攻擊</ListSubheader>
            {ATTACK_STANCES.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
            ))}
          </Select>
        </div>
        <ToggleButtonGroup
          value={animated ? "animated" : "static"}
          exclusive
          size="small"
          onChange={(_, v: "static" | "animated" | null) => v && setAnimated(v === "animated")}
          aria-label="圖片 / 動畫"
          sx={pillGroupSx}
        >
          <ToggleButton value="static" sx={PILL_BTN_SX}>圖片</ToggleButton>
          <ToggleButton value="animated" sx={PILL_BTN_SX}>動畫</ToggleButton>
        </ToggleButtonGroup>
      </div>

    </div>

    <div
      className="rounded-2xl shadow-sm overflow-hidden relative flex items-center justify-center"
      style={{ minHeight: 80, border: "4px solid rgba(255,255,255,0.8)" }}
    >
      {/* scale 撐開避免模糊後的邊緣白邊 */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url('${SIMULATOR_BG_IMAGE}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px)",
          transform: "scale(1.04)",
        }}
      />
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.55)" }}
      />
      <Select
        value={bg.id}
        onChange={(e: SelectChangeEvent<string>) => setBgId(e.target.value as BgId)}
        size="small"
        sx={BG_SELECT_SX}
      >
        {BG_OPTIONS.map(({ id, label }) => (
          <MenuItem key={id} value={id}>{label}</MenuItem>
        ))}
      </Select>
    </div>

    <div className="rounded-2xl bg-white shadow-sm flex items-center py-1 px-2">
      {([
        { icon: <ShuffleIcon fontSize="small" />, label: "隨機", onClick: randomize },
        { icon: <RestartAltIcon fontSize="small" />, label: "重置", onClick: reset },
        null,
        { icon: <DownloadIcon fontSize="small" />, label: "下載", onClick: handleDownload },
        { icon: <ContentCopyIcon fontSize="small" />, label: "複製", onClick: handleCopyUrl },
        { icon: <ShareIcon fontSize="small" />, label: "分享", onClick: () => void handleShare() },
      ] as const).map((item) =>
        item === null ? (
          <Divider key="divider" orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
        ) : (
          <ButtonBase
            key={item.label}
            onClick={item.onClick}
            sx={{
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              py: 1.5,
              borderRadius: 1,
              color: "text.secondary",
              fontSize: "0.6875rem",
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </ButtonBase>
        )
      )}
    </div>
    </>
  );
}
