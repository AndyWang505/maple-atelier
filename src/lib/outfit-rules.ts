import type { OutfitPayload } from "@/db/schema";
import type { CatalogItem, Gender, Slot } from "@/types/maplestory";

/** 第一次進模擬器 / 切換性別時載入,讓使用者看到「成形」起點而非裸體或隨機。 */
export const DEFAULT_OUTFIT_PAYLOAD: Record<Gender, OutfitPayload> = {
  male: {
    slots: {
      hair: { id: 30000 },
      face: { id: 20000 },
      skin: { id: 2000 },
      coat: { id: 1040036 },
      pants: { id: 1060026 },
    },
    stance: "stand1",
    animated: false,
  },
  female: {
    slots: {
      hair: { id: 31000 },
      face: { id: 21000 },
      skin: { id: 2000 },
      coat: { id: 1040036 },
      pants: { id: 1060026 },
    },
    stance: "stand1",
    animated: false,
  },
};

/** 必裝 slot — 角色基本身體要件,隨機初始化必出 */
export const MANDATORY_SLOTS: ReadonlyArray<Slot> = ["hair", "face", "skin"];

/** 選裝 slot — 隨機初始化各以 50% 機率裝上 */
export const OPTIONAL_SLOTS: ReadonlyArray<Slot> = [
  "hat",
  "faceAccessory",
  "eyeDecoration",
  "earring",
  "shoes",
  "cape",
  "weapon",
  "offhand",
];

/**
 * maplestory.io 的 `requiredGender` 只有在 Character 系(hair / face)是真的性別欄,
 * 其他裝備這欄被拿去放 job/class 之類的東西 — id=1000000「空氣帽」requiredGender=0
 * 但實際是通用基礎帽就是證據。所以只對 hair/face 過濾,其他 slot 一律當通用。
 */
const GENDER_LOCKED_SLOTS: ReadonlySet<Slot> = new Set(["hair", "face"]);

const genderNum = (g: Gender): 0 | 1 => (g === "male" ? 0 : 1);

/** 一次決定該 slot 要不要過濾,非 locked slot 直接回原陣列、跳過 N 次 per-item 比對 */
export const filterByGender = (
  items: CatalogItem[],
  slot: Slot,
  gender: Gender,
): CatalogItem[] => {
  if (!GENDER_LOCKED_SLOTS.has(slot)) return items;
  const target = genderNum(gender);
  return items.filter((i) => i.requiredGender === 2 || i.requiredGender === target);
};

/** 抽一套隨機 slot 集合:必裝 + 選裝 50/50 + (上衣+褲子) vs 套服 二擇一 */
export const pickRandomSlotSet = (): Slot[] => {
  const slots: Slot[] = [...MANDATORY_SLOTS];
  for (const slot of OPTIONAL_SLOTS) {
    if (Math.random() < 0.5) slots.push(slot);
  }
  if (Math.random() < 0.5) {
    slots.push("coat", "pants");
  } else {
    slots.push("overall");
  }
  return slots;
};

export const pickRandom = <T>(arr: readonly T[]): T | undefined =>
  arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
