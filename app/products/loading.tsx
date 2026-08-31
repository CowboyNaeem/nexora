import ProductCardSkeleton from "@/components/loading/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
      {/* Mobile loading header */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080a0f]/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-md items-center justify-between px-4">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-white/[0.055]" />

            <div className="h-4 w-24 animate-pulse rounded bg-white/[0.055]" />

            <div className="h-9 w-9 animate-pulse rounded-full bg-white/[0.055]" />
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        {/* Heading */}
        <div className="max-w-2xl">
          <div className="h-3 w-20 animate-pulse rounded bg-white/[0.055]" />

          <div className="mt-3 h-9 w-56 animate-pulse rounded-xl bg-white/[0.06] sm:h-10 sm:w-72" />

          <div className="mt-3 space-y-2">
            <div className="h-3 w-full max-w-xl animate-pulse rounded bg-white/[0.045]" />
            <div className="h-3 w-4/5 max-w-md animate-pulse rounded bg-white/[0.045]" />
          </div>
        </div>

        {/* Search / controls */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="h-12 flex-1 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025]" />

          <div className="h-12 w-full animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025] sm:w-32" />

          <div className="h-12 w-full animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025] sm:w-32" />
        </div>

        {/* Category chips */}
        <div className="mt-6 flex gap-2 overflow-hidden">
          <div className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-white/[0.045]" />
          <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-white/[0.045]" />
          <div className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-white/[0.045]" />
          <div className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-white/[0.045]" />
          <div className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-white/[0.045]" />
        </div>

        {/* Products */}
        <div className="mt-8">
          <ProductCardSkeletonGrid />
        </div>
      </div>

      {/* Mobile bottom navigation placeholder */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-[#080a0f]/95 px-4 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <BottomNavSkeleton />
          <BottomNavSkeleton />
          <BottomNavSkeleton />
          <BottomNavSkeleton />
          <BottomNavSkeleton />
        </div>
      </div>
    </main>
  );
}

function ProductCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

function BottomNavSkeleton() {
  return (
    <div className="flex w-14 flex-col items-center gap-1.5">
      <div className="h-5 w-5 animate-pulse rounded-md bg-white/[0.05]" />
      <div className="h-2 w-8 animate-pulse rounded bg-white/[0.04]" />
    </div>
  );
}