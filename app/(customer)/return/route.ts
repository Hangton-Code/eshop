import { redirect } from "next/navigation";
import { getOrdersByPaymentId, getProductById } from "@/lib/db/queries";
import { CartItem, Merchant, Order, Product } from "@/db/schema";
import { db } from "@/db";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest } from "next/server";
import { redisClient } from "@/lib/redis";
import { Attachment } from "ai";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const session_id = searchParams.get("session_id");

  if (!session_id)
    throw new Error("Please provide a valid session_id (`cs_test_...`)");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const data = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });
  const {
    payment_intent,
    line_items,
    collected_information,
    customer_details,
  } = data;
  if (
    !line_items ||
    !collected_information ||
    !collected_information.shipping_details
  )
    throw new Error("Error: Please contact our sales");

  if (!payment_intent || typeof payment_intent === "string")
    throw new Error("Error: Please contact our sales");
  const orders = await getOrdersByPaymentId(payment_intent.id);
  if (orders.length > 0) throw new Error("Error: Please contact our sales");

  // remove cart items
  const metadataString = await redisClient.get(`stripe:${session_id}`);
  if (!metadataString) throw new Error("Error: Please contact our sales");
  const metadata = JSON.parse(metadataString) as {
    userId: string;
    cartItems: (CartItem & {
      product: Product;
      merchant: Merchant;
    })[];
  };
  if (!metadata || !metadata.cartItems || !metadata.userId)
    throw new Error("Error: Please contact our sales");
  const cartItems = metadata.cartItems;
  if (!cartItems || cartItems.length === 0)
    throw new Error("Error: Please contact our sales");

  const userIds = cartItems.map((item) => item.userId);
  const uniqueUserIds = [...new Set(userIds)];
  if (uniqueUserIds.length > 1 || uniqueUserIds[0] !== metadata.userId)
    throw new Error("Error: Please contact our sales");

  await db.delete(CartItem).where(
    and(
      inArray(
        CartItem.id,
        cartItems.map((item) => item.id)
      )
    )
  );

  for (const item of cartItems) {
    const productId = item.productId;
    if (!productId || typeof productId !== "string" || !item.quantity)
      throw new Error("Error: Please contact our sales");

    // create order
    const grossTotal =
      Math.round(item.quantity * item.product.price * 100) / 100;
    const netTotal =
      Math.round(item.quantity * item.product.price * 100 * (1 - 0.05)) / 100;
    const covers = item.product.covers as Attachment[];

    await db.insert(Order).values({
      productId,
      quantity: item.quantity,
      pricePerUnit: item.product.price,
      grossTotal: grossTotal,
      netTotal: netTotal,
      customerId: metadata.userId,
      deliveryAddress: collected_information?.shipping_details?.address,
      deliveryStatus: "ORDERED",
      receiverName: collected_information?.shipping_details?.name,
      receiverPhoneNo: customer_details?.phone || "",
      settled: true,
      stripePaymentId: payment_intent.id,
      productDetails: {
        name: item.product.name,
        pictureUrl: covers[0] ? covers[0].url : undefined,
        brand: item.product.brand,
        description: item.product.description,
        merchantId: item.merchant.id,
        merchantName: item.merchant.name,
      },
    });

    // deduct inventory
    const productData = await getProductById(productId);
    if (!productData) throw new Error("Error: Please contact our sales");
    await db
      .update(Product)
      .set({
        inventory: productData.product.inventory - item.quantity,
      })
      .where(eq(Product.id, productId));
  }

  // delete metadata
  await redisClient.del(`stripe:${session_id}`);

  return redirect("/congratulations");
}
