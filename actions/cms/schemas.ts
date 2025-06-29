import { z } from "zod";
export const coverSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1).optional(),
  contentType: z.string().min(1).optional(),
});

export const addProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  code: z.number().min(1),
  inventory: z.number().min(1),
  covers: z.array(coverSchema),
  merchantId: z.string().min(1),
  brand: z.string().min(1),
  mfgCountry: z.string().min(1),
});

export const editProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  code: z.number().min(1),
  inventory: z.number().min(1),
  covers: z.array(coverSchema),
  merchantId: z.string().min(1),
  brand: z.string().min(1),
  mfgCountry: z.string().min(1),
});

export const editOrderSchema = z.object({
  id: z.number().min(1),
  settled: z.boolean(),
  deliveryAddress: z.string(),
  deliveryStatus: z.enum(["ORDERED", "SHIPPED", "DELIVERED", "CANCELED"]),
  receiverPhoneNo: z.string().min(1),
  receiverName: z.string().min(1),
  deliveryCode: z.string().optional(),
});
