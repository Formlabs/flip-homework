import { OrderStatus, OrderSummary } from "@/types/order";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function getOrders(): Promise<OrderSummary[]> {
  const res = await fetch(`${API_BASE}/api/orders`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.orders;
}

export async function getOrderStatus(id: string): Promise<OrderStatus> {
  const res = await fetch(`${API_BASE}/api/orders/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Order with ID ${id} not found`);
    }
    throw new Error(
      `Failed to fetch order status: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  return data;
}

