import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

export const SITE_NAME = "Maple Atelier";
export const SITE_NAME_TC = "楓葉工坊";

export const SITE_URL = "https://maple-atelier.org";

// 用於 metadata：含完整品牌名 + 關鍵字組合，因為搜尋結果不含本站視覺。
// 「楓之谷工具」是定位錨點 — 強調本站是「工具」,不直接 claim 為遊戲本身,規避商標誤用。
export const SITE_DESCRIPTION =
  "楓葉工坊 (Maple Atelier) — 楓之谷時裝搭配社群工具，即時試穿與儲存造型，與其他楓友分享、瀏覽彼此的搭配。";

// 用於頁面內可見處(如首頁 hero)：略掉品牌名,因為視覺上已經出現
export const SITE_TAGLINE =
  "楓之谷時裝搭配社群工具，即時試穿與儲存造型，與其他楓友分享、瀏覽彼此的搭配。";

// 用於 metadata.keywords。Google 不看,但 Bing / Yandex / 內部搜尋系統會用;
// 也順便當文件,讓未來編輯文案的人知道目標關鍵字組合。
// 刻意不放 standalone 「楓之谷 / 新楓之谷 / MapleStory」 — 走「楓之谷工具 / 楓之谷紙娃娃」這類「工具」定位的複合詞,避免商標混淆風險。
export const SITE_KEYWORDS = [
  "楓葉工坊",
  "Maple Atelier",
  "楓之谷工具",
  "楓之谷時裝",
  "楓之谷紙娃娃",
  "紙娃娃",
  "紙娃娃模擬器",
  "時裝搭配",
  "楓之谷時裝參考",
  "楓之谷外觀參考",
  "楓之谷造型",
  "楓之谷模擬器",
] as const;

export const SITE_LINKS = {
  github: "https://github.com/AndyWang505/maple-atelier",
  email: "andywang890505@gmail.com",
  sponsor: "https://ko-fi.com/andywang890505",
} as const;

export interface NavLink {
  href: string;
  label: string;
  Icon: SvgIconComponent;
}

export const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: "/simulator", label: "模擬器", Icon: BrushOutlinedIcon },
  { href: "/explore", label: "探索", Icon: ExploreOutlinedIcon },
  { href: "/about", label: "關於本站", Icon: InfoOutlinedIcon },
];
