"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressBgVariants = cva(
  "h-2 rounded-full border overflow-hidden",
  {
    variants: {
      status: {
        complete: "bg-green-500/20 border-green-500/40",
        failed: "bg-red-500/20 border-red-500/40",
        printing: "bg-blue-500/20 border-blue-500/40",
        queued: "bg-zinc-700/20 border-zinc-700/40",
      },
    },
    defaultVariants: {
      status: "queued",
    },
  }
);

const progressBarVariants = cva(
  "h-full transition-all duration-500 ease-out",
  {
    variants: {
      status: {
        complete: "bg-gradient-to-r from-green-500 to-green-400",
        failed: "bg-gradient-to-r from-red-500 to-red-400",
        printing: "bg-gradient-to-r from-blue-500 to-blue-400",
        queued: "bg-gradient-to-r from-zinc-500 to-zinc-400",
      },
    },
    defaultVariants: {
      status: "queued",
    },
  }
);

type StatusVariant = VariantProps<typeof progressBgVariants>["status"];

interface ProgressBarProps {
  progress: number;
  status: string;
  className?: string;
}

export function ProgressBar({ progress, status, className }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const statusVariant = status as StatusVariant;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">Progress</span>
        <span className="font-medium text-zinc-200">{clampedProgress}%</span>
      </div>
      <div className={progressBgVariants({ status: statusVariant })}>
        <div
          className={progressBarVariants({ status: statusVariant })}
          style={{ width: `${clampedProgress}%` }}
        >
          {status === "printing" && clampedProgress > 0 && clampedProgress < 100 && (
            <div className="h-full w-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
