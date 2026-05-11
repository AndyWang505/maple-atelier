"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useApiUpdateProfile } from "@/lib/api/hooks/use-api-profile";
import { useToast } from "@/components/ToastProvider";
import { DISPLAY_NAME_MAX_LEN } from "@/lib/limits";
import { getApiErrorMessage } from "@/lib/api/fetcher";

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  currentDisplayName: string | null;
  discordName: string | null;
  onUpdated: (next: string | null) => void;
}

export default function ProfileEditDialog({
  open,
  onClose,
  currentDisplayName,
  discordName,
  onUpdated,
}: ProfileEditDialogProps) {
  const [value, setValue] = useState(currentDisplayName ?? "");
  const [wasOpen, setWasOpen] = useState(open);
  const { trigger, isMutating } = useApiUpdateProfile();
  const toast = useToast();

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setValue(currentDisplayName ?? "");
  }

  const trimmed = value.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= DISPLAY_NAME_MAX_LEN;
  const canSave = isValid && trimmed !== (currentDisplayName ?? "");

  const submit = async (next: string | null) => {
    try {
      const result = await trigger({ displayName: next });
      onUpdated(result.displayName);
      toast.success(next === null ? "已改回 Discord 名稱" : "已更新顯示名稱");
      onClose();
    } catch (e) {
      const apiMsg = getApiErrorMessage(e);
      toast.error(apiMsg ?? (e instanceof Error ? e.message : "更新失敗"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>編輯顯示名稱</DialogTitle>
      <DialogContent>
        <p className="text-sm text-zinc-500 mb-2 leading-relaxed">
          這是其他楓友在你公開的搭配上看到的名字。Discord 帳號 ID 不會被展示。
        </p>
        <p className="text-xs text-zinc-400 mb-4">
          為避免身份混淆，每週最多可修改 3 次。
        </p>
        <TextField
          autoFocus
          fullWidth
          label="顯示名稱"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          slotProps={{ htmlInput: { maxLength: DISPLAY_NAME_MAX_LEN } }}
          helperText={`${trimmed.length} / ${DISPLAY_NAME_MAX_LEN}`}
          disabled={isMutating}
        />
        {currentDisplayName !== null && (
          <button
            type="button"
            onClick={() => void submit(null)}
            disabled={isMutating}
            className="mt-3 text-sm text-zinc-500 underline hover:text-maple-red disabled:opacity-50"
          >
            還原為 Discord 名稱{discordName ? ` (${discordName})` : ""}
          </button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isMutating}>
          取消
        </Button>
        <Button
          onClick={() => void submit(trimmed)}
          variant="contained"
          disabled={!canSave || isMutating}
        >
          儲存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
