"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import Skeleton from "@mui/material/Skeleton";
import { useSimulator } from "@/store/simulator";
import OutfitCard from "@/components/OutfitCard";
import OutfitCardSkeleton from "@/components/OutfitCardSkeleton";
import { useToast } from "@/components/ToastProvider";
import SaveOutfitDialog, {
  type OutfitFormValues,
  type SubmitResult,
} from "@/components/simulator/SaveOutfitDialog";
import { MAX_OUTFITS_PER_USER } from "@/lib/limits";
import {
  useApiDeleteOutfit,
  useApiMyOutfits,
  useApiTogglePublicOutfit,
  useApiUpdateOutfit,
} from "@/lib/api/hooks/use-api-outfits";
import type { MyOutfitRow } from "@/lib/api/types";

interface Props {
  fallback?: MyOutfitRow[];
}

export default function MyOutfitsList({ fallback }: Props) {
  const { data: rows, error, isLoading } = useApiMyOutfits(fallback);
  const { trigger: triggerDelete, isMutating: deletingPending } = useApiDeleteOutfit();
  const { trigger: triggerToggle } = useApiTogglePublicOutfit();
  const { trigger: triggerUpdate } = useApiUpdateOutfit();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const toast = useToast();
  const loadOutfit = useSimulator((s) => s.loadOutfit);
  const router = useRouter();

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await triggerDelete(id);
      toast.success("已刪除");
    } catch {
      toast.error("刪除失敗");
    }
  };

  const handleTogglePublic = async (row: MyOutfitRow) => {
    try {
      await triggerToggle({ id: row.id, isPublic: !row.isPublic });
    } catch {
      toast.error("更新失敗");
    }
  };

  const handleOpen = (row: MyOutfitRow) => {
    loadOutfit(row.payload);
    router.push("/simulator");
  };

  const handleEditSubmit = async (
    values: OutfitFormValues,
  ): Promise<SubmitResult> => {
    if (editingId === null) return { ok: false, error: "no outfit" };
    try {
      await triggerUpdate({ id: editingId, body: values });
      toast.success("已更新");
      return { ok: true };
    } catch {
      toast.error("更新失敗");
      return { ok: false, error: "更新失敗" };
    }
  };

  const editing =
    editingId !== null ? rows?.find((r) => r.id === editingId) : undefined;
  const deleteTarget =
    deleteTargetId !== null ? rows?.find((r) => r.id === deleteTargetId) : undefined;

  if (error) return <p className="text-red-600">載入失敗</p>;
  if (isLoading || !rows) {
    return (
      <>
        <Skeleton variant="text" width={140} height={20} className="mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <OutfitCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p>還沒有儲存任何搭配。</p>
        <Button href="/simulator" variant="contained" sx={{ mt: 2 }}>
          去模擬器
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-500 mb-3">
        已儲存{" "}
        <span
          className={
            rows.length >= MAX_OUTFITS_PER_USER
              ? "font-semibold text-amber-600"
              : "font-semibold text-zinc-700"
          }
        >
          {rows.length}
        </span>{" "}
        / {MAX_OUTFITS_PER_USER} 套
        {rows.length >= MAX_OUTFITS_PER_USER && "(已達上限,刪除舊的才能儲存新搭配)"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {rows.map((row) => (
          <OutfitCard
            key={row.id}
            outfit={row}
            actions={
              <>
                <div
                  className="flex items-center gap-1.5 text-sm font-semibold text-maple-red"
                  title="他人在公開瀏覽時推的數量"
                >
                  <FavoriteIcon fontSize="small" sx={{ color: "inherit" }} />
                  <span className="tabular-nums">{row.upvotes}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <label className="flex items-center gap-1">
                    <Switch
                      size="small"
                      checked={row.isPublic}
                      onChange={() => void handleTogglePublic(row)}
                    />
                    <span
                      className={
                        row.isPublic ? "text-emerald-600" : "text-zinc-500"
                      }
                    >
                      {row.isPublic ? "公開" : "私密"}
                    </span>
                  </label>
                  <div className="flex">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(row)}
                      aria-label="載入到模擬器"
                      title="載入到模擬器"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setEditingId(row.id)}
                      aria-label="編輯"
                      title="編輯標題 / 標籤 / 公開"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTargetId(row.id)}
                      aria-label="刪除"
                      title="刪除"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              </>
            }
          />
        ))}
      </div>

      {editing && (
        <SaveOutfitDialog
          key={editing.id}
          open
          onClose={() => setEditingId(null)}
          dialogTitle="編輯搭配"
          submitLabel="更新"
          initial={{
            title: editing.title,
            description: editing.description ?? "",
            tags: editing.tags ?? [],
            isPublic: editing.isPublic,
          }}
          onSubmit={handleEditSubmit}
        />
      )}

      <Dialog
        open={deleteTargetId !== null}
        onClose={() => !deletingPending && setDeleteTargetId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>刪除搭配</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ overflowWrap: "anywhere" }}>
            刪除後將無法還原，確定要刪除「
            <strong className="text-zinc-900">{deleteTarget?.title}</strong>
            」嗎?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTargetId(null)}
            disabled={deletingPending}
            color="inherit"
          >
            取消
          </Button>
          <Button
            onClick={() => void handleConfirmDelete()}
            loading={deletingPending}
            variant="contained"
            color="error"
          >
            刪除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
