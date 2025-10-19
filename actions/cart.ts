"use server";

import { db } from "@/db";
import { CartItem, Product, Merchant } from "@/db/schema";
import { findCartItemByProductId } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export async function addItemToCart(productId: string, cartQuantity?: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const item = (await findCartItemByProductId(productId, userId))[0];

  if (item) {
    await db
      .update(CartItem)
      .set({
        quantity: item.quantity + (cartQuantity || 1),
      })
      .where(eq(CartItem.id, item.id));
  } else {
    await db.insert(CartItem).values({
      productId,
      userId,
      quantity: cartQuantity || 1,
      id: generateUUID(),
    });
  }
}

export async function getCartItems() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await db
    .select({
      ...getTableColumns(CartItem),
      product: getTableColumns(Product),
      merchant: getTableColumns(Merchant),
    })
    .from(CartItem)
    .innerJoin(Product, eq(CartItem.productId, Product.id))
    .innerJoin(Merchant, eq(Product.merchantId, Merchant.id))
    .where(eq(CartItem.userId, userId))
    .orderBy(CartItem.createdAt);

  return result;
}

export async function updateQuantity(id: string, quantity: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  quantity = z.number().min(1).int().parse(quantity);

  await db
    .update(CartItem)
    .set({
      quantity,
    })
    .where(and(eq(CartItem.userId, userId), eq(CartItem.id, id)));
}

export async function removeItemFromCart(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(CartItem)
    .where(and(eq(CartItem.userId, userId), eq(CartItem.id, id)));
}
