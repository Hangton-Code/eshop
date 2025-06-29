"use server";

import {
  getMerchantById,
  getOrderById,
  getOrdersByMerchantId as getOrdersByMerchantIdFromDB,
} from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { editOrderSchema } from "./schemas";
import { z } from "zod";
import { db } from "@/db";
import { Order } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function editOrder(body: z.infer<typeof editOrderSchema>) {
  const data = editOrderSchema.parse(body);

  const { userId } = await auth();

  const order = await getOrderById(data.id);
  if (!order) {
    throw new Error("Order not found");
  }

  const merchant = await getMerchantById(order.merchantId);
  if (!merchant || merchant.userId !== userId) {
    throw new Error("");
  }

  await db
    .update(Order)
    .set({
      ...data,
      deliveryAddress: JSON.parse(data.deliveryAddress),
    })
    .where(eq(Order.id, data.id));
}
