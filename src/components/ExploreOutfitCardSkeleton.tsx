import Skeleton from "@mui/material/Skeleton";

// 對齊 ExploreOutfitCard:aspect-square 圖區 + 直排 skeleton 資訊區。
export default function ExploreOutfitCardSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden">
      <div className="aspect-square">
        <Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />
      </div>
      <div className="p-3 space-y-2">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}
