"use server";

import {
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

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const order = await getOrderById(data.id, userId);
  if (!order) {
    throw new Error("Order not found");
  }

  await db
    .update(Order)
    .set({
      ...data,
      deliveryAddress: JSON.parse(data.deliveryAddress),
    })
    .where(eq(Order.id, data.id));
}
