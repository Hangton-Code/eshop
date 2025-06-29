"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useSWR, { useSWRConfig } from "swr";
import {
  getCartItems,
  removeItemFromCart,
  updateQuantity,
} from "@/actions/cart";
import { Plus, ShoppingCart, SquareChartGantt, Trash } from "lucide-react";
import { Attachment } from "ai";
import Link from "next/link";
import { useState } from "react";
import { RainbowButton } from "./magicui/rainbow-button";
import { useRouter } from "next/navigation";

const getCart = async () => {
  const items = await getCartItems();
  return items;
};

export function CartSheet() {
  const { data: cart } = useSWR("cart", getCart);
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleQuantityChange = async (id: string, quantity: number) => {
    try {
      await updateQuantity(id, quantity);
      mutate("cart");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItemFromCart(id);
      mutate("cart");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden sm:flex relative">
          <ShoppingCart width={26} />
          {(cart?.length ?? 0) > 0 && (
            <div className="absolute flex justify-center items-center top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 text-white text-xs rounded-full">
              {(cart?.length ?? 0).toString()}
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            {cart?.length ? `${cart.length} item(s)` : "Your cart is empty"}
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min h-[calc(100vh-200px)] overflow-y-scroll gap-2 px-4 ">
          {cart?.map((item) => {
            const cover = (
              item.product.covers as Attachment[]
            )[0] as Attachment | null;
            return (
              <div
                key={item.id}
                className="group border w-full p-2 bg-gradient-to-b from-neutral-50 to-neutral-100/50 hover:to-neutral-100 transition-colors rounded"
              >
                <div className="flex justify-between items-center">
                  <div className="w-full flex items-center gap-3">
                    <div className="w-20 aspect-square rounded-md bg-background flex justify-center items-center">
                      {cover ? (
                        <img
                          src={cover.url}
                          className="w-20 aspect-square object-contain"
                          alt={item.product.name}
                        />
                      ) : (
                        <SquareChartGantt width={60} height={60} />
                      )}
                    </div>

                    <div className="grow space-y-1">
                      <div>
                        <Link
                          href={`/product/${item.product.id}`}
                          className="group-hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          <p className="text-sm font-medium text-ellipsis">
                            {item.product.name}
                          </p>
                        </Link>

                        <p className="text-sm text-muted-foreground">
                          {item.product.price.toLocaleString("en-US", {
                            style: "currency",
                            currency: "HKD",
                          })}
                        </p>
                      </div>

                      <div className="w-full flex items-center justify-between">
                        <div className="w-full">
                          <Input
                            className="w-14"
                            type="number"
                            defaultValue={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                Number(e.target.value)
                              )
                            }
                            min={1}
                          />
                        </div>
                        <Button
                          size={"icon"}
                          className="w-8 h-8 flex justify-center items-center"
                          variant={"outline"}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <SheetFooter>
          <RainbowButton
            type="submit"
            onClick={() => {
              router.push("/checkout");
              setOpen(false);
            }}
          >
            Check Out
          </RainbowButton>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
