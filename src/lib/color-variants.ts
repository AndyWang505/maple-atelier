import type { CatalogItem, Slot } from "@/types/maplestory";

// MapleStory 髮型/臉型 id 內含色號:同款多色,移除色號位數 = 同款 base id。

const COLOR_SLOT_SET = new Set<Slot>(["hair", "face"]);
export const isColorSlot = (slot: Slot): boolean => COLOR_SLOT_SET.has(slot);

/**
 * 同款 base id。
 * - hair 末位是色號:30005 → 3000
 * - face 第 3 位才是色號:51346 → 5146
 */
export const getStyleBase = (slot: Slot, id: number): number => {
  if (slot === "face") {
    const s = id.toString();
    return parseInt(s.slice(0, 2) + s.slice(3), 10);
  }
  return Math.floor(id / 10);
};

/** 取得色號(0-9)。位置同 getStyleBase 註解 */
export const getColorIndex = (slot: Slot, id: number): number => {
  if (slot === "face") {
    return parseInt(id.toString().charAt(2), 10);
  }
  return id % 10;
};

/** 兩筆 item id 是否屬於同款(只差顏色) */
export const isSameStyle = (slot: Slot, a: number, b: number): boolean =>
  getStyleBase(slot, a) === getStyleBase(slot, b);

const COLOR_WORDS_REGEX =
  /(Black|Red|Orange|Yellow|Green|Blue|Purple|Brown|Hazel|Sapphire|Violet|Amethyst|White|黑色|青色|紅色|橘色|黃色|綠色|藍色|紫色|粉色|褐色)/g;
const PAREN_REGEX = /\([^)]*\)/g;

export const stripColorName = (name: string | null | undefined): string =>
  (name ?? "").replace(PAREN_REGEX, "").replace(COLOR_WORDS_REGEX, "").trim();

/** id 末位 → 色板顯示。範圍 0-7 是 MapleStory 標準八色;8-9 偶有特殊變體 */
export const COLOR_SWATCHES: Record<number, { name: string; hex: string }> = {
  0: { name: "黑", hex: "#1f2937" },
  1: { name: "紅", hex: "#dc2626" },
  2: { name: "橘", hex: "#ea580c" },
  3: { name: "黃", hex: "#facc15" },
  4: { name: "綠", hex: "#16a34a" },
  5: { name: "藍", hex: "#2563eb" },
  6: { name: "紫", hex: "#9333ea" },
  7: { name: "褐", hex: "#92400e" },
};

/** 同款多色摺疊成一筆,每組挑色號最小者當代表。 */
export const collapseColorGroups = (
  slot: Slot,
  items: CatalogItem[],
): CatalogItem[] => {
  const map = new Map<number, CatalogItem>();
  for (const item of items) {
    const base = getStyleBase(slot, item.id);
    const existing = map.get(base);
    if (
      !existing ||
      getColorIndex(slot, item.id) < getColorIndex(slot, existing.id)
    ) {
      map.set(base, item);
    }
  }
  return Array.from(map.values());
};
