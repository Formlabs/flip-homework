export type OrderStatus = { id: number; status: string };

export type OrderProgress = { progress: number; timestamp: string };

export type OrderError = { error: string };

export type Order = {
  progress: OrderProgress;
  order: OrderStatus;
};

export type OrderResponse = Order | OrderError;

export async function getOrder(id: number): Promise<OrderResponse> {
  try {
    const res = await getData(id);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return await res.json();
  } catch {
    return { error: "offline" };
  }
}

function getData(id: number): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
  return Promise.all([
    fetch(`${base}/api/orders/${id}/progress`),
    fetch(`${base}/api/orders/${id}`),
  ])
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    .then(([progressData, orderData]) =>
      Response.json({
        progress: progressData,
        order: orderData,
      })
    )
    .catch((error) =>
      Response.json(
        { error: { code: "INTERNAL", message: error.message } },
        { status: 500 }
      )
    );
}
