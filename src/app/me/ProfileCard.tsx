"use client";

import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ProfileEditDialog from "./ProfileEditDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";

interface ProfileCardProps {
  name: string | null;
  image: string | null;
  displayName: string | null;
}

export default function ProfileCard({
  name,
  image,
  displayName: initialDisplayName,
}: ProfileCardProps) {
  const [displayName, setDisplayName] = useState<string | null>(
    initialDisplayName,
  );
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const visibleName = displayName ?? name ?? "(no name)";
  const isCustom = displayName !== null;
  const menuOpen = Boolean(anchorEl);

  const closeMenu = () => setAnchorEl(null);

  const onEditClick = () => {
    closeMenu();
    setEditing(true);
  };
  const onDeleteClick = () => {
    closeMenu();
    setDeleting(true);
  };

  return (
    <>
      <div className="rounded-2xl bg-white border border-zinc-200 px-5 py-4 mb-6 sm:mb-8 flex items-center gap-4">
        <Avatar
          src={image ?? undefined}
          alt={visibleName}
          sx={{ width: 56, height: 56 }}
        >
          {visibleName.charAt(0)}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-zinc-500">公開顯示名稱</div>
          <div className="font-semibold truncate">{visibleName}</div>
          <div className="text-xs text-zinc-400 mt-0.5">
            {isCustom
              ? "自訂（其他楓友會看到的名字）"
              : "目前沿用 Discord 名稱；若不希望被公開可透過設定自訂顯示名稱"}
          </div>
        </div>
        <Button
          startIcon={<SettingsOutlinedIcon />}
          endIcon={<ExpandMoreIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          設定
        </Button>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem onClick={onEditClick}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>編輯顯示名稱</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={onDeleteClick}
          sx={{
            color: "error.main",
            "& .MuiListItemIcon-root": { color: "error.main" },
          }}
        >
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>刪除帳號</ListItemText>
        </MenuItem>
      </Menu>

      <ProfileEditDialog
        open={editing}
        onClose={() => setEditing(false)}
        currentDisplayName={displayName}
        discordName={name}
        onUpdated={setDisplayName}
      />
      <DeleteAccountDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        visibleName={visibleName}
      />
    </>
  );
}
