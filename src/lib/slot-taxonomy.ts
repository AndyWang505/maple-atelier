import type { Slot } from "@/types/maplestory";

export const SLOT_LABELS: Record<Slot, string> = {
  hair: "髮型",
  face: "臉型",
  skin: "膚色",
  ear: "耳朵",
  hat: "帽子",
  faceAccessory: "臉飾",
  eyeDecoration: "眼飾",
  earring: "耳環",
  overall: "套服",
  coat: "上衣",
  pants: "褲子",
  shoes: "鞋子",
  glove: "手套",
  cape: "披風",
  weapon: "武器",
  offhand: "副手",
  mount: "坐騎",
};

const APPEARANCE_SLOTS: ReadonlyArray<Slot> = ["hair", "face", "skin", "ear"];
const EQUIPMENT_SLOTS: ReadonlyArray<Slot> = [
  "hat",
  "faceAccessory",
  "eyeDecoration",
  "earring",
  "coat",
  "pants",
  "overall",
  "shoes",
  "glove",
  "cape",
  "weapon",
  "offhand",
];
const MOUNT_SLOTS: ReadonlyArray<Slot> = ["mount"];

export const SLOT_SECTIONS = [
  { id: "appearance", title: "外觀", slots: APPEARANCE_SLOTS },
  { id: "equipment", title: "裝備", slots: EQUIPMENT_SLOTS },
  { id: "mount", title: "坐騎", slots: MOUNT_SLOTS },
] as const;

export type SlotCategory = (typeof SLOT_SECTIONS)[number]["id"];
