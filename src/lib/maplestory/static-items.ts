import type { CatalogItem, Slot } from "@/types/maplestory";
import { STATIC_EAR_ITEMS } from "./static-ears";
import { STATIC_SKIN_ITEMS } from "./static-skins";

/**
 * Synthetic slot — 不打 maplestory.io `/item` 也不進 character render 的 items 列表。
 * skin 走 opts.skin* 走特殊 character endpoint;ear 是 render query flag。
 * 新增同類 slot 只要在這加一行,api / preview / icon dispatch 自動跟上。
 */
export const STATIC_ITEMS_BY_SLOT: Partial<Record<Slot, ReadonlyArray<CatalogItem>>> = {
  skin: STATIC_SKIN_ITEMS,
  ear: STATIC_EAR_ITEMS,
};

export const isSyntheticSlot = (slot: string): boolean => slot in STATIC_ITEMS_BY_SLOT;
