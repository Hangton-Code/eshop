import { Merchant } from "@/db/schema";
import { getMerchantsByIds, getOrdersByCustomerId } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { OrdersContent } from "@/components/orders-content";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const { userId } = await auth();
  if (!userId) return <></>;

  const myOrders = await getOrdersByCustomerId(userId);

  // get all merchant's ids
  const merchantIds = myOrders.map((order) => order.merchantId);
  const uniqueMerchantIds = [...new Set(merchantIds)];
  const merchants = await getMerchantsByIds(uniqueMerchantIds);
  const merchantMap = merchants.reduce((acc, merchant) => {
    acc[merchant.id] = merchant;
    return acc;
  }, {} as { [key: string]: Merchant });

  return <OrdersContent myOrders={myOrders} merchantMap={merchantMap} />;
}
