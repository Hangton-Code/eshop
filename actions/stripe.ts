"use server";

import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { getCartItems } from "./cart";
import { Attachment } from "ai";
import { redisClient } from "@/lib/redis";
import Stripe from "stripe";

export async function fetchClientSecret() {
  const origin = (await headers()).get("origin");

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cartItems = await getCartItems();

  // Create Checkout Sessions from body params.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: cartItems.map((item) => ({
      price_data: {
        currency: "HKD",
        product_data: {
          name: `${item.product.name} from ${item.merchant?.name}`,
          images: (item.product.covers as Attachment[]).map((_) => _.url),
          metadata: {
            productId: item.productId,
          },
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    currency: "HKD",
    return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    shipping_address_collection: {
      allowed_countries: ["HK"],
    },
    phone_number_collection: {
      enabled: true,
    },
  });

  await redisClient.set(
    `stripe:${session.id}`,
    JSON.stringify({
      userId,
      cartItems: cartItems,
    })
  );

  return session.client_secret;
}

export async function createStripeSession() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cartItems = await getCartItems();

  if (cartItems.length === 0) {
    return null;
  }

  // Create Checkout Sessions from body params.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    ui_mode: "hosted",
    line_items: cartItems.map((item) => ({
      price_data: {
        currency: "HKD",
        product_data: {
          name: `${item.product.name} from ${item.merchant?.name}`,
          images: (item.product.covers as Attachment[]).map((_) => _.url),
          metadata: {
            productId: item.productId,
          },
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    currency: "HKD",
    success_url: `${process.env.NEXT_PUBLIC_APP_ORIGIN}/return?session_id={CHECKOUT_SESSION_ID}`,
    shipping_address_collection: {
      allowed_countries: ["HK"],
    },
    phone_number_collection: {
      enabled: true,
    },
  });

  await redisClient.set(
    `stripe:${session.id}`,
    JSON.stringify({
      userId,
      cartItems: cartItems,
    })
  );

  return session.url;
}
