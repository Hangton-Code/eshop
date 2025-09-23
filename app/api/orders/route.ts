import { NextRequest } from "next/server";
import {
  getOrdersByMerchantId as getOrdersByMerchantIdFromDB,
} from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  if (!merchantId) throw new Error("Merchant ID not found");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const orders = await getOrdersByMerchantIdFromDB(merchantId);
  if (orders.length === 0) throw new Error("Orders not found");
  if (orders[0].Merchant.userId !== userId) throw new Error("Unauthorized");

  return Response.json(orders);
}
