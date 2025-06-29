"use client";

import { Attachment } from "ai";
import { Button } from "./ui/button";
import { ShoppingCart, SquareChartGantt } from "lucide-react";
import { Merchant } from "@/db/schema";
import { addItemToCart } from "@/actions/cart";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useSWRConfig } from "swr";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProductCard({
  product,
  merchantMap,
  query,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    covers: Attachment[];
    brand: string;
    merchantId: string;
  };
  merchantMap: {
    [key: string]: Merchant;
  };
  query?: string;
}) {
  const { mutate } = useSWRConfig();

  const handleAddToCart = async () => {
    await addItemToCart(product.id);
    toast.success("Added to cart");
    mutate("cart");
  };

  return (
    <motion.div
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-full group border p-4 rounded-xl space-y-2 bg-gradient-to-br from-neutral-50 to-zinc-50"
    >
      <div className="mx-auto overflow-hidden w-[80%] aspect-square rounded">
        {product.covers[0] ? (
          <img
            className="w-full h-full object-contain"
            src={product.covers[0].url}
            alt={product.name}
            draggable="false"
          />
        ) : (
          <div className="h-full w-full bg-background flex justify-center items-center ">
            <SquareChartGantt width={80} height={80} />
          </div>
        )}
      </div>
      <div>
        <Link
          href={`/product/${product.id}${query ? `?query=${query}` : ""}`}
          className={cn("font-medium group-hover:underline")}
        >
          <p className="truncate">{product.name}</p>
        </Link>
        <div className="flex justify-between items-center pt-1">
          <div>
            <Link
              href={`merchant/${product.merchantId}`}
              className="text-xs text-muted-foreground group-hover:underline"
            >
              {merchantMap[product.merchantId].name}
            </Link>
            <p className="font-extrabold">
              {product.price.toLocaleString("en-US", {
                style: "currency",
                currency: "HKD",
              })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button onClick={handleAddToCart}>
              Add to
              <ShoppingCart />{" "}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
