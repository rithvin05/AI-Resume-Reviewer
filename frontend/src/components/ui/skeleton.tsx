import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  label?: string;
}

function Skeleton({ className, label, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent animate-pulse rounded-md flex items-center justify-center",
        className
      )}
      {...props}
    >
      {label && <span className="text-xl text-black">{label}</span>}
    </div>
  );
}

export { Skeleton };
