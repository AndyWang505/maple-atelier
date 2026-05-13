import type { ReactNode } from "react";

type Width = "wide" | "content";

const MAX_WIDTH: Record<Width, string> = {
  wide: "max-w-7xl",
  content: "max-w-3xl",
};

interface PageShellProps {
  /** @default "wide" */
  width?: Width;
  /** 補充的 className(例如首頁的 space-y-14)。注意不要再放 padding-y,會跟內建衝突 */
  className?: string;
  children: ReactNode;
}

export default function PageShell({
  width = "wide",
  className = "",
  children,
}: PageShellProps) {
  return (
    <div
      className={`container mx-auto ${MAX_WIDTH[width]} px-4 py-6 sm:py-8 ${className}`.trimEnd()}
    >
      {children}
    </div>
  );
}
