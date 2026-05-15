"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExploreOutfitCard from "@/components/ExploreOutfitCard";
import ExploreOutfitCardSkeleton from "@/components/ExploreOutfitCardSkeleton";
import { useApiPublicOutfits } from "@/lib/api/hooks/use-api-outfits";
import { useApiTopTags } from "@/lib/api/hooks/use-api-tags";
import type { PublicOutfitsResponse, TagCount } from "@/lib/api/types";

type Sort = "hot" | "trending" | "new" | "oldest";

function emptyMessage(q: string, tag: string | null): string {
  if (q) return `沒有符合「${q}」的公開搭配`;
  if (tag) return `沒有 #${tag} 的公開搭配`;
  return "還沒有公開搭配";
}

const TAG_PALETTE: ReadonlyArray<{ bg: string; hover: string; fg: string }> = [
  { bg: "#c8423d", hover: "#a8362f", fg: "#fef2f2" }, // 楓紅
  { bg: "#e87a4f", hover: "#d6663a", fg: "#fff7ed" }, // 楓葉橘
  { bg: "#d97706", hover: "#b8650a", fg: "#fffbeb" }, // 琥珀
  { bg: "#65a30d", hover: "#558a0b", fg: "#f7fee7" }, // 苔綠
  { bg: "#0d9488", hover: "#0b7d72", fg: "#f0fdfa" }, // 鴨蛋青
  { bg: "#0369a1", hover: "#075985", fg: "#f0f9ff" }, // 鈷藍
  { bg: "#7c3aed", hover: "#6d28d9", fg: "#f5f3ff" }, // 葡萄紫
  { bg: "#db2777", hover: "#be185d", fg: "#fdf2f8" }, // 桃粉
];

function tierChipSx(
  tier: 0 | 1 | 2,
  isSelected: boolean,
  paletteIdx: number
) {
  const palette = TAG_PALETTE[paletteIdx % TAG_PALETTE.length];

  if (isSelected) {
    return {
      bgcolor: palette.fg,
      color: palette.bg,
      fontWeight: 700,
      ...(tier === 0 && { fontSize: "0.95rem", height: 36 }),
      borderWidth: 2,
      borderColor: palette.bg,
      "&:hover": { bgcolor: palette.fg, borderColor: palette.hover },
      "& .MuiChip-deleteIcon": {
        color: palette.bg,
        "&:hover": { color: palette.hover },
      },
    };
  }
  if (tier === 0) {
    return {
      bgcolor: palette.bg,
      color: "white",
      fontWeight: 700,
      fontSize: "0.95rem",
      height: 36,
      "&:hover": { bgcolor: palette.hover },
    };
  }
  if (tier === 1) {
    return {
      bgcolor: palette.bg,
      color: "white",
      fontWeight: 600,
      "&:hover": { bgcolor: palette.hover },
    };
  }
  return undefined;
}

interface ParamUpdates {
  sort?: Sort;
  tag?: string | null;
  q?: string;
  page?: number;
}

export const EXPLORE_PAGE_SIZE = 30;

interface ExploreClientProps {
  currentUserId: string | null;
  fallbackOutfits?: PublicOutfitsResponse;
  fallbackTopTags?: TagCount[];
}

