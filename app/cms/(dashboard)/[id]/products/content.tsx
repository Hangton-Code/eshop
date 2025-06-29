"use client";

import { ProductTable } from "@/components/cms/product-table";
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
import { Product } from "@/db/schema";

export const productsFetcher = (id: string) => async (key: string) => {
  if (key === "products") {
    // We use 'users' as a simple key to trigger this fetcher
    const response = await fetch(`/api/products?merchantId=${id}`);
    if (!response.ok) return null;
    return (await response.json()) as Product[];
  }
  return null; // Or throw an error for unsupported keys
};

export function PageContent({ id }: { id: string }) {
  const { data: products } = useSWR("products", productsFetcher(id), {
    revalidateOnFocus: true, // Revalidate when window gains focus
    revalidateOnReconnect: true, // Revalidate when network reconnects
    errorRetryInterval: 5000, // Retry fetching every 5 seconds on error
    shouldRetryOnError: true, // Keep retrying on error
  });

  if (!products) return <></>;

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
              <BreadcrumbPage>Product Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="px-4 lg:px-6 space-y-1">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <p className="text-sm text-muted-foreground">
          Here you can manage your products. You can create, update, and delete
          products.
        </p>
      </div>

      <ProductTable data={products} merchantId={id} />
    </motion.div>
  );
}

// TODO: Congrtulation Page
// Let user view order record
// email notifier
// fix cache problem in orders and products in cms
