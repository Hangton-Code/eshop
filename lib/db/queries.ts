import { db } from "@/db/index";
import { CartItem, Chat, Merchant, Message, Order, Product } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import {
  and,
  asc,
  cosineDistance,
  desc,
  eq,
  gt,
  inArray,
  lt,
  sql,
  type SQL,
} from "drizzle-orm";
import { generateTitleFromUserMessage } from "../ai/features";
import { Attachment, UIMessage } from "ai";
import { getEmbeddings } from "../ai/embeddings";
import { redisClient } from "../redis";

export async function getChatById(id: string) {
  const chat = await db.select().from(Chat).where(eq(Chat.id, id));

  return chat.length > 0 ? chat[0] : null;
}

export async function getMessages(id: string, userId: string) {
  return await db
    .select()
    .from(Message)
    .innerJoin(Chat, eq(Message.chatId, Chat.id))
    .where(and(eq(Message.chatId, id), eq(Chat.userId, userId)))
    .orderBy(asc(Message.createdAt));
}

export async function saveMessages(messages: Array<Message>) {
  return await db.insert(Message).values(messages);
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(Chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(Chat.userId, id))
            : eq(Chat.userId, id)
        )
        .orderBy(desc(Chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(Chat)
        .where(eq(Chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new Error(
          `not_found:database
          Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(Chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(Chat)
        .where(eq(Chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new Error(
          `not_found:database
          Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(Chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch {
    throw new Error(
      `bad_request:database
      Failed to get chats by user id`
    );
  }
}

export async function deleteChatById(id: string) {
  await db.delete(Message).where(eq(Message.chatId, id));

  const [chatsDeleted] = await db
    .delete(Chat)
    .where(eq(Chat.id, id))
    .returning();
  return chatsDeleted;
}

export async function createChat(id: string, initialMessage: UIMessage) {
  try {
    const { userId } = await auth();
    if (!userId)
      return {
        id: null,
      };

    const title = await generateTitleFromUserMessage(initialMessage);

    // create chat
    const chats = await db
      .insert(Chat)
      .values({
        userId,
        id,
        title: title,
      })
      .returning();

    return {
      id: chats[0].id,
    };
  } catch {
    throw new Error("Failed to create chat");
  }
}

export async function getMerchantsByUserId(userId: string) {
  return db.select().from(Merchant).where(eq(Merchant.userId, userId));
}

export function getProductsByMerchantId(merchantId: string) {
  return db
    .select()
    .from(Product)
    .where(eq(Product.merchantId, merchantId))
    .orderBy(desc(Product.code));
}

export async function getProductById(id: string) {
  const product = await redisClient.get(`product:${id}`);
  if (product) {
    return JSON.parse(product);
  }

  const productFromDB = (
    await db.select().from(Product).innerJoin(Merchant, eq(Product.merchantId, Merchant.id)).where(eq(Product.id, id))
  )[0];
  await redisClient.set(
    `product:${id}`,
    JSON.stringify({
      merchant: productFromDB.Merchant,
      product: {
        ...productFromDB.Product,
        embedding: [],
      },
    })
  );

  return {
    merchant: productFromDB.Merchant,
    product: {
      ...productFromDB.Product,
      embedding: [],
    },
  };
}

export async function searchProductsByText(text: string) {
  const embedding = await getEmbeddings(text);

  const similarity = sql<number>`1 - (${cosineDistance(
    Product.embedding,
    embedding
  )})`;
  const similarProducts = await db
    .select({
      id: Product.id,
      name: Product.name,
      price: Product.price,
      brand: Product.brand,
      similarity,
      covers: Product.covers,
      merchantId: Product.merchantId,
    })
    .from(Product)
    .where(gt(similarity, 0.3))
    .orderBy((t) => desc(t.similarity))
    .limit(20);
  return similarProducts as {
    id: string;
    name: string;
    price: number;
    similarity: number;
    covers: Attachment[];
    brand: string;
    merchantId: string;
  }[];
}

export async function getMerchantsByIds(ids: string[]) {
  return db.select().from(Merchant).where(inArray(Merchant.id, ids));
}

export async function findCartItemByProductId(
  productId: string,
  userId: string
) {
  return db
    .select()
    .from(CartItem)
    .where(and(eq(CartItem.productId, productId), eq(CartItem.userId, userId)));
}

export async function getOrdersByPaymentId(paymentId: string) {
  return await db
    .select()
    .from(Order)
    .where(eq(Order.stripePaymentId, paymentId));
}

export async function getCartItemsByIds(cartItemIds: string[]) {
  return await db
    .select()
    .from(CartItem)
    .where(inArray(CartItem.id, cartItemIds));
}

export async function getOrdersByMerchantId(merchantId: string) {
  return await db.select().from(Order).innerJoin(Merchant, eq(Order.merchantId, Merchant.id)).where(eq(Merchant.id, merchantId)).orderBy(desc(Order.createdAt));
}

export async function getOrderById(orderId: number, userId: string) {
  return (await db.select().from(Order).innerJoin(Merchant, eq(Order.merchantId, Merchant.id)).where(and(eq(Order.id, orderId), eq(Merchant.userId, userId))))[0];
}

export async function getOrdersByCustomerId(customerId: string) {
  return await db
    .select()
    .from(Order)
    .where(eq(Order.customerId, customerId))
    .orderBy(desc(Order.createdAt));
}

export async function getTotalRevenueByMerchantId(merchantId: string) {
  return await db
    .select({
      grossTotal: sql<number>`sum(${Order.grossTotal})`,
      netTotal: sql<number>`sum(${Order.netTotal})`,
    })
    .from(Order)
    .where(eq(Order.merchantId, merchantId))
    .groupBy(Order.merchantId);
}

export async function getNumberOfCustomersByMerchantId(merchantId: string) {
  return (
    await db
      .select({})
      .from(Order)
      .where(eq(Order.merchantId, merchantId))
      .groupBy(Order.customerId)
  ).length;
}
