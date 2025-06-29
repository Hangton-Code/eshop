"use server";

import { db } from "@/db";
import { Product } from "@/db/schema";
import {
  getMerchantById,
  getProductById,
  getProductsByMerchantId as getProductsByMerchantIdFromDB,
} from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { addProductSchema, coverSchema, editProductSchema } from "./schemas";
import { getEmbeddings } from "@/lib/ai/embeddings";
import { eq } from "drizzle-orm";
import { redisClient } from "@/lib/redis";

export async function addProduct(body: z.infer<typeof addProductSchema>) {
  const data = addProductSchema.parse(body);

  const { userId } = await auth();

  const merchant = await getMerchantById(data.merchantId);
  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.userId !== userId) {
    throw new Error("");
  }

  // embeddings
  const embedding = await getEmbeddings(data.description);

  await db.insert(Product).values({
    name: data.name,
    price: data.price,
    category: data.category,
    description: data.description,
    covers: JSON.stringify(data.covers),
    code: data.code,
    inventory: data.inventory,
    id: generateUUID(),
    merchantId: data.merchantId,
    brand: data.brand,
    mfgCountry: data.mfgCountry,
    embedding,
  });
}

export async function editProduct(body: z.infer<typeof editProductSchema>) {
  const data = editProductSchema.parse(body);

  const { userId } = await auth();

  const merchant = await getMerchantById(data.merchantId);
  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.userId !== userId) {
    throw new Error("");
  }

  const product = await getProductById(data.id);
  if (!product || product.merchantId !== data.merchantId) {
    throw new Error("Product not found");
  }

  // embeddings
  const embedding = await getEmbeddings(data.description);

  await db
    .update(Product)
    .set({
      name: data.name,
      price: data.price,
      category: data.category,
      description: data.description,
      covers: JSON.stringify(data.covers),
      code: data.code,
      inventory: data.inventory,
      merchantId: data.merchantId,
      brand: data.brand,
      mfgCountry: data.mfgCountry,
      embedding,
    })
    .where(eq(Product.id, data.id));

  // delete from redis
  await redisClient.del(`product:${data.id}`);
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  const merchant = await getMerchantById(product.merchantId);
  if (!merchant) {
    throw new Error("Merchant not found");
  }

  const { userId } = await auth();
  if (merchant.userId !== userId) {
    throw new Error("Product not found");
  }

  await db.delete(Product).where(eq(Product.id, id));
}
