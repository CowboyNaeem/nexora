import ProductCardSkeleton from "./ProductCardSkeleton";

type ProductGridSkeletonProps = {
  count?: number;
  className?: string;
};

export default function ProductGridSkeleton({
  count = 6,
  className = "",
}: ProductGridSkeletonProps) {
  return (
    <div
      aria-label="Loading products"
      className={`grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}