"use client";

import * as React from "react";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { CreateShopSheet } from "./create-shop-sheet";

export function ShopSwitcher({
  shops,
}: {
  shops: {
    name: string;
    profilePictureUrl: string | null;
    id: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeShop, setActiveShop] = React.useState(shops[0]);

  if (!activeShop) {
    return null;
  }

  const [createShopSheetOpen, setCreateShopSheetOpen] = React.useState(false);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {activeShop.profilePictureUrl ? (
                    <img
                      className="w-full h-full"
                      src={activeShop.profilePictureUrl}
                      alt={activeShop.name}
                    />
                  ) : (
                    <Building2 className="w-[80%] aspect-square" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeShop.name}
                  </span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Your Shops
              </DropdownMenuLabel>
              {shops.map((shop, index) => (
                <DropdownMenuItem
                  key={shop.name}
                  onClick={() => setActiveShop(shop)}
                  className="gap-2 p-2"
                  asChild
                >
                  <Link href={`/cms/${shop.id}`}>
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      {activeShop.profilePictureUrl ? (
                        <img
                          className="w-full h-full"
                          src={activeShop.profilePictureUrl}
                          alt={activeShop.name}
                        />
                      ) : (
                        <Building2 className="w-[80%] aspect-square" />
                      )}
                    </div>
                    {shop.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setCreateShopSheetOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add shop
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <CreateShopSheet
        open={createShopSheetOpen}
        setOpen={setCreateShopSheetOpen}
        hasTrigger={false}
      />
    </>
  );
}
