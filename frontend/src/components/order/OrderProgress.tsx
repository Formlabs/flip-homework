"use client";

import type { OrderProgress } from "@/libs/get-order";

export default function OrderProgress({
  progress,
}: {
  progress: OrderProgress;
}) {
  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex items-center gap-3 ">
        <span className="text-sm text-zinc-300/90">Progress:</span>
        <span className="text-xs px-2 py-1 rounded-full bg-zinc-800/70 border border-zinc-700/60 text-zinc-200">
          {progress.progress}
        </span>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress.progress}%` }}
          ></div>
        </div>
        <span className="text-sm text-zinc-300/90">Updated:</span>
        <span className="text-xs px-2 py-1 rounded-full bg-zinc-800/70 border border-zinc-700/60 text-zinc-200">
          {progress.timestamp}
        </span>
      </div>
    </div>
  );
}
