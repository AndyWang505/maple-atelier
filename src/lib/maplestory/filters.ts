import type { MaplestoryClientOptions, Slot } from "@/types/maplestory";
import { base } from "./urls";

export interface SlotFilter {
  overallCategoryFilter: string;
  categoryFilter: string;
  /** 省略 = 抓整個 category。只在整組都要、且總量夠小時這樣用。 */
  subCategoryFilter?: string;
}

/**
 * slot 底下的子分類。武器全撈約 2.7MB,拆成群組讓 ItemPicker 一次只載一組。
 * `id` 會進 catalog cache key,改名等同清空該組快取。
 */
export interface SlotGroup {
  id: string;
  label: string;
  /** 原始 subCategory。中譯撞名時給使用者對照(拳套 Claw / 指虎 Knuckle)。 */
  hint?: string;
  /** 下拉選單的分區標題 */
  section?: string;
  filters: ReadonlyArray<SlotFilter>;
}

const EQUIP = "Equip";
const ONE_H = "One-Handed Weapon";
const TWO_H = "Two-Handed Weapon";
const SECONDARY = "Secondary Weapon";
const ARMOR = "Armor";
const ACCESSORY = "Accessory";
const CHARACTER = "Character";
const MOUNT = "Mount";

/** 單一 subCategory 的群組 */
const sub = (
  category: string,
  subCategory: string,
  label: string,
  section?: string,
): SlotGroup => ({
  id: subCategory,
  label,
  hint: subCategory,
  section,
  filters: [
    {
      overallCategoryFilter: EQUIP,
      categoryFilter: category,
      subCategoryFilter: subCategory,
    },
  ],
});

/** 單一來源的 slot — UI 不顯示切換器 */
const only = (category: string, subCategory: string): SlotGroup => ({
  id: subCategory,
  label: "全部",
  filters: [
    {
      overallCategoryFilter: EQUIP,
      categoryFilter: category,
      subCategoryFilter: subCategory,
    },
  ],
});

/** skin / ear 不打 API,道具是寫死的 */
const STATIC_GROUP: ReadonlyArray<SlotGroup> = [
  { id: "static", label: "全部", filters: [] },
];

const FASHION = "時裝";
const BASIC = "基本武器";
const SPECIAL = "特殊武器";
const OTHER = "其他";

/**
 * 武器子分類全表,排除 `Test Weapon`(15 件測試道具)。
 * `OTHER` 區的 4 項對應台服尚未開放的職業。
 */
const WEAPON_GROUPS: ReadonlyArray<SlotGroup> = [
  // 時裝武器獨立在 Cash 子類,id 1701000+
  sub(ONE_H, "Cash", "時裝武器", FASHION),

  // 劍士
  sub(TWO_H, "Spear", "槍", BASIC),
  sub(TWO_H, "Pole Arm", "矛", BASIC),
  // 法師
  sub(ONE_H, "Wand", "短杖", BASIC),
  sub(ONE_H, "Staff", "長杖", BASIC),
  // 弓箭手
  sub(TWO_H, "Bow", "弓", BASIC),
  sub(TWO_H, "Crossbow", "弩", BASIC),
  // 盜賊
  sub(ONE_H, "Dagger", "短劍", BASIC),
  sub(TWO_H, "Claw", "拳套", BASIC),
  // 海盜
  sub(TWO_H, "Knuckle", "指虎", BASIC),
  sub(TWO_H, "Gun", "火槍", BASIC),
  // 單手 / 雙手通用
  sub(ONE_H, "One-Handed Sword", "單手劍", BASIC),
  sub(ONE_H, "One-Handed Axe", "單手斧", BASIC),
  sub(ONE_H, "One-Handed Blunt Weapon", "單手棍", BASIC),
  sub(TWO_H, "Two-Handed Sword", "雙手劍", BASIC),
  sub(TWO_H, "Two-Handed Axe", "雙手斧", BASIC),
  sub(TWO_H, "Two-Handed Blunt", "雙手棍", BASIC),

  // 劍士
  sub(TWO_H, "Katana", "太刀", SPECIAL),
  sub(ONE_H, "Desperado", "魔劍", SPECIAL),
  {
    // 成對的雙武器,拆兩組沒意義
    id: "Lapis+Lazuli",
    label: "琉／璃",
    hint: "Lapis / Lazuli",
    section: SPECIAL,
    filters: [
      { overallCategoryFilter: EQUIP, categoryFilter: TWO_H, subCategoryFilter: "Lapis" },
      { overallCategoryFilter: EQUIP, categoryFilter: TWO_H, subCategoryFilter: "Lazuli" },
    ],
  },
  sub(TWO_H, "Arm Cannon", "重拳槍", SPECIAL),
  // 法師
  sub(TWO_H, "Fan", "扇子", SPECIAL),
  sub(ONE_H, "Scepter", "幻獸棒", SPECIAL),
  sub(ONE_H, "Shining Rod", "閃亮克魯", SPECIAL),
  sub(ONE_H, "Gauntlet", "魔法護腕", SPECIAL),
  sub(ONE_H, "Psy-limiter", "ESP限制器", SPECIAL),
  // 弓箭手
  sub(TWO_H, "Dual Bowgun", "雙弩槍", SPECIAL),
  // 盜賊
  sub(ONE_H, "Cane", "手杖", SPECIAL),
  sub(ONE_H, "Chain", "鎖鏈", SPECIAL),
  sub(ONE_H, "Whip Blade", "能量劍", SPECIAL),
  // 海盜
  sub(TWO_H, "Hand Cannon", "加農砲", SPECIAL),
  sub(ONE_H, "Soul Shooter", "靈魂射手", SPECIAL),

  sub(TWO_H, "Ancient Bow", "古代之弓", OTHER),
  sub(ONE_H, "Breath Shooter", "龍息射手", OTHER),
  sub(ONE_H, "Bladecaster", "調節器", OTHER),
  // 與 Fan 同名「扇子」,靠 hint 的英文原名區隔
  sub(ONE_H, "Ritual Fan", "扇子", OTHER),
];

