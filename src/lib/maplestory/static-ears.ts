import type { CatalogItem } from "@/types/maplestory";

/**
 * 耳朵不是 maplestory.io 的 item,而是 character render 的 query flag
 * (`showears` / `showLefEars` / `showHighLefEars`)。為了套進「外觀 → 耳朵」slot
 * 流程,用一組 sentinel id 90000-90003 模擬出 4 個選項;CharacterPreview 端
 * 會把 equipped.ear?.id 翻成對應的 query flag。
 */
export const EAR_NORMAL = 90000;
export const EAR_MERC = 90001;
export const EAR_LEF = 90002;
export const EAR_HIGH_LEF = 90003;

export const STATIC_EAR_ITEMS: ReadonlyArray<CatalogItem> = [
  { id: EAR_NORMAL,   name: "一般",       slot: "ear", isCash: false, requiredGender: 2 },
  { id: EAR_MERC,     name: "精靈",       slot: "ear", isCash: false, requiredGender: 2 },
  { id: EAR_LEF,      name: "木雷普",     slot: "ear", isCash: false, requiredGender: 2 },
  { id: EAR_HIGH_LEF, name: "亥雷普", slot: "ear", isCash: false, requiredGender: 2 },
];

type EarFlag = "showears" | "showLefEars" | "showHighLefEars";

const EAR_FLAG_BY_ID: Record<number, EarFlag> = {
  [EAR_MERC]: "showears",
  [EAR_LEF]: "showLefEars",
  [EAR_HIGH_LEF]: "showHighLefEars",
};

/** id → 該耳朵對應的 character render query flag 名;EAR_NORMAL / undefined → undefined */
export const earFlagForId = (id?: number): EarFlag | undefined =>
  id !== undefined ? EAR_FLAG_BY_ID[id] : undefined;

/** 把 id 攤成三個 boolean,方便直接 spread 進 getCharacterRenderUrl opts */
export function earFlagsForId(id?: number): Record<EarFlag, boolean> {
  const active = earFlagForId(id);
  return {
    showears: active === "showears",
    showLefEars: active === "showLefEars",
    showHighLefEars: active === "showHighLefEars",
  };
}
