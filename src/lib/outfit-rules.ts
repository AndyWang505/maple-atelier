import type { OutfitPayload } from "@/db/schema";
import type { Slot } from "@/types/maplestory";

export const DEFAULT_OUTFIT_PAYLOAD: OutfitPayload = {
  slots: {
    hair: { id: 30000 },
    face: { id: 20000 },
    skin: { id: 2000 },
    coat: { id: 1040036 },
    pants: { id: 1060026 },
  },
  stance: "stand1",
  animated: false,
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
  "glove",
  "cape",
  "weapon",
  "offhand",
];

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
