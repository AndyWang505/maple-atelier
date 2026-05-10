"use client";

import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface OutfitCarouselProps {
  children: ReactNode;
  /** 是否自動輪播。預設 false。開啟時自動 loop、hover 暫停、互動後也續播 */
  autoplay?: boolean;
  /** autoplay 間隔(ms),預設 5000 */
  autoplayDelay?: number;
}

/**
 * Netflix 行式輪播:卡片寬可變、可拖、可滑、桌面有箭頭按鈕。
 * autoplay 模式下會循環播放,滑鼠移上去暫停。
 */
export default function OutfitCarousel({
  children,
  autoplay = false,
  autoplayDelay = 5000,
}: OutfitCarouselProps) {
  const plugins = useMemo(
    () =>
      autoplay
        ? [
            Autoplay({
              delay: autoplayDelay,
              stopOnMouseEnter: true,
              stopOnInteraction: false,
            }),
          ]
        : [],
    [autoplay, autoplayDelay],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      dragFree: true,
      containScroll: "trimSnaps",
      loop: autoplay,
    },
    plugins,
  );

  // useSyncExternalStore 綁 embla 狀態(避開 useEffect+setState lint)
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", notify);
      emblaApi.on("reInit", notify);
      return () => {
        emblaApi.off("select", notify);
        emblaApi.off("reInit", notify);
      };
    },
    [emblaApi],
  );
  const canPrev = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false,
  );
  const canNext = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollNext() ?? false,
    () => false,
  );

  const arrowSx = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    bgcolor: "rgba(255,255,255,0.95)",
    boxShadow: 2,
    "&:hover": { bgcolor: "white" },
    "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.5)" },
    display: { xs: "none", sm: "inline-flex" },
  } as const;

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4 px-3">{children}</div>
      </div>
      <IconButton
        size="medium"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        aria-label="上一頁"
        sx={{ ...arrowSx, left: -16 }}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        size="medium"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        aria-label="下一頁"
        sx={{ ...arrowSx, right: -16 }}
      >
        <ChevronRightIcon />
      </IconButton>
    </div>
  );
}
