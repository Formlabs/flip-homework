import OrderError from "@/components/order/OrderError";
import { getOrder } from "@/libs/get-order";
import OrderContainer from "@/components/order/OrderContainer";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(parseInt(id));
  if ("error" in order) {
    return <OrderError error={order.error} id={id} />;
  }
  return <OrderContainer order={order} />;
}
