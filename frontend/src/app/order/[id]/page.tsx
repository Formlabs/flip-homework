type OrderStatus = { id: number; status: string };

async function getStatus(id: string): Promise<OrderStatus | { error: string }> {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
    const res = await fetch(`${base}/api/orders/${id}`, { cache: "no-store" });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return await res.json();
  } catch {
    return { error: "offline" };
  }
}

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getStatus(params.id);
  if ("error" in data) {
    return (
      <div className="min-h-dvh p-6 sm:p-10">
        <div className="mx-auto max-w-3xl">
          <div className="glass p-5 sm:p-6">
            <h1 className="text-2xl font-semibold mb-2 title-gradient">
              Order {params.id}
            </h1>
            <p className="text-sm text-red-300/90">{data.error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="glass p-5 sm:p-6">
          <h1 className="text-2xl font-semibold mb-2 title-gradient">
            Order {data.id}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-300/90">Status:</span>
            <span className="text-xs px-2 py-1 rounded-full bg-zinc-800/70 border border-zinc-700/60 text-zinc-200">
              {data.status}
            </span>
          </div>
          <div className="mt-4 text-xs text-zinc-400">
            You can safely close this page. Refresh to update status.
          </div>
        </div>
      </div>
    </div>
  );
}