export default function ExploreClient({
  currentUserId,
  fallbackOutfits,
  fallbackTopTags,
}: ExploreClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL 是 source of truth — 重整 / 分享連結 / back button 都會還原到正確狀態
  const sortParam = searchParams.get("sort");
  const sort: Sort =
    sortParam === "hot" ? "hot" : sortParam === "trending" ? "trending" : sortParam === "oldest" ? "oldest" : "new";
  const tag = searchParams.get("tag");
  const debouncedQ = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const [q, setQ] = useState(debouncedQ);
  // 偵測 URL 外部變動(back button / 貼連結)同步回本地輸入 — render-time setState 是 React 官方建議:
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [lastSeenUrlQ, setLastSeenUrlQ] = useState(debouncedQ);
  if (debouncedQ !== lastSeenUrlQ) {
    setLastSeenUrlQ(debouncedQ);
    setQ(debouncedQ);
  }

  const { data, error, isLoading } = useApiPublicOutfits(
    {
      sort,
      tag,
      q: debouncedQ,
      page,
      limit: EXPLORE_PAGE_SIZE,
    },
    fallbackOutfits,
  );
  const { data: topTags } = useApiTopTags(20, fallbackTopTags);

  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [tagsOverflow, setTagsOverflow] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tagsRef.current;
    if (!el) return;
    const check = () => setTagsOverflow(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [topTags]);

  const rows = data?.rows;
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / EXPLORE_PAGE_SIZE))
    : 1;
  // 排序意義是「人氣」且在第一頁時才有意義 — new 是純時間,page 2+ 不在 top 3
  const showRank = (sort === "hot" || sort === "trending") && page === 1 && !tag && !debouncedQ;

  const setParams = useCallback(
    (updates: ParamUpdates) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.sort !== undefined) {
        if (updates.sort === "new") params.delete("sort");
        else params.set("sort", updates.sort);
      }
      if (updates.tag !== undefined) {
        if (updates.tag === null) params.delete("tag");
        else params.set("tag", updates.tag);
      }
      if (updates.q !== undefined) {
        if (!updates.q) params.delete("q");
        else params.set("q", updates.q);
      }
      if (updates.page !== undefined) {
        if (updates.page <= 1) params.delete("page");
        else params.set("page", String(updates.page));
      } else if (
        updates.sort !== undefined ||
        updates.tag !== undefined ||
        updates.q !== undefined
      ) {
        params.delete("page");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const submitSearch = () => {
    if (q !== debouncedQ) setParams({ q });
  };

  const handlePageChange = (_: unknown, next: number) => {
    if (next === page) return;
    setParams({ page: next });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (error) return <p className="text-red-600">載入失敗</p>;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <form
            className="flex-1 min-w-0"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="搜尋標題或作者"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        type="submit"
                        size="small"
                        edge="start"
                        aria-label="搜尋"
                        disabled={q === debouncedQ}
                      >
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: q ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="清除搜尋"
                        onClick={() => {
                          setQ("");
                          if (debouncedQ) setParams({ q: "" });
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </form>
          <ToggleButtonGroup
            value={sort}
            exclusive
            size="small"
            onChange={(_, v: Sort | null) => v && v !== sort && setParams({ sort: v })}
            aria-label="排序"
          >
            <ToggleButton value="new">最新</ToggleButton>
            <ToggleButton value="oldest">最舊</ToggleButton>
            <ToggleButton value="hot">熱門</ToggleButton>
            <ToggleButton value="trending">趨勢</ToggleButton>
          </ToggleButtonGroup>
        </div>

        {topTags && topTags.length > 0 && (
          <div>
            <div
              ref={tagsRef}
              className="flex flex-wrap items-center gap-2 overflow-hidden transition-[max-height] duration-300"
              style={{ maxHeight: tagsExpanded ? "none" : "84px" }}
            >
              {topTags.map((t, i) => {
                const isSelected = tag === t.tag;
                const tier = i < 3 ? 0 : i < 8 ? 1 : 2;
                return (
                  <Chip
                    key={t.tag}
                    label={`#${t.tag}`}
                    title={`${t.count} 套搭配使用`}
                    size={tier === 2 ? "small" : "medium"}
                    clickable
                    onClick={() =>
                      setParams({ tag: isSelected ? null : t.tag })
                    }
                    onDelete={
                      isSelected ? () => setParams({ tag: null }) : undefined
                    }
                    variant={!isSelected && tier !== 2 ? "filled" : "outlined"}
                    sx={tierChipSx(tier, isSelected, i)}
                  />
                );
              })}
            </div>
            {(tagsOverflow || tagsExpanded) && (
              <Button
                size="small"
                variant="text"
                onClick={() => setTagsExpanded((v) => !v)}
                sx={{ mt: 0.5, px: 0.5, minWidth: 0, color: "text.secondary", fontSize: "0.75rem" }}
              >
                {tagsExpanded ? "收起" : "查看更多"}
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoading || !rows ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <ExploreOutfitCardSkeleton key={i} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center py-16 text-zinc-500">
          {emptyMessage(debouncedQ, tag)}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {rows.map((row, i) => (
              <ExploreOutfitCard
                key={row.id}
                outfit={row}
                currentUserId={currentUserId}
                rank={showRank ? i + 1 : undefined}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                page={page}
                count={totalPages}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

