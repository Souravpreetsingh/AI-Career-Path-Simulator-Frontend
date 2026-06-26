import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  count?: number;
}

export function Shimmer({ className, count = 1 }: ShimmerProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'relative overflow-hidden rounded-lg bg-surface-container-low',
            className
          )}
        >
          <div className="shimmer-bg absolute inset-0" />
        </div>
      ))}
    </>
  );
}

export function ShimmerCard() {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <Shimmer className="mb-3 h-4 w-3/4" />
      <Shimmer className="mb-2 h-3 w-full" />
      <Shimmer className="mb-2 h-3 w-5/6" />
      <Shimmer className="h-3 w-1/2" />
    </div>
  );
}

export function ShimmerStatCard() {
  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <Shimmer className="mb-3 h-3 w-20" />
      <Shimmer className="h-8 w-24" />
    </div>
  );
}

export function ShimmerLine({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded bg-surface-container-low', className)}>
      <div className="shimmer-bg absolute inset-0" />
    </div>
  );
}
