import type { OutfitPayload } from "@/db/schema";
import { SLOTS, type CatalogItem, type Slot } from "@/types/maplestory";

type Equipped = Partial<Record<Slot, CatalogItem>>;

/** store equipped + 當下 stance/animated/expression → DB 儲存的最小 JSON shape */
export const toOutfitPayload = (
  equipped: Equipped,
  stance: string,
  animated: boolean,
  expression: string,
): OutfitPayload => {
  const slots: OutfitPayload["slots"] = {};
  for (const slot of SLOTS) {
    const item = equipped[slot];
    if (!item) continue;
    slots[slot] = {
      id: item.id,
      ...(item.region ? { region: item.region } : {}),
      ...(item.version ? { version: item.version } : {}),
      // 只在 true 時存;false / undefined 預設視為一般,讀取端可回退打 API 補
      ...(item.isCash ? { isCash: true } : {}),
    };
  }
  return {
    slots,
    stance,
    animated,
    // 預設值不存,省 bytes
    ...(expression && expression !== "default" ? { expression } : {}),
  };
};
