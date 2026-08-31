import Skeleton from "./Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018]"
    >
      <Skeleton className="aspect-square w-full" />

      <div className="space-y-2.5 p-3.5">
        <Skeleton className="h-2.5 w-16 rounded" />
        <Skeleton className="h-3.5 w-[78%] rounded" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-12 rounded" />
          <Skeleton className="h-2.5 w-10 rounded" />
        </div>

        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  );
}