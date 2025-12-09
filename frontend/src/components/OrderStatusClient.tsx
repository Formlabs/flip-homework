"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { OrderStatus } from "@/types/order";
import { getOrderStatus } from "@/lib/http/orders";
import { LiveIndicator, UpdatingIndicator } from "./LiveIndicator";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { NotificationButton } from "./NotificationButton";
import { showNotification, getNotificationPermission } from "@/lib/notifications";
import StlViewer from "./StlViewer";

interface OrderStatusClientProps {
  orderId: string;
  initialData: OrderStatus;
}

export function OrderStatusClient({
  orderId,
  initialData,
}: OrderStatusClientProps) {
  const previousStatusRef = useRef<string>(initialData.status);
  const [showPreview, setShowPreview] = useState(false);

  const {
    data: order,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderStatus(orderId),
    initialData,
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      if (currentStatus === "complete" || currentStatus === "failed") {
        return false;
      }
      return 3000;
    },
    retry: 3,
  });

  useEffect(() => {
    if (!order) return;

    const currentStatus = order.status;
    const previousStatus = previousStatusRef.current;

    if (currentStatus !== previousStatus) {
      previousStatusRef.current = currentStatus;

      if (getNotificationPermission() === "granted") {
        const statusMessages: Record<string, string> = {
          queued: "Your order is queued for printing",
          assigned: "Your order has been assigned to a printer",
          printing: `Your order is now printing (${order.progress}% complete)`,
          complete: "Your order is complete!",
          failed: "Your order has failed",
        };

        const message = statusMessages[currentStatus] || `Order status: ${currentStatus}`;

        showNotification(`Order #${order.id} Update`, {
          body: message,
          orderId: order.id,
        }).catch((err) => {
          console.error("Failed to show notification:", err);
        });
      }
    }
  }, [order]);

  if (isError) {
    return (
      <div className="glass p-5 sm:p-6">
        <h1 className="text-2xl font-semibold mb-2 title-gradient">
          Order {orderId}
        </h1>
        <div className="text-sm text-red-300/90 bg-red-900/20 border border-red-700/50 rounded p-4">
          <p className="font-medium mb-1">Failed to load order status</p>
          <p className="text-xs text-red-400/80">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs underline hover:text-red-200"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }

  const isActive = order.status !== "complete" && order.status !== "failed";

  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold title-gradient">
          Order {order.id}
        </h1>
        {isActive && (
          <div className="flex items-center gap-3">
            {isFetching ? <UpdatingIndicator /> : <LiveIndicator />}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-300/90">Status:</span>
        <StatusBadge status={order.status as "complete" | "failed" | "printing" | "queued"}>
          {order.status}
        </StatusBadge>
      </div>

      {(order.status === "printing" || order.status === "complete" || order.status === "failed") && (
        <ProgressBar
          progress={order.progress}
          status={order.status}
          className="mt-4"
        />
      )}

      {order.assigned_printer_id && (
        <div className="mt-3 text-xs text-zinc-400">
          Assigned to Printer #{order.assigned_printer_id}
        </div>
      )}

      {order.items && order.items.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            {showPreview ? "▼" : "▶"} {showPreview ? "Hide" : "Show"} order preview ({order.items.length} item{order.items.length > 1 ? "s" : ""})
          </button>
          
          {showPreview && (
            <div className="mt-3 space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="bg-zinc-900/30 border border-zinc-700/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-zinc-200">{item.name}</h3>
                    <span className="text-xs text-zinc-400">Qty: {item.qty}</span>
                  </div>
                  {item.stl_url && (
                    <div className="rounded overflow-hidden">
                      <StlViewer url={item.stl_url} height={200} color={item.color || "gray"} />
                    </div>
                  )}
                  {item.color && (
                    <p className="text-xs text-zinc-500 mt-2">Color: {item.color}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-700/40 rounded-lg">
          <div className="flex-1">
            <p className="text-xs font-medium text-zinc-200">
              Get notified on status changes
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Receive browser notifications when your order updates
            </p>
          </div>
          <NotificationButton />
        </div>

        <div className="text-xs text-zinc-400">
          {isActive ? (
            <p>
              Status updates automatically every 3 seconds. You can safely close
              this page.
            </p>
          ) : (
            <p>
              Order {order.status === "complete" ? "completed" : "ended"}. No
              further updates.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
