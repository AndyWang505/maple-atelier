"use client";

import { useState } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "next-auth/react";

interface NavbarUserMenuProps {
  name: string;
  image?: string;
}

const MENU_PAPER_SX = {
  mt: 1,
  minWidth: 220,
  borderRadius: 2,
  boxShadow: 3,
  overflow: "hidden",
} as const;

export default function NavbarUserMenu({ name, image }: NavbarUserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label={`${name} 的選單`}
      >
        <Avatar src={image} alt={name} sx={{ width: 32, height: 32 }}>
          {name.charAt(0)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { sx: MENU_PAPER_SX },
          list: { sx: { p: 0 } },
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 min-w-0">
          <Avatar src={image} alt={name} sx={{ width: 40, height: 40 }}>
            {name.charAt(0)}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              {name}
            </div>
            <div className="text-xs text-zinc-500">已登入</div>
          </div>
        </div>

        <Divider />

        <MenuItem component={Link} href="/me" onClick={close} sx={{ py: 1.25 }}>
          <ListItemIcon>
            <StyleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>我的衣櫃</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            close();
            void signOut();
          }}
          sx={{ py: 1.25, color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>登出</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
