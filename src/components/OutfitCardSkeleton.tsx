import Skeleton from "@mui/material/Skeleton";

// height via MUI prop — Skeleton's inline style overrides Tailwind classNames.
export default function OutfitCardSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden">
      <Skeleton variant="rectangular" height={320} sx={{ width: "100%" }} />
      <div className="p-3">
        <Skeleton variant="text" width="70%" sx={{ fontSize: "0.875rem" }} />
      </div>
    </div>
  );
}
