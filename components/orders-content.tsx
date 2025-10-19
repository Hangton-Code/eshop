"use client";

import { Merchant, Order, Product } from "@/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderCard } from "@/components/order-card";
import { useLanguage } from "@/lib/i18n/language-context";

interface OrdersContentProps {
  myOrders: { Order: Order; Product: Product }[];
  merchantMap: { [key: string]: Merchant };
}

export function OrdersContent({ myOrders, merchantMap }: OrdersContentProps) {
  const { t } = useLanguage();

  // categorize orders by status
  const ordersByStatus = myOrders.reduce((acc, orderData) => {
    const status = orderData.Order.deliveryStatus;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(orderData);
    return acc;
  }, {} as { [key: string]: { Order: Order; Product: Product }[] });

  return (
    <div className="flex pb-25 pt-25  flex-col w-full max-w-[1000px] space-y-8 mx-auto px-10 max-md:pt-20 max-md:px-5">
      <div className="px-4 lg:px-6 space-y-1">
        <h1 className="text-2xl font-bold">{t("myOrders")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("youHaveMade")} {myOrders.length} {t("orders")}
        </p>
      </div>

      <Tabs defaultValue="ORDERED" className="px-2 lg:px-6">
        <TabsList>
          <TabsTrigger value="ORDERED">
            {t("orderPlaced")}{" "}
            {ordersByStatus.ORDERED?.length > 0
              ? `(${ordersByStatus.ORDERED?.length})`
              : ""}
          </TabsTrigger>
          <TabsTrigger value="SHIPPED">
            {t("shipped")}{" "}
            {ordersByStatus.SHIPPED?.length > 0
              ? `(${ordersByStatus.SHIPPED?.length})`
              : ""}
          </TabsTrigger>
          <TabsTrigger value="DELIVERED">
            {t("delivered")}{" "}
            {ordersByStatus.DELIVERED?.length > 0
              ? `(${ordersByStatus.DELIVERED?.length})`
              : ""}
          </TabsTrigger>
          <TabsTrigger value="CANCELED">
            {t("canceled")}{" "}
            {ordersByStatus.CANCELED?.length > 0
              ? `(${ordersByStatus.CANCELED?.length})`
              : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ORDERED" className="mt-2 space-y-2">
          {ordersByStatus.ORDERED?.map((orderData) => (
            <OrderCard
              key={orderData.Order.id}
              orderData={orderData}
              merchantMap={merchantMap}
            />
          ))}
        </TabsContent>
        <TabsContent value="SHIPPED" className="mt-2 space-y-2">
          {ordersByStatus.SHIPPED?.map((orderData) => (
            <OrderCard
              key={orderData.Order.id}
              orderData={orderData}
              merchantMap={merchantMap}
            />
          ))}
        </TabsContent>
        <TabsContent value="DELIVERED" className="mt-2 space-y-2">
          {ordersByStatus.DELIVERED?.map((orderData) => (
            <OrderCard
              key={orderData.Order.id}
              orderData={orderData}
              merchantMap={merchantMap}
            />
          ))}
        </TabsContent>
        <TabsContent value="CANCELED" className="mt-2 space-y-2">
          {ordersByStatus.CANCELED?.map((orderData) => (
            <OrderCard
              key={orderData.Order.id}
              orderData={orderData}
              merchantMap={merchantMap}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
