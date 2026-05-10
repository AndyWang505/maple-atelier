import type { MaplestoryClientOptions, Slot } from "@/types/maplestory";
import { base } from "./urls";

export interface SlotFilter {
  overallCategoryFilter: string;
  categoryFilter: string;
  subCategoryFilter: string;
}

/**
 * Slot → maplestory.io filter 組合對照表。
 * - weapon 併聯主流子類(劍/匕首/杖/法杖/雙手劍/矛/弓/拳套 + Cash 時裝武器)
 * - offhand 同時收 Armor.Shield 與 One-Handed Weapon.Katara(雙刀職副手),wz 分散但遊戲位置同一
 * - skin 走 STATIC_SKIN_ITEMS,不打 API
 */
export const SLOT_FILTERS: Record<Slot, ReadonlyArray<SlotFilter>> = {
  hair: [{ overallCategoryFilter: "Equip", categoryFilter: "Character", subCategoryFilter: "Hair" }],
  face: [{ overallCategoryFilter: "Equip", categoryFilter: "Character", subCategoryFilter: "Face" }],
  skin: [],
  ear: [],
  hat: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Hat" }],
  faceAccessory: [{ overallCategoryFilter: "Equip", categoryFilter: "Accessory", subCategoryFilter: "Face Accessory" }],
  eyeDecoration: [{ overallCategoryFilter: "Equip", categoryFilter: "Accessory", subCategoryFilter: "Eye Decoration" }],
  earring: [{ overallCategoryFilter: "Equip", categoryFilter: "Accessory", subCategoryFilter: "Earrings" }],
  coat: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Top" }],
  pants: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Bottom" }],
  overall: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Overall" }],
  shoes: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Shoes" }],
  cape: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Cape" }],
  weapon: [
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "One-Handed Sword" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Dagger" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Wand" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Staff" },
    { overallCategoryFilter: "Equip", categoryFilter: "Two-Handed Weapon", subCategoryFilter: "Two-Handed Sword" },
    { overallCategoryFilter: "Equip", categoryFilter: "Two-Handed Weapon", subCategoryFilter: "Spear" },
    { overallCategoryFilter: "Equip", categoryFilter: "Two-Handed Weapon", subCategoryFilter: "Bow" },
    { overallCategoryFilter: "Equip", categoryFilter: "Two-Handed Weapon", subCategoryFilter: "Knuckle" },
    // 時裝武器(maplestory.io 把它放在 one-Handed Weapon 下的 Cash 子類,id 1701000-1704999)
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Cash" },
  ],
  offhand: [
    { overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Shield" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Katara" },
  ],
  mount: [{ overallCategoryFilter: "Equip", categoryFilter: "Mount", subCategoryFilter: "Mount" }],
};

export const buildItemUrl = (filter: SlotFilter, opts?: MaplestoryClientOptions) => {
  const params = new URLSearchParams(Object.entries(filter));
  return `${base(opts)}/item?${params.toString()}`;
};
