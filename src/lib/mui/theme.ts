"use client";

import { createTheme } from "@mui/material/styles";

// 全站 tag chip 統一灰色:邊框 + 文字同色系,中性、不搶 CTA / 愛心紅的注意。
// clickable 版 hover 加深 + 微底色。
export const tagChipSx = {
  borderColor: "#d4d4d8", // zinc-300
  color: "#52525b", // zinc-600
} as const;

export const tagChipClickableSx = {
  ...tagChipSx,
  "&:hover": {
    borderColor: "#a1a1aa", // zinc-400
    backgroundColor: "#fafafa", // zinc-50
  },
} as const;

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#c8423d" },
    secondary: { main: "#e87a4f" },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-sans)",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
});

export default theme;
