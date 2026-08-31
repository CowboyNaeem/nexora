import Skeleton from "@/components/loading/Skeleton";

export default function ProductDetailsLoading() {
  return (
    <div className="min-h-screen bg-[#070709] pb-28 text-white">
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070709]/90 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex h-[62px] items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-xl" />

          <Skeleton className="h-4 w-24 rounded" />

          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE CONTENT
      ===================================================== */}

      <main className="lg:hidden">
        {/* Product image */}
        <section className="px-4 pt-4">
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025]">
            <Skeleton className="aspect-square w-full" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.05] blur-[80px]" />

            <Skeleton className="absolute left-4 top-4 h-7 w-14 rounded-full" />

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/[0.07] bg-black/40 px-2.5 py-1.5">
              <Skeleton className="h-1.5 w-5 rounded-full" />
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
            </div>
          </div>

          {/* thumbnails */}
          <div className="mt-3 flex gap-2.5 overflow-hidden pb-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[68px] w-[68px] shrink-0 rounded-xl"
              />
            ))}
          </div>
        </section>

        {/* Product information */}
        <section className="px-4 pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-2.5 w-20 rounded" />
            <Skeleton className="h-2.5 w-14 rounded" />
          </div>

          <Skeleton className="mt-3 h-8 w-[88%] rounded-xl" />

          <Skeleton className="mt-2.5 h-3 w-28 rounded" />

          {/* Rating */}
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>

          {/* Price */}
          <div className="mt-5 flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </section>

        {/* Description */}
        <section className="mx-4 mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <Skeleton className="h-2.5 w-28 rounded" />

          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-[94%] rounded" />
            <Skeleton className="h-3 w-[78%] rounded" />
          </div>
        </section>

        {/* SKU / Brand */}
        <section className="mx-4 mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <Skeleton className="h-2.5 w-8 rounded" />
            <Skeleton className="mt-2 h-3 w-[75%] rounded" />
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <Skeleton className="h-2.5 w-10 rounded" />
            <Skeleton className="mt-2 h-3 w-[70%] rounded" />
          </div>
        </section>

        {/* Trust */}
        <section className="mx-4 mt-6 grid grid-cols-3 divide-x divide-white/[0.07] border-y border-white/[0.07] py-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={`px-3 ${
                index === 0 ? "pl-0" : ""
              } ${index === 2 ? "pr-0" : ""}`}
            >
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3.5 w-3.5 rounded" />
                <Skeleton className="h-2.5 w-12 rounded" />
              </div>

              <Skeleton className="mt-1 h-2 w-[80%] rounded" />
            </div>
          ))}
        </section>
      </main>

      {/* =====================================================
          DESKTOP CONTENT
      ===================================================== */}

      <main className="hidden min-h-screen bg-black text-white lg:block">
        <div className="mx-auto max-w-[1400px] px-5 pb-20 pt-8 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2">
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-3 w-2 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-2 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>

          {/* Main product section */}
          <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-16">
            {/* Image */}
            <div>
              <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025]">
                <Skeleton className="aspect-[4/3] w-full" />
              </div>

              {/* thumbnails */}
              <div className="mt-4 flex gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-20 w-20 shrink-0 rounded-xl"
                  />
                ))}
              </div>
            </div>

            {/* Information */}
            <div className="flex flex-col justify-center">
              <Skeleton className="h-3 w-24 rounded" />

              <Skeleton className="mt-3 h-12 w-[90%] max-w-xl rounded-xl" />

              <Skeleton className="mt-3 h-4 w-32 rounded" />

              {/* Rating */}
              <div className="mt-6 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>

              <div className="my-7 h-px bg-white/[0.07]" />

              {/* Price */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>

              {/* Description */}
              <div className="mt-6 max-w-xl space-y-2">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-[92%] rounded" />
                <Skeleton className="h-3 w-[70%] rounded" />
              </div>

              {/* Availability / SKU */}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <Skeleton className="h-2.5 w-20 rounded" />
                  <Skeleton className="mt-2 h-4 w-24 rounded" />
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <Skeleton className="h-2.5 w-8 rounded" />
                  <Skeleton className="mt-2 h-4 w-28 rounded" />
                </div>
              </div>

              {/* Cart action */}
              <Skeleton className="mt-6 h-12 w-full rounded-xl" />

              {/* Trust */}
              <div className="mt-8 grid grid-cols-3 border-t border-white/[0.07] pt-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`${
                      index > 0
                        ? "border-l border-white/[0.07] pl-4"
                        : ""
                    }`}
                  >
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="mt-2 h-2.5 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Product details */}
          <section className="mt-20 border-t border-white/[0.07] pt-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
              <div>
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="mt-3 h-8 w-72 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <Skeleton className="h-2.5 w-16 rounded" />
                  <Skeleton className="mt-3 h-4 w-24 rounded" />
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <Skeleton className="h-2.5 w-12 rounded" />
                  <Skeleton className="mt-3 h-4 w-24 rounded" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          MOBILE FIXED ACTION BAR
      ===================================================== */}

      <div className="fixed bottom-[64px] left-0 right-0 z-40 border-t border-white/[0.07] bg-[#09090c]/95 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <Skeleton className="h-12 w-[90px] rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>

      {/* =====================================================
          GLOBAL MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-[#08080b]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+7px)] pt-2 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-around">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5"
            >
              <Skeleton className="h-[18px] w-[18px] rounded-md" />
              <Skeleton className="h-2 w-8 rounded" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}