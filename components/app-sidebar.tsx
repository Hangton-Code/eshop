"use client";

import { usePathname, useRouter } from "next/navigation";

import { PlusIcon } from "lucide-react";
import { SidebarHistory } from "@/components/sidebar-history";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { UserButton, useUser } from "@clerk/nextjs";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const user = useUser();
  const userObj = {
    name: user.user?.fullName,
    email: user.user?.emailAddresses[0].emailAddress,
    imageUrl: user.user?.imageUrl,
  } as {
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
  const pathname = usePathname();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer select-none">
                Chat History
              </span>
            </Link>
            {pathname !== "/" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push("/");
                      router.refresh();
                    }}
                  >
                    <PlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">New Chat</TooltipContent>
              </Tooltip>
            )}
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory userId={user.user?.id || null} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userObj} />
      </SidebarFooter>
    </Sidebar>
  );
}
