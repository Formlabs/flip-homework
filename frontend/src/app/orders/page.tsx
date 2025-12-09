import Link from "next/link";
import { getOrders } from "@/lib/http/orders";
import { StatusBadge } from "@/components/StatusBadge";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <main className="mx-auto max-w-5xl">
        <header className="mb-8 sm:mb-12">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="title-gradient text-3xl sm:text-4xl font-semibold tracking-tight">
                All Orders
              </h1>
              <p className="text-sm text-zinc-300/80 mt-2">
                Track and manage all print orders
              </p>
            </div>
            <Link href="/" className="btn-neon whitespace-nowrap">
              ← Back to Printables
            </Link>
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-zinc-400">No orders yet</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
              Browse printables to create your first order
            </Link>
          </div>
        ) : (
          <section className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="glass p-4 sm:p-5 block hover:bg-zinc-800/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-zinc-100">
                      Order #{order.id}
                    </span>
                    <StatusBadge status={order.status as "complete" | "failed" | "printing" | "queued"}>
                      {order.status}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center gap-4">
                    {order.status === "printing" && (
                      <span className="text-sm text-blue-400">
                        {order.progress}%
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-zinc-400">→</span>
                  </div>
                </div>
                {order.assigned_printer_id && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Printer #{order.assigned_printer_id}
                  </p>
                )}
              </Link>
            ))}
          </section>
        )}

        <p className="text-xs text-zinc-400 mt-6">
          Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </main>
    </div>
  );
}

