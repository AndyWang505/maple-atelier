import type { ReactNode } from "react";

type Width = "wide" | "content";
type Bg = "soft" | "none";

const MAX_WIDTH: Record<Width, string> = {
  /** /explore /me /home — 列表 / 模擬器 / 首頁等 */
  wide: "max-w-7xl",
  /** /about /outfit/[id] — 內容閱讀型,行寬比較收 */
  content: "max-w-3xl",
};

/** 底部淡淡暖色帶,跟 footer bg-zinc-50 平順接;頂部維持白以免搶過 page 標題 */
const SOFT_BG_CLASS =
  "bg-[linear-gradient(180deg,#fff_0%,#fff_75%,rgb(253_186_116/0.18)_100%)]";

interface PageShellProps {
  /** @default "wide" */
  width?: Width;
  /**
   * 頁面背景。`soft` 在底部加一道暖色 fade,跟 footer 接得自然。
   * 首頁有自家 wrapper(hero 需要更強的 top + bottom 暖色框),不走這條路。
   * @default "none"
   */
  bg?: Bg;
  /** 補充的 className(例如首頁的 space-y-14)。注意不要再放 padding-y,會跟內建衝突 */
  className?: string;
  children: ReactNode;
}

/**
 * 頁面外殼:統一容器寬度與上下/左右 padding。
 * 變動 padding token 一處生效。simulator 因為要不對稱 pt/pb,自己刻容器。
 */
export default function PageShell({
  width = "wide",
  bg = "none",
  className = "",
  children,
}: PageShellProps) {
  const inner = (
    <div
      className={`container mx-auto ${MAX_WIDTH[width]} px-4 py-6 sm:py-8 ${className}`.trimEnd()}
    >
      {children}
    </div>
  );
  if (bg === "none") return inner;
  return <div className={SOFT_BG_CLASS}>{inner}</div>;
}
