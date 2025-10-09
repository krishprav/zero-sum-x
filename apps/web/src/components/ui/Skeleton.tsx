import { cn } from '../../utils/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-800/50",
        className
      )}
    >
      {children}
    </div>
  );
}
