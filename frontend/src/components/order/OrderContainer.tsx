"use client";

import { getOrder, type Order } from "@/libs/get-order";
import OrderProgress from "./OrderProgress";
import OrderStatus from "./OrderStatus";
import { useEffect, useState, useRef } from "react";

export default function OrderContainer({ order }: { order: Order }) {
  const [orderState, setOrderState] = useState<Order>(order);
  const [loading, setLoading] = useState(false);
  const intervalId = useRef<number | null>(null);

  function isComplete(freshOrderState: Order) {
    return (
      freshOrderState.order.status === "complete" &&
      Math.floor(freshOrderState.progress.progress) >= 100
    );
  }

  function stopRefreshing() {
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
    }
  }

  async function refresh() {
    setLoading(true);
    const freshOrderState = await getOrder(orderState.order.id);
    setLoading(false);
    if (!("error" in freshOrderState)) {
      setOrderState(freshOrderState as Order);
      if (isComplete(freshOrderState)) {
        stopRefreshing();
      }
    }
  }

  useEffect(() => {
    intervalId.current = setInterval(
      () => refresh(),
      1000
    ) as unknown as number;
    return () => {
      stopRefreshing();
    };
  }, []);

  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <OrderStatus order={orderState.order} />
        <OrderProgress progress={orderState.progress} />
        {loading && <div className="text-sm text-zinc-400">Updating...</div>}
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
