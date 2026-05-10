"use client";

import { ItemIcon } from "@/components/ui/ItemIcon";
import { getSlotIconUrl } from "@/lib/maplestory";
import {
  getStyleBase,
  isColorSlot,
  stripColorName,
} from "@/lib/color-variants";
import type { CatalogItem, Slot } from "@/types/maplestory";

interface ItemTileProps {
  item: CatalogItem;
  active: Slot;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * ItemPicker 的單格 tile。負責一筆 item 的視覺呈現,不管選取邏輯。
 * - 顏色摺疊 slot(髮型/臉型)會把 name 去色字、id 顯示 base id
 * - 其他 slot 顯示完整 name + id
 */
export function ItemTile({ item, active, isSelected, onSelect }: ItemTileProps) {
  const grouped = isColorSlot(active);
  const displayName = grouped ? stripColorName(item.name) : item.name;
  const displayId = grouped ? getStyleBase(active, item.id) : item.id;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
        isSelected
          ? "border-amber-400 bg-amber-50"
          : "border-zinc-200 bg-white hover:border-sky-400"
      }`}
      title={`${displayName} (${item.id})`}
    >
      <ItemIcon
        src={getSlotIconUrl(active, item.id, {
          region: item.region,
          version: item.version,
        })}
        alt={displayName}
        className="w-12 h-12 object-contain mb-1.5"
        style={{ imageRendering: "pixelated" }}
        loading="lazy"
      />
      <span className="text-[11px] leading-tight text-zinc-700 truncate max-w-full">
        {displayName}
      </span>
      <span className="mt-0.5 text-[10px] leading-tight text-zinc-400 truncate max-w-full">
        {displayId}
      </span>
    </button>
  );
}
