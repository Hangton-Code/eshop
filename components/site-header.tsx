"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScanLine, WalletMinimal } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { CartSheet } from "./cart-sheet";
import { Badge } from "./ui/badge";

export function SiteHeader() {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/chat/${searchQuery}`);
  };

  return (
    <header
      className={cn(
        isMobile ? "w-full" : "w-[calc(100vw-16rem)]",
        "bg-background z-10 fixed flex h-15 shrink-0 items-center gap-2 border-b"
      )}
    >
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        {isMobile && (
          <>
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
          </>
        )}

        <Link className="flex gap-1.5 select-none max-md:hidden" href="/">
          <ScanLine width={22} />
          <h1 className="text-base font-medium">EShop</h1>
          <Badge className="ml-0.5">#prototype</Badge>
        </Link>

        <AnimatePresence>
          <motion.div
            className="w-full max-w-[400px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <form onSubmit={handleSearch}>
              <Input
                className="w-full shadow-none"
                placeholder="🔍 Perform Traditional Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 xl:gap-3">
          <CartSheet />

          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => router.push("/orders")}
              >
                <WalletMinimal />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Orders</p>
            </TooltipContent>
          </Tooltip> */}

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4 max-md:hidden"
          />
          <div className="mx-2 flex items-center max-md:hidden">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
