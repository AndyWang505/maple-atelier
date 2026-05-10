"use client";

import Link from "next/link";

interface HomeTagCloudProps {
  tags: ReadonlyArray<{ tag: string; count: number }>;
}

/**
 * 標籤雲 — 依 server 端 count desc 排序,前 3 / 4-8 / 其他三層視覺差。
 */
export default function HomeTagCloud({ tags }: HomeTagCloudProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((t, i) => {
        const tier = i < 3 ? 0 : i < 8 ? 1 : 2;
        const className = TIER_CLASS[tier];
        return (
          <Link
            key={t.tag}
            href={`/explore?tag=${encodeURIComponent(t.tag)}`}
            title={`${t.count} 套搭配使用`}
            className={`inline-flex items-center rounded-full no-underline transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
          >
            #{t.tag}
          </Link>
        );
      })}
    </div>
  );
}

const TIER_CLASS = [
  "px-4 py-2 text-base sm:text-lg font-bold bg-maple-red text-white shadow-sm hover:shadow-maple-red/40",
  "px-3.5 py-1.5 text-sm font-semibold bg-maple-leaf text-white",
  "px-3 py-1 text-xs font-medium bg-white border border-zinc-300 text-zinc-700 hover:border-maple-red hover:text-maple-red",
] as const;
