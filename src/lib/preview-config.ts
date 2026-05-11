export const ZOOM_LEVELS = [1, 1.5, 2] as const;

export const BG_OPTIONS = [
  { id: "none", label: "無" },
  { id: "light", label: "淺" },
  { id: "dark", label: "深" },
] as const;

export type BgId = (typeof BG_OPTIONS)[number]["id"];

export const STAND_STANCES = [
  { id: "stand1", label: "單手站立" },
  { id: "stand2", label: "雙手站立" },
] as const;

export const BASIC_STANCES = [
  { id: "walk1", label: "行走 (1)" },
  { id: "walk2", label: "行走 (2)" },
  { id: "jump", label: "跳躍" },
  { id: "fly", label: "飛行" },
  { id: "ladder", label: "爬梯" },
  { id: "rope", label: "爬繩" },
  { id: "prone", label: "趴下" },
  { id: "proneStab", label: "趴姿突刺" },
  { id: "sit", label: "坐下" },
  { id: "alert", label: "警戒" },
] as const;

// 標籤慣例:swing* / stab* 數字是 frame index(1/2/3 是同動畫的不同幀),
// shoot* 後綴是武器類別(拳 / 弓 / 槍),不是同一動作的不同幀。
/**
 * maplestory.io 的 face item 內建表情 frame,透過 `animationName` 帶進 item entry。
 */
export interface ExpressionDef {
  /** maplestory.io animationName value */
  id: string;
  label: string;
  isCash?: boolean;
}

export const EXPRESSIONS: ReadonlyArray<ExpressionDef> = [
  { id: "default", label: "預設" },
  { id: "smile", label: "微笑" },
  { id: "troubled", label: "困擾" },
  { id: "cry", label: "哭" },
  { id: "angry", label: "生氣" },
  { id: "hit", label: "受傷" },
  { id: "bewildered", label: "困惑" },
  { id: "stunned", label: "呆滯" },
  { id: "hum", label: "哼", isCash: true },
  { id: "despair", label: "絕望", isCash: true },
  { id: "oops", label: "糟糕", isCash: true },
  { id: "vomit", label: "嘔吐", isCash: true },
  { id: "bowing", label: "鞠躬", isCash: true },
  { id: "dam", label: "可惡", isCash: true },
  { id: "pain", label: "痛苦", isCash: true },
  { id: "hot", label: "怒火", isCash: true },
  { id: "cheers", label: "歡呼", isCash: true },
  { id: "wink", label: "眨眼", isCash: true },
  { id: "blaze", label: "燃燒", isCash: true },
  { id: "chu", label: "親親", isCash: true },
  { id: "shine", label: "閃耀", isCash: true },
  { id: "glitter", label: "閃亮", isCash: true },
  { id: "love", label: "愛心", isCash: true },
  { id: "qBlue", label: "Q Blue", isCash: true },
];

export const DEFAULT_EXPRESSION = "default";

export const ATTACK_STANCES = [
  { id: "swingO1", label: "單手揮砍 (1)" },
  { id: "swingO2", label: "單手揮砍 (2)" },
  { id: "swingO3", label: "單手揮砍 (3)" },
  { id: "swingOF", label: "單手揮砍 (上)" },
  { id: "swingT1", label: "雙手揮砍 (1)" },
  { id: "swingT2", label: "雙手揮砍 (2)" },
  { id: "swingT3", label: "雙手揮砍 (3)" },
  { id: "swingTF", label: "雙手揮砍 (上)" },
  { id: "swingP1", label: "槍類揮砍 (1)" },
  { id: "swingP2", label: "槍類揮砍 (2)" },
  { id: "swingP3", label: "槍類揮砍 (3)" },
  { id: "stabO1", label: "單手突刺 (1)" },
  { id: "stabO2", label: "單手突刺 (2)" },
  { id: "stabT1", label: "雙手突刺 (1)" },
  { id: "stabT2", label: "雙手突刺 (2)" },
  { id: "shoot1", label: "射擊 (拳)" },
  { id: "shoot2", label: "射擊 (弓)" },
  { id: "shootF", label: "射擊 (槍)" },
] as const;

const BG_CARD_CLASS: Record<BgId, string> = {
  none: "bg-white/70",
  light: "bg-white/90",
  dark: "bg-zinc-800/75",
};

export const getCardBgClass = (id: BgId): string => BG_CARD_CLASS[id];

/** 深背景下 Select 的反白配色 */
export const DARK_SELECT_SX = {
  color: "white",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  "& .MuiSelect-icon": { color: "rgba(255, 255, 255, 0.7)" },
} as const;

/** 深背景下 ToggleButton 的反白配色,套到所有 toggle 元件 */
export const DARK_TOGGLE_SX = {
  color: "rgba(255, 255, 255, 0.85)",
  borderColor: "rgba(255, 255, 255, 0.3)",
  "&:hover": {
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  "&.Mui-selected": {
    color: "white",
    backgroundColor: "rgba(200, 66, 61, 0.45)",
    borderColor: "rgba(200, 66, 61, 0.9)",
    "&:hover": {
      backgroundColor: "rgba(200, 66, 61, 0.6)",
    },
  },
} as const;
