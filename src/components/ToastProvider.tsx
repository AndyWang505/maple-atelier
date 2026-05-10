"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import TopRightToast, { type ToastState } from "./TopRightToast";

interface ToastApi {
  show: (state: ToastState) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * 全域 toast 鉤子。掛在 ToastProvider 子樹下任何 client 元件都能呼叫。
 * 同時間只有一條 toast(後者覆蓋前者),避免多個 Snackbar 視覺重疊。
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((state: ToastState) => setToast(state), []);
  const success = useCallback(
    (message: string) => setToast({ severity: "success", message }),
    [],
  );
  const error = useCallback(
    (message: string) => setToast({ severity: "error", message }),
    [],
  );
  const info = useCallback(
    (message: string) => setToast({ severity: "info", message }),
    [],
  );

  const api = useMemo<ToastApi>(
    () => ({ show, success, error, info }),
    [show, success, error, info],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <TopRightToast toast={toast} onClose={() => setToast(null)} />
    </ToastContext.Provider>
  );
}
