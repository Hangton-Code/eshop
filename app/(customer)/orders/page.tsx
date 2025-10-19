import { getOrdersByCustomerId } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { OrdersContent } from "@/components/orders-content";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const { userId } = await auth();
  if (!userId) return <></>;

  const myOrders = await getOrdersByCustomerId(userId);

  return <OrdersContent myOrders={myOrders} />;
}
