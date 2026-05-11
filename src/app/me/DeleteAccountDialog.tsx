"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { deleteAccount } from "@/lib/api/clients/profile";
import { useToast } from "@/components/ToastProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  visibleName: string;
}

export default function DeleteAccountDialog({ open, onClose, visibleName }: Props) {
  const [confirm, setConfirm] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setConfirm("");
  }

  const matches = confirm.trim() === visibleName.trim() && visibleName.trim().length > 0;

  const handleDelete = async () => {
    if (!matches || busy) return;
    setBusy(true);
    try {
      await deleteAccount();
      // JWT cookie 在 client,server delete 後仍要 signOut 清
      await signOut({ redirect: false });
      toast.success("帳號已刪除");
      router.push("/");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "刪除失敗,請稍後再試");
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ color: "error.main" }}>永久刪除帳號</DialogTitle>
      <DialogContent>
        <p className="text-sm text-zinc-700 mb-3 leading-relaxed">
          這個操作會<strong className="text-red-600">永久刪除</strong>:
        </p>
        <ul className="text-sm text-zinc-700 mb-4 list-disc pl-5 space-y-1">
          <li>你的帳號與顯示名稱</li>
          <li>所有儲存的搭配(公開與私密皆無例外)</li>
          <li>所有按過「推」的紀錄</li>
        </ul>
        <p className="text-sm text-zinc-700 mb-3 leading-relaxed">
          資料無法復原。請在下方輸入<strong>「{visibleName}」</strong>以確認:
        </p>
        <TextField
          autoFocus
          fullWidth
          size="small"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={visibleName}
          disabled={busy}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          取消
        </Button>
        <Button
          onClick={handleDelete}
          disabled={!matches || busy}
          color="error"
          variant="contained"
        >
          {busy ? "刪除中..." : "確認刪除"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
