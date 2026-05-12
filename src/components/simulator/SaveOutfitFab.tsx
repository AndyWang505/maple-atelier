"use client";

import { useState } from "react";
import Fab from "@mui/material/Fab";
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

interface SaveOutfitFabProps {
  editId: number | null;
}

const FAB_RIGHT = {
  xs: 16,
  md: "max(32px, calc((100vw - 1280px) / 2 + 32px))",
} as const;

export default function SaveOutfitFab({ editId }: SaveOutfitFabProps) {
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
        if (e.status === 429) {
          return { ok: false, error: getApiErrorMessage(e) ?? "已達儲存上限,請刪除舊的搭配" };
        }
        if (e.status === 401) return { ok: false, error: "請先登入再儲存" };
        return { ok: false, error: `儲存失敗(${e.status})` };
      }
      return { ok: false, error: "儲存失敗" };
    }
  };

  return (
    <>
      {editId !== null && (
        <Fab
          color="primary"
          aria-label="儲存搭配"
          title="儲存搭配"
          disabled={saving}
          onClick={() => void handleSave()}
          sx={{
            position: "fixed",
            right: FAB_RIGHT,
            bottom: { xs: 80, md: 96 },
            zIndex: 10,
          }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
        </Fab>
      )}
      <Fab
        color={editId !== null ? "default" : "primary"}
        aria-label="新建搭配"
        title="新建搭配"
        onClick={() => { if (requireAuth()) setOpen(true); }}
        sx={{
          position: "fixed",
          right: FAB_RIGHT,
          bottom: { xs: 16, md: 32 },
          zIndex: 10,
        }}
      >
        <AddIcon />
      </Fab>
      <SaveOutfitDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
