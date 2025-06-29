import { NextRequest } from "next/server";
import { getMerchantById, getProductsByMerchantId } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  if (!merchantId) throw new Error("Merchant ID not found");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const merchant = await getMerchantById(merchantId);
  if (!merchant || merchant.userId !== userId)
    throw new Error("Merchant not found");

  return Response.json(await getProductsByMerchantId(merchantId));
}
