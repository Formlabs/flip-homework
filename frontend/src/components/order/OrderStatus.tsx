"use client";

import type { OrderStatus } from "@/libs/get-order";

export default function OrderStatus({ order }: { order: OrderStatus }) {
  return (
    <div className="glass p-5 sm:p-6">
      <h1 className="text-2xl font-semibold mb-2 title-gradient">
        Order {order.id}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-300/90">Status:</span>
        <span className="text-xs px-2 py-1 rounded-full bg-zinc-800/70 border border-zinc-700/60 text-zinc-200">
          {order.status}
        </span>
      </div>
      <div className="mt-4 text-xs text-zinc-400">
        You can safely close this page.
      </div>
    </div>
  );
}
