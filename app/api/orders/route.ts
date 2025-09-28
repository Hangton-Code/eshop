import { NextRequest } from "next/server";
import { getOrdersByMerchantId as getOrdersByMerchantIdFromDB } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import {
  verifyRecaptchaToken,
  validateRecaptchaResponse,
} from "@/lib/recaptcha";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  const recaptchaToken = req.nextUrl.searchParams.get("recaptchaToken");

  if (!merchantId) throw new Error("Merchant ID not found");

  if (recaptchaToken) {
    try {
      const recaptchaResponse = await verifyRecaptchaToken(recaptchaToken);
      if (!validateRecaptchaResponse(recaptchaResponse, 0.5)) {
        return Response.json(
          { error: "reCAPTCHA verification failed" },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      return Response.json(
        { error: "reCAPTCHA verification failed" },
        { status: 403 }
      );
    }
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const orders = await getOrdersByMerchantIdFromDB(merchantId, userId);
  if (orders.length === 0) throw new Error("Orders not found");

  return Response.json(
    orders.map((order) => ({
      ...order.Order,
    }))
  );
}
