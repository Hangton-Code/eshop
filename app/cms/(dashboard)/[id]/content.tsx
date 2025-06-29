"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { motion } from "motion/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

export function OverviewPageContent({
  id,
  revenue,
  customerCount,
}: {
  id: string;
  revenue: {
    grossTotal: number;
    netTotal: number;
  };
  customerCount: number;
}) {
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
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="px-4 lg:px-6 space-y-1">
        <h1 className="text-2xl font-bold">Shop's Overview</h1>
        <p className="text-sm text-muted-foreground">
          Here are some of your shop's overview.
        </p>
      </div>

      <div className="px-4 lg:px-6 grid grid-cols-2 gap-4">
        <Card className="shadow-2xs bg-gradient-to-br from-neutral-50/50 to-neutral-100">
          <CardHeader className="relative">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              HKD$ {revenue.netTotal}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Visitors for the last 6 months
            </div>
          </CardFooter>
        </Card>
        <Card className="shadow-2xs bg-gradient-to-br from-neutral-50/50 to-neutral-100">
          <CardHeader className="relative">
            <CardDescription>New Customers</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {customerCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Down 20% this period <TrendingDownIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Acquisition needs attention
            </div>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
}
