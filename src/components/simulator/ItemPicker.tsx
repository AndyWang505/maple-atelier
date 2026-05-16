"use client";

import React, {
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
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import type { CatalogItem, Slot } from "@/types/maplestory";
import { useSimulator } from "@/store/simulator";
import { useIsMobile } from "@/lib/hooks/use-breakpoint";
import { EXPRESSIONS } from "@/lib/preview-config";
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

const ROW_HEIGHT = 115;

const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  appearance: <PersonIcon fontSize="small" />,
  equipment: <CheckroomIcon fontSize="small" />,
  mount: <TwoWheelerIcon fontSize="small" />,
};

type CashFilter = "all" | "regular" | "cash";

export default function ItemPicker() {
  // @tanstack/react-virtual 回傳的函式無法被 React Compiler 安全 memo,顯式跳過
  "use no memo";

  const cols = useIsMobile() ? 4 : 5;

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
  const region = useSimulator((s) => s.region);
  const isExpression = active === "expression";
  const activeSlot: Slot | null = isExpression ? null : active;
  const slotCache = useSimulator((s) => activeSlot ? s.catalog[activeSlot] : undefined);
  const loadSlot = useSimulator((s) => s.loadSlot);
  useEffect(() => {
    if (!activeSlot) return;
    void loadSlot(activeSlot);
  }, [activeSlot, loadSlot, region]);

  const handleCategoryChange = (_: unknown, next: SlotCategory) => {
    if (next === category) return;
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
    count: Math.ceil(visible.length / cols),
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  });

  const equippedAtActive = activeSlot ? equipped[activeSlot] : undefined;

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
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Layer 1: 主分類 */}
      <Tabs
        value={category}
        onChange={handleCategoryChange}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          minHeight: "auto",
          "& .MuiTabs-indicator": { backgroundColor: "#F59E0B", height: 3 },
          "& .MuiTabs-flexContainer": { px: 2 },
          "& .MuiTab-root": {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            minHeight: 56,
            px: 1.5,
            py: 0,
            textTransform: "none",
            color: "#71717a",
            transition: "background-color 0.15s, color 0.15s",
            "&.Mui-selected": { color: "#92400e", bgcolor: "#FFFBEB" },
            "&:hover:not(.Mui-selected)": { bgcolor: "#f9fafb" },
          },
          "& .MuiTab-root .cat-icon": { bgcolor: "#f4f4f5" },
          "& .MuiTab-root.Mui-selected .cat-icon": { bgcolor: "#FEF3C7" },
        }}
      >
        {SLOT_SECTIONS.map((section) => {
          return (
            <Tab
              key={section.id}
              value={section.id}
              label={
                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                  <Box
                    className="cat-icon"
                    sx={{
                      display: "flex",
                      p: 0.75,
                      borderRadius: 1,
                      transition: "background-color 0.15s",
                      "& svg": { fontSize: 20 },
                      color: "inherit",
                    }}
                  >
                    {CATEGORY_ICONS[section.id]}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "inherit" }}>
                    {section.title}
                  </Typography>
                </Box>
              }
            />
          );
        })}
      </Tabs>

      {/* Layer 2: slot tabs with counts */}
      <Tabs
        value={active}
        onChange={(_, v) => setActive(v as Slot | "expression")}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiTabs-indicator": { backgroundColor: "#F59E0B" },
          "& .MuiTab-root": { minHeight: 56, py: 0.5 },
          "& .MuiTab-root.Mui-selected": { color: "#B45309" },
        }}
      >
        {slotsInCategory.map((slot) => (
          <Tab key={slot} value={slot} label={SLOT_LABELS[slot]} />
        ))}
        {category === "appearance" && (
          <Tab key="expression" value="expression" label="表情" />
        )}
      </Tabs>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <TextField
            size="small"
            sx={{ flex: 1 }}
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
              onChange={(_: unknown, v: CashFilter | null) => v && setCashFilter(v)}
              aria-label="一般 / 現金 過濾"
              sx={{
                flexShrink: 0,
                "& .MuiToggleButton-root": {
                  px: 1.5,
                  color: "#71717a",
                  borderColor: "#e4e4e7",
                  fontWeight: 500,
                  "&.Mui-selected": {
                    bgcolor: "#e4e4e7",
                    color: "#18181b",
                    borderColor: "#e4e4e7",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#d4d4d8" },
                  },
                  "&:hover:not(.Mui-selected)": { bgcolor: "#f9fafb" },
                },
              }}
            >
              <ToggleButton value="all">全部</ToggleButton>
              <ToggleButton value="regular">一般</ToggleButton>
              <ToggleButton value="cash">現金</ToggleButton>
            </ToggleButtonGroup>
          )}
        </div>
        {isExpression ? (
          <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "#71717a" }}>
            {q
              ? <><span style={{ color: "#D97706", fontWeight: 600 }}>{visibleExpressions.length}</span>{` / ${EXPRESSIONS.length} 款`}</>
              : `共 ${EXPRESSIONS.length} 款`}
          </Typography>
        ) : (
          status === "success" && (
            <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "#71717a" }}>
              {q
                ? <><span style={{ color: "#D97706", fontWeight: 600 }}>{visible.length}</span>{` / ${collapsed.length} ${unitLabel}`}</>
                : `共 ${collapsed.length} ${unitLabel}`}
            </Typography>
          )
        )}
      </div>

      <Divider />

      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto px-4 pt-3 pb-4 max-h-[560px] bg-zinc-100"
      >
        {isExpression && visibleExpressions.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>沒有符合的表情</Typography>
        )}
        {isExpression && visibleExpressions.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {visibleExpressions.map((e) => {
              const isSelected = expression === e.id;
              return (
                <Button
                  key={e.id}
                  onClick={() => setExpression(e.id)}
                  title={e.label}
                  sx={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    minHeight: 72,
                    borderColor: isSelected ? "#FBBF24" : "#e4e4e7",
                    bgcolor: isSelected ? "#FFFBEB" : "white",
                    color: "text.primary",
                    textTransform: "none",
                    transition: "border-color 0.15s, background-color 0.15s",
                    "&:hover": { borderColor: isSelected ? "#FBBF24" : "#7dd3fc", bgcolor: isSelected ? "#FFFBEB" : "white" },
                  }}
                >
                  <Typography variant="body2" noWrap sx={{ lineHeight: 1.3, color: "text.primary", maxWidth: "100%" }}>
                    {e.label}
                  </Typography>
                  <Typography variant="caption" noWrap sx={{ lineHeight: 1.3, color: "text.secondary", maxWidth: "100%" }}>
                    {e.id}
                  </Typography>
                </Button>
              );
            })}
          </div>
        )}
        {!isExpression && (
          <>
        {(status === "idle" || status === "loading") && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>載入中...</Typography>
        )}
        {status === "error" && (
          <div className="text-center py-8 space-y-2">
            <Typography variant="body2" color="error">
              載入失敗{slotCache?.error ? `:${slotCache.error}` : ""}
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => activeSlot && void loadSlot(activeSlot)}
              sx={{ color: "#D97706", textDecoration: "underline" }}
            >
              重試
            </Button>
          </div>
        )}
        {status === "success" && visible.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            {q ? "沒有符合的項目" : "這個部位沒有道具"}
          </Typography>
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
              const start = vRow.index * cols;
              const rowItems = visible.slice(start, start + cols);
              return (
                <div
                  key={vRow.key}
                  className={`grid gap-2 items-start ${cols === 4 ? "grid-cols-4" : "grid-cols-5"}`}
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