const OFFHAND_GROUPS: ReadonlyArray<SlotGroup> = [
  sub(ARMOR, "Shield", "盾牌"),
  sub(ONE_H, "Katara", "雙刀副手"),
  // 整個 category 才 344 件,不需要拆 36 個 subCategory
  {
    id: "Secondary",
    label: "副手道具",
    hint: "Secondary Weapon",
    filters: [{ overallCategoryFilter: EQUIP, categoryFilter: SECONDARY }],
  },
];

/** Slot → 可選子分類。要新增分類只要動這張表。 */
export const SLOT_GROUPS: Record<Slot, ReadonlyArray<SlotGroup>> = {
  hair: [only(CHARACTER, "Hair")],
  face: [only(CHARACTER, "Face")],
  skin: STATIC_GROUP,
  ear: STATIC_GROUP,
  hat: [only(ARMOR, "Hat")],
  faceAccessory: [only(ACCESSORY, "Face Accessory")],
  eyeDecoration: [only(ACCESSORY, "Eye Decoration")],
  earring: [only(ACCESSORY, "Earrings")],
  coat: [only(ARMOR, "Top")],
  pants: [only(ARMOR, "Bottom")],
  overall: [only(ARMOR, "Overall")],
  shoes: [only(ARMOR, "Shoes")],
  cape: [only(ARMOR, "Cape")],
  glove: [only(ARMOR, "Glove")],
  weapon: WEAPON_GROUPS,
  offhand: OFFHAND_GROUPS,
  mount: [only(MOUNT, "Mount")],
};

export const getSlotGroups = (slot: Slot): ReadonlyArray<SlotGroup> =>
  SLOT_GROUPS[slot];

/** 該 slot 預設載入的群組 */
export const defaultGroupId = (slot: Slot): string => SLOT_GROUPS[slot][0].id;

export const findSlotGroup = (slot: Slot, groupId: string): SlotGroup =>
  SLOT_GROUPS[slot].find((g) => g.id === groupId) ?? SLOT_GROUPS[slot][0];

export const buildItemUrl = (
  filter: SlotFilter,
  opts?: MaplestoryClientOptions,
) => {
  const entries: Record<string, string> = {
    overallCategoryFilter: filter.overallCategoryFilter,
    categoryFilter: filter.categoryFilter,
  };
  if (filter.subCategoryFilter) {
    entries.subCategoryFilter = filter.subCategoryFilter;
  }
  return `${base(opts)}/item?${new URLSearchParams(entries).toString()}`;
};
