import Link from "next/link";
import { getOrderStatus } from "@/lib/http/orders";
import { notFound } from "next/navigation";
import { OrderStatusClient } from "@/components/OrderStatusClient";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data;

  try {
    data = await getOrderStatus(id);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <Link className="text-sm text-zinc-300/80 hover:text-white" href="/">
          ← Back to printables
        </Link>
        <div className="mt-4">
          <OrderStatusClient orderId={id} initialData={data} />
        </div>
      </div>
    </div>
  );
}
