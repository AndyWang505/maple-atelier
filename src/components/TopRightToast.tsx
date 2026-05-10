"use client";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide, { type SlideProps } from "@mui/material/Slide";

export interface ToastState {
  severity: "success" | "error" | "info";
  message: string;
}

interface TopRightToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

function SlideDown(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

/**
 * 通用「從頭像下方掉下來」的 toast。
 * 位置統一(top + 對齊 max-w-7xl 容器右側)、動畫統一(SlideDown)、
 * Snackbar 在 toast=null 時還在 mount 期播放離場動畫,所以給個 span fallback。
 */
export default function TopRightToast({ toast, onClose }: TopRightToastProps) {
  return (
    <Snackbar
      open={!!toast}
      autoHideDuration={2500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      slots={{ transition: SlideDown }}
      sx={{
        top: { xs: 64, sm: 72 },
        right: {
          xs: 16,
          md: "max(16px, calc((100vw - 1280px) / 2 + 16px))",
        },
      }}
    >
      {toast ? (
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={onClose}
          sx={{ boxShadow: 3 }}
        >
          {toast.message}
        </Alert>
      ) : (
        <span />
      )}
    </Snackbar>
  );
}
