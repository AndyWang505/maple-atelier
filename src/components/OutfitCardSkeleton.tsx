import Skeleton from "@mui/material/Skeleton";

// 對齊 OutfitCard:p-3 外殼 + h-56 圖區 + 直排 skeleton 資訊區。
export default function OutfitCardSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-zinc-200 p-3 flex flex-col gap-2">
      <Skeleton variant="rounded" height={224} sx={{ width: "100%" }} />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
}
