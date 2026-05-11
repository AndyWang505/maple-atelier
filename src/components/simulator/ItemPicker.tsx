"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import type { CatalogItem, Slot } from "@/types/maplestory";
import { useSimulator } from "@/store/simulator";
import { EXPRESSIONS } from "@/lib/preview-config";
import {
  earFlagsForId,
  getCharacterRenderUrl,
  isSyntheticSlot,
} from "@/lib/maplestory";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { ItemTile } from "@/components/simulator/ItemTile";
import {
  SLOT_LABELS,
  SLOT_SECTIONS,
  type SlotCategory,
} from "@/lib/slot-taxonomy";
import {
  collapseColorGroups,
  getColorIndex,
  isColorSlot,
  isSameStyle,
  stripColorName,
} from "@/lib/color-variants";

const COLS = 5;
const ROW_HEIGHT = 115;

type CashFilter = "all" | "regular" | "cash";

export default function ItemPicker() {
  // @tanstack/react-virtual 回傳的函式無法被 React Compiler 安全 memo,顯式跳過
  "use no memo";

  const [category, setCategory] = useState<SlotCategory>("appearance");
  // "expression" 是 virtual tab — 不是 item slot,選了會 setExpression 而不是 equip
  const [active, setActive] = useState<Slot | "expression">("hair");
  const [query, setQuery] = useState("");
  // committedQuery 才實際參與過濾;query 只是輸入框值
  const [committedQuery, setCommittedQuery] = useState("");
  const [cashFilter, setCashFilter] = useState<CashFilter>("all");

  const equip = useSimulator((s) => s.equip);
  const equipped = useSimulator((s) => s.equipped);
  const expression = useSimulator((s) => s.expression);
  const setExpression = useSimulator((s) => s.setExpression);
  const isExpression = active === "expression";
  const activeSlot: Slot | null = isExpression ? null : active;
  const slotCache = useSimulator((s) =>
    activeSlot ? s.catalog[activeSlot] : undefined,
  );
  const loadSlot = useSimulator((s) => s.loadSlot);
  useEffect(() => {
    if (!activeSlot) return;
    void loadSlot(activeSlot);
  }, [activeSlot, loadSlot]);

  const handleCategoryChange = (_: unknown, next: SlotCategory | null) => {
    if (!next || next === category) return;
    setCategory(next);
    const section = SLOT_SECTIONS.find((s) => s.id === next);
    if (section) setActive(section.slots[0]);
  };

  const slotsInCategory =
    SLOT_SECTIONS.find((s) => s.id === category)?.slots ?? [];

  const isGrouped = !!activeSlot && isColorSlot(activeSlot);

  // 一般/現金 過濾僅作用在「裝備」分類;外觀分類略過此維度
  const cashFiltered = useMemo(() => {
    const items = slotCache?.items ?? [];
    if (category !== "equipment" || cashFilter === "all") return items;
    return items.filter((i) =>
      cashFilter === "cash" ? i.isCash : !i.isCash,
    );
  }, [slotCache?.items, cashFilter, category]);

  const collapsed = useMemo(
    () => (activeSlot && isGrouped ? collapseColorGroups(activeSlot, cashFiltered) : cashFiltered),
    [isGrouped, cashFiltered, activeSlot],
  );

  const submitSearch = () => setCommittedQuery(query);
  const clearSearch = () => {
    setQuery("");
    setCommittedQuery("");
  };

  const q = committedQuery.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!q) return collapsed;
    return collapsed.filter((it) => {
      const name = isGrouped ? stripColorName(it.name) : it.name;
      return name.toLowerCase().includes(q) || String(it.id).includes(q);
    });
  }, [q, collapsed, isGrouped]);

  const visibleExpressions = useMemo(() => {
    if (!q) return EXPRESSIONS;
    return EXPRESSIONS.filter(
      (e) => e.label.toLowerCase().includes(q) || e.id.toLowerCase().includes(q),
    );
  }, [q]);

  const status = slotCache?.status ?? "idle";

  const parentRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/incompatible-library -- 已在 component 開頭以 "use no memo" 顯式 opt-out
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(visible.length / COLS),
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  });

  const equippedAtActive = activeSlot ? equipped[activeSlot] : undefined;

  const previewItems = useMemo(
    () =>
      Object.values(equipped).flatMap((item) =>
        item && !isSyntheticSlot(item.slot)
          ? [{
              itemId: item.id,
              region: item.region,
              version: item.version,
              slot: item.slot,
            }]
          : [],
      ),
    [equipped],
  );
  const earFlags = useMemo(
    () => earFlagsForId(equipped.ear?.id),
    [equipped.ear?.id],
  );
  const emotionPreviewUrl = (animationName: string) => {
    const items = previewItems.map(({ slot, ...rest }) => ({
      ...rest,
      ...(slot === "face" ? { animationName } : {}),
    }));
    return getCharacterRenderUrl(items, {
      skin: equipped.skin?.id,
      skinRegion: equipped.skin?.region,
      skinVersion: equipped.skin?.version,
      stance: "stand1",
      frame: 0,
      renderMode: 1,
      resize: 2,
      ...earFlags,
    });
  };

  const handleTileClick = (groupRep: CatalogItem) => {
    if (!activeSlot || !isGrouped) {
      equip(groupRep);
      return;
    }
    // 摺疊模式:沿用使用者目前的色號;找不到則 fallback 代表
    const currentColor = equippedAtActive
      ? getColorIndex(activeSlot, equippedAtActive.id)
      : 0;
    const variant = cashFiltered.find(
      (i) =>
        isSameStyle(activeSlot, i.id, groupRep.id) &&
        getColorIndex(activeSlot, i.id) === currentColor,
    );
    equip(variant ?? groupRep);
  };

  const isTileSelected = (it: CatalogItem): boolean => {
    if (!equippedAtActive || !activeSlot) return false;
    return isGrouped
      ? isSameStyle(activeSlot, equippedAtActive.id, it.id)
      : equippedAtActive.id === it.id;
  };

  const unitLabel = isGrouped ? "款" : "筆";

  const renderTile = (item: CatalogItem) => {
    if (!activeSlot) return null;
    return (
      <ItemTile
        key={item.id}
        item={item}
        active={activeSlot}
        isSelected={isTileSelected(item)}
        onSelect={() => handleTileClick(item)}
      />
    );
  };

  return (
    <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-sm shadow-sky-200/40 overflow-hidden flex flex-col">
      <div className="px-4 py-3">
        <ToggleButtonGroup
          value={category}
          exclusive
          size="small"
          onChange={handleCategoryChange}
          aria-label="主分類"
        >
          {SLOT_SECTIONS.map((section) => (
            <ToggleButton key={section.id} value={section.id}>
              {section.title}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <div className="px-4">
        <Tabs
          value={active}
          onChange={(_, v) => setActive(v as Slot | "expression")}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-indicator": { backgroundColor: "#F59E0B" },
            "& .MuiTab-root.Mui-selected": { color: "#B45309" },
          }}
        >
          {slotsInCategory.map((slot) => (
            <Tab key={slot} label={SLOT_LABELS[slot]} value={slot} />
          ))}
          {category === "appearance" && (
            <Tab key="expression" label="表情" value="expression" />
          )}
        </Tabs>
      </div>

      <div className="px-4 py-3">
        <TextField
          size="small"
          fullWidth
          placeholder="搜尋名稱或 ID..."
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") submitSearch();
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {committedQuery && (
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      aria-label="清除搜尋"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={submitSearch}
                    aria-label="搜尋"
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {category === "equipment" && (
          <ToggleButtonGroup
            value={cashFilter}
            exclusive
            size="small"
            fullWidth
            onChange={(_: unknown, v: CashFilter | null) => v && setCashFilter(v)}
            aria-label="一般 / 現金 過濾"
            sx={{ mt: 1.5 }}
          >
            <ToggleButton value="all">全部</ToggleButton>
            <ToggleButton value="regular">一般</ToggleButton>
            <ToggleButton value="cash">現金</ToggleButton>
          </ToggleButtonGroup>
        )}
        {isExpression ? (
          <p className="mt-1.5 text-xs text-zinc-500">
            {q
              ? `符合 ${visibleExpressions.length} / ${EXPRESSIONS.length} 款`
              : `共 ${EXPRESSIONS.length} 款`}
          </p>
        ) : (
          status === "success" && (
            <p className="mt-1.5 text-xs text-zinc-500">
              {q
                ? `符合 ${visible.length} / ${collapsed.length} ${unitLabel}`
                : `共 ${collapsed.length} ${unitLabel}`}
            </p>
          )
        )}
      </div>

      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto px-4 pb-4 max-h-[560px]"
      >
        {isExpression && visibleExpressions.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-8">沒有符合的表情</p>
        )}
        {isExpression && visibleExpressions.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {visibleExpressions.map((e) => {
              const isSelected = expression === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setExpression(e.id)}
                  title={e.label}
                  className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? "border-amber-400 bg-amber-50"
                      : "border-zinc-200 bg-white hover:border-sky-400"
                  }`}
                >
                  <ItemIcon
                    src={emotionPreviewUrl(e.id)}
                    alt={e.label}
                    className="w-20 h-20 object-contain mb-1.5"
                    style={{ imageRendering: "pixelated" }}
                    loading="lazy"
                  />
                  <span className="text-[11px] leading-tight text-zinc-700 truncate max-w-full">
                    {e.label}
                  </span>
                  <span className="mt-0.5 text-[10px] leading-tight text-zinc-400 truncate max-w-full">
                    {e.id}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {!isExpression && (
          <>
        {(status === "idle" || status === "loading") && (
          <p className="text-sm text-zinc-500 text-center py-8">載入中...</p>
        )}
        {status === "error" && (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-red-600">
              載入失敗{slotCache?.error ? `:${slotCache.error}` : ""}
            </p>
            <button
              onClick={() => activeSlot && void loadSlot(activeSlot)}
              className="text-sm text-maple-red underline hover:opacity-80"
            >
              重試
            </button>
          </div>
        )}
        {status === "success" && visible.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-8">
            {q ? "沒有符合的項目" : "這個部位沒有道具"}
          </p>
        )}
        {status === "success" && visible.length > 0 && (
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
              width: "100%",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const start = vRow.index * COLS;
              const rowItems = visible.slice(start, start + COLS);
              return (
                <div
                  key={vRow.key}
                  className="grid grid-cols-5 gap-2 items-start"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: ROW_HEIGHT,
                    transform: `translateY(${vRow.start}px)`,
                  }}
                >
                  {rowItems.map(renderTile)}
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
