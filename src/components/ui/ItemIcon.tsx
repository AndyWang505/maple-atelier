"use client";

import { useState, type ImgHTMLAttributes } from "react";

// 灰底「?」圖,用於 maplestory.io 回 404 / 渲染失敗時兜底。
// 底色刻意比 tile 預設 bg-zinc-50 (#fafafa) 深(zinc-200 #e4e4e7),這樣 fallback 才看得出來
const FALLBACK_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <rect width="48" height="48" fill="#e4e4e7" rx="6"/>
    <text x="24" y="33" font-size="22" font-weight="600" text-anchor="middle" fill="#71717a">?</text>
  </svg>`,
)}`;

interface ItemIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
}

/**
 * Item / 外觀縮圖。若來源 URL 載入失敗(maplestory.io 偶爾 404 或 body 條目回空 PNG),
 * 自動切到 fallback 灰底「?」圖,避免破圖 icon。
 *
 * 用 `erroredSrc` 比對當前 src,讓 src 變動時自動重置 — 不靠 effect 重設 state。
 */
export function ItemIcon({ src, alt = "", onError, ...rest }: ItemIconProps) {
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const display = erroredSrc === src ? FALLBACK_SRC : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={display}
      alt={alt}
      onError={(e) => {
        setErroredSrc(src);
        onError?.(e);
      }}
    />
  );
}
