"use client";

import * as React from "react";
import { Frame, LayoutDashboard, Package, Warehouse } from "lucide-react";

import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { convertToActualPathInCMS } from "@/lib/utils";
import { ShopSwitcher } from "./shop-switcher";
import { NavUser } from "../nav-user";
import Link from "next/link";

const data = {
  navMain: [
    {
      name: "Profile Management",
      path: "profile",
      icon: Frame,
    },
    {
      name: "Product Management",
      path: "products",
      icon: Warehouse,
    },
    {
      name: "Order Management",
      path: "orders",
      icon: Package,
    },
  ],
};

export function DashboardSidebar({
  merchantId,
  shops,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  merchantId: string;
  shops: { name: string; profilePictureUrl: string | null; id: string }[];
  user: {
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <ShopSwitcher shops={shops} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href={convertToActualPathInCMS({
                      merchantId,
                      path: "",
                    })}
                  >
                    <LayoutDashboard />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavMain merchantId={merchantId} items={data.navMain} />
      </SidebarContent>

      <SidebarFooter></SidebarFooter>
      <SidebarRail />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
