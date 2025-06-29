"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { motion } from "motion/react";
import useSWR from "swr";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { OrderTable } from "@/components/cms/order-table";
import { productsFetcher } from "../products/content";
import { Order } from "@/db/schema";
import { useEffect, useMemo, useState } from "react";

const ordersFetcher = (id: string) => async (key: string) => {
  if (key === "orders") {
    // We use 'users' as a simple key to trigger this fetcher
    const response = await fetch(`/api/orders?merchantId=${id}`);
    if (!response.ok) return null;
    return (await response.json()) as Order[];
  }
  return null; // Or throw an error for unsupported keys
};

export function PageContent({ id }: { id: string }) {
  const { data: orders } = useSWR("orders", ordersFetcher(id), {
    revalidateOnFocus: true, // Revalidate when window gains focus
    revalidateOnReconnect: true, // Revalidate when network reconnects
    errorRetryInterval: 5000, // Retry fetching every 5 seconds on error
    shouldRetryOnError: true, // Keep retrying on error
  });

  const { data: products } = useSWR("products", productsFetcher(id), {
    revalidateOnFocus: true, // Revalidate when window gains focus
    revalidateOnReconnect: true, // Revalidate when network reconnects
    errorRetryInterval: 5000, // Retry fetching every 5 seconds on error
    shouldRetryOnError: true, // Keep retrying on error
  });

  const betterOrders = useMemo(() => {
    if (!orders || !products) return [];
    return orders.map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }));
  }, [orders, products]);

  console.log(betterOrders);

  if (!orders || !products) return <></>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col pt-4 gap-8"
    >
      <div className="px-4 lg:px-6 flex items-center">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mx-4 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/cms/${id}`}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="px-4 lg:px-6 space-y-1">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-sm text-muted-foreground">
          Here you can manage your orders. You can view, update, and delete
          orders.
        </p>
      </div>

      <OrderTable data={betterOrders} merchantId={id} />
    </motion.div>
  );
}
