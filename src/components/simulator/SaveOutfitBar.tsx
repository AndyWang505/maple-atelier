"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useSession } from "next-auth/react";
import { useSimulator } from "@/store/simulator";
import { toOutfitPayload } from "@/lib/outfit-payload";
import { useToast } from "@/components/ToastProvider";
import {
  useApiCreateOutfit,
  useApiUpdateOutfit,
} from "@/lib/api/hooks/use-api-outfits";
import { ApiError, getApiErrorMessage } from "@/lib/api/fetcher";
import SaveOutfitDialog, {
  type OutfitFormValues,
  type SubmitResult,
} from "./SaveOutfitDialog";

interface SaveOutfitBarProps {
  editId: number | null;
}

export default function SaveOutfitBar({ editId }: SaveOutfitBarProps) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { trigger: createOutfit } = useApiCreateOutfit();
  const { trigger: updateOutfit } = useApiUpdateOutfit();
  const equipped = useSimulator((s) => s.equipped);
  const stanceId = useSimulator((s) => s.stanceId);
  const animated = useSimulator((s) => s.animated);
  const expression = useSimulator((s) => s.expression);

  if (status === "loading") return null;

  const requireAuth = () => {
    if (status !== "authenticated") {
      toast.info("需要登入後才能進行儲存搭配");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!requireAuth() || editId === null) return;
    setSaving(true);
    try {
      await updateOutfit({
        id: editId,
        body: { payload: toOutfitPayload(equipped, stanceId, animated, expression) },
      });
      toast.success("已儲存");
    } catch {
      toast.error("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (values: OutfitFormValues): Promise<SubmitResult> => {
    try {
      await createOutfit({
        ...values,
        payload: toOutfitPayload(equipped, stanceId, animated, expression),
      });
      toast.success("已加入衣櫃");
      return { ok: true };
    } catch (e) {
      toast.error("儲存失敗");
      if (e instanceof ApiError) {
        if (e.status === 429)
          return { ok: false, error: getApiErrorMessage(e) ?? "已達儲存上限,請刪除舊的搭配" };
        if (e.status === 401) return { ok: false, error: "請先登入再儲存" };
        return { ok: false, error: `儲存失敗(${e.status})` };
      }
      return { ok: false, error: "儲存失敗" };
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-white shadow-sm p-3 flex flex-col gap-2">
        {editId !== null && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            disabled={saving}
            onClick={() => void handleSave()}
          >
            儲存搭配
          </Button>
        )}
        <Button
          fullWidth
          variant={editId !== null ? "outlined" : "contained"}
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => { if (requireAuth()) setOpen(true); }}
        >
          {editId !== null ? "另存新建" : "新增到衣櫃"}
        </Button>
      </div>
      <SaveOutfitDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
