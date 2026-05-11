import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

export const SITE_NAME = "Maple Atelier";
export const SITE_NAME_TC = "楓葉工坊";

export const SITE_URL = "https://maple-atelier.org";

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
