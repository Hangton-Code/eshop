"use server";

import { db } from "@/db";
import { Merchant } from "@/db/schema";
import { redisClient } from "@/lib/redis";
import { generateUUID } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const MerchantSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  profilePictureUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export async function createMerchant(data: z.infer<typeof MerchantSchema>) {
  const { name, description, bannerUrl, profilePictureUrl } =
    MerchantSchema.parse(data);

  const { userId } = await auth();
  if (!userId) return null;

  return (
    await db
      .insert(Merchant)
      .values({
        userId,
        name,
        description,
        id: generateUUID(),
        bannerUrl: bannerUrl,
        pictureUrl: profilePictureUrl,
      })
      .returning()
  )[0];
}

export async function editMerchant(
  id: string,
  data: z.infer<typeof MerchantSchema>
) {
  const { name, description, bannerUrl, profilePictureUrl } =
    MerchantSchema.parse(data);

  const { userId } = await auth();
  if (!userId) return null;

  await db
    .update(Merchant)
    .set({
      userId,
      name,
      description,
      bannerUrl: bannerUrl,
      pictureUrl: profilePictureUrl,
    })
    .where(and(eq(Merchant.id, id), eq(Merchant.userId, userId)));

  await redisClient.del(`merchant:${id}`);
}
