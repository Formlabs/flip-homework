import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "text-xs px-2 py-1 rounded-full border",
  {
    variants: {
      status: {
        complete: "bg-green-900/30 border-green-700/60 text-green-200",
        failed: "bg-red-900/30 border-red-700/60 text-red-200",
        printing: "bg-blue-900/30 border-blue-700/60 text-blue-200",
        queued: "bg-zinc-800/70 border-zinc-700/60 text-zinc-200",
      },
    },
    defaultVariants: {
      status: "queued",
    },
  }
);

export type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  children: React.ReactNode;
  className?: string;
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {children}
    </span>
  );
}

