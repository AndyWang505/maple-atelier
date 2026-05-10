export const SLOTS = [
  "hair",
  "face",
  "skin",
  "ear",
  "hat",
  "faceAccessory",
  "eyeDecoration",
  "earring",
  "overall",
  "coat",
  "pants",
  "shoes",
  "cape",
  "weapon",
  "offhand",
  "mount",
] as const;

export type Slot = (typeof SLOTS)[number];

export type Gender = "male" | "female";

export interface MaplestoryClientOptions {
  region?: string;
  version?: string;
}

/** maplestory.io /item 帶回、UI 端真正會用到的欄位 */
export interface CatalogItem {
  id: number;
  name: string;
  slot: Slot;
  isCash: boolean;
  /** maplestory.io 約定:0 = male, 1 = female, 2 = unisex */
  requiredGender: number;
  /**
   * 跨 region 渲染用。maplestory.io 的 /character 接受 per-item region/version
   * override,讓 KMS 角色也能戴上 JMS-only 的時裝。skin 條目大量利用此特性。
   * 一般從 TWMS 抓的 item 不需要設(走全域 region)。
   */
  region?: string;
  version?: string;
}

/** /api/wz 帶回的可用 region / version */
export interface RegionInfo {
  region: string;
  version: string;
}
