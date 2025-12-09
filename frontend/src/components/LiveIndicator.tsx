"use client";

export function LiveIndicator({ isLive = true }: { isLive?: boolean }) {
  if (!isLive) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </div>
      <span className="text-xs text-green-400 font-medium">Live</span>
    </div>
  );
}

export function UpdatingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
      <span className="text-xs text-blue-400 font-medium">Updating...</span>
    </div>
  );
}





