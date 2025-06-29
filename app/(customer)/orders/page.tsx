import { Merchant, Order, ProductDetails } from "@/db/schema";
import { getMerchantsByIds, getOrdersByCustomerId } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { OrderCard } from "@/components/order-card";

export default async function MyOrdersPage() {
  const { userId } = await auth();
  if (!userId) return <></>;

  const myOrders = await getOrdersByCustomerId(userId);
  // categorize orders by status
  const ordersByStatus = myOrders.reduce((acc, order) => {
    if (!acc[order.deliveryStatus]) {
      acc[order.deliveryStatus] = [];
    }
    acc[order.deliveryStatus].push(order);
    return acc;
  }, {} as { [key: string]: Order[] });

  // get all merchant's ids
  const merchantIds = myOrders.map((order) => order.merchantId);
  const uniqueMerchantIds = [...new Set(merchantIds)];
  const merchants = await getMerchantsByIds(uniqueMerchantIds);
  const merchantMap = merchants.reduce((acc, merchant) => {
    acc[merchant.id] = merchant;
    return acc;
  }, {} as { [key: string]: Merchant });

  return (
    <div className="flex h-screen pt-25 flex-col w-full max-w-[1000px] space-y-8 mx-auto px-10 max-md:pt-20 max-md:px-5">
      <div className="px-4 lg:px-6 space-y-1">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-sm text-muted-foreground">
          You have made {myOrders.length} order(s)
        </p>
      </div>

      <Tabs defaultValue="ORDERED" className="px-2 lg:px-6">
        <TabsList>
          <TabsTrigger value="ORDERED">
            Order Placed{" "}
            {ordersByStatus.ORDERED?.length > 0
              ? `(${ordersByStatus.ORDERED?.length})`
              : ""}
          </TabsTrigger>
          <TabsTrigger value="SHIPPED">
            Shipped{" "}
            {ordersByStatus.SHIPPED?.length > 0
              ? `(${ordersByStatus.SHIPPED?.length})`
              : ""}
          </TabsTrigger>
          <TabsTrigger value="DELIVERED">
            Delivered{" "}
            {ordersByStatus.DELIVERED?.length > 0
              ? `(${ordersByStatus.DELIVERED?.length})`
              : ""}
          </TabsTrigger>
          <TabsTrigger value="CANCELED">
            Canceled{" "}
            {ordersByStatus.CANCELED?.length > 0
              ? `(${ordersByStatus.CANCELED?.length})`
              : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ORDERED" className="mt-2">
          {ordersByStatus.ORDERED?.map((order) => (
            <OrderCard order={order} merchantMap={merchantMap} />
          ))}
        </TabsContent>
        <TabsContent value="SHIPPED">
          {ordersByStatus.SHIPPED?.map((order) => (
            <OrderCard order={order} merchantMap={merchantMap} />
          ))}
        </TabsContent>
        <TabsContent value="DELIVERED">
          {ordersByStatus.DELIVERED?.map((order) => (
            <OrderCard order={order} merchantMap={merchantMap} />
          ))}
        </TabsContent>
        <TabsContent value="CANCELED">
          {ordersByStatus.CANCELED?.map((order) => (
            <OrderCard order={order} merchantMap={merchantMap} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
