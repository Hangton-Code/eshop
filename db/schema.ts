import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  json,
  text,
  serial,
  real,
  boolean,
  integer,
  vector,
  unique,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const Chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 255 }),
  title: varchar("title", { length: 255 }),
});

export type Chat = InferSelectModel<typeof Chat>;

export const Message = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => Chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("chat_id_index").on(table.chatId)]);

// CMS System

export const Merchant = pgTable("Merchant", {
  id: uuid("merchant_id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  pictureUrl: text("picture_url"),
  bannerUrl: text("banner_url"),
  name: varchar("name", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  description: text("description").notNull(),
});

export type Merchant = InferSelectModel<typeof Merchant>;

export const Product = pgTable(
  "Product",
  {
    id: uuid("id").primaryKey(),
    code: integer("code").notNull(),
    merchantId: uuid("merchant_id")
      .notNull()
      .references(() => Merchant.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    price: real("price").notNull(),
    inventory: integer("inventory").notNull(),
    category: varchar("category", { length: 255 }).notNull(),
    mfgCountry: varchar("mfg_country", { length: 255 }).notNull(),
    brand: varchar("brand", { length: 255 }).notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    hidden: boolean("hidden").default(false),
    covers: json("covers").notNull(),
  },
  (table) => [unique("code_merchant_id_unique").on(
        table.code,
        table.merchantId
      ),
      index("merchant_id_index").on(table.merchantId)
    ]
);

export type Product = InferSelectModel<typeof Product>;

// --- Order System

export const Order = pgTable("Order", {
  id: serial("id").primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => Merchant.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),
  productId: uuid("product_id")
    .notNull()
    .references(() => Product.id),
  productDetails: json("product_details").notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: real("price_pu").notNull(),
  grossTotal: real("gross_total").notNull(),
  netTotal: real("net_total").notNull(),
  settled: boolean("settled").notNull(),
  deliveryAddress: json("delivery_address").notNull(),
  deliveryStatus: varchar("delivery_status", {
    length: 50,
    enum: ["ORDERED", "SHIPPED", "DELIVERED", "CANCELED"],
  }).notNull(),
  receiverPhoneNo: varchar("receiver_phone_no", { length: 20 }).notNull(),
  receiverName: varchar("receiver_name", { length: 255 }).notNull(),
  deliveryCode: varchar("delivery_code", { length: 255 }),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
}, (table) => [index("merchant_id_index").on(table.merchantId), index("customer_id_index").on(table.customerId)]);

export type ProductDetails = {
  name: string;
  pictureUrl?: string;
};

export type Order = InferSelectModel<typeof Order>;

// export const AddressPrefill = pgTable("AddressPrefill", {
//   id: serial("id").primaryKey(),
//   userId: varchar("user_id", { length: 255 }).notNull(),
//   isDefault: boolean("default").default(false).notNull(),
//   receiverName: varchar("receiver_name", { length: 255 }).notNull(),
//   address: text("address").notNull(),
//   receiverPhoneNo: varchar("receiver_phone_no", { length: 20 }).notNull(),
//   badges: json("badges"),
// });

export type Message = InferSelectModel<typeof Message>;

export const CartItem = pgTable(
  "CartItem",
  {
    id: uuid("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => Product.id),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
    (table) => [
      unique("product_user_unique").on(
        table.productId,
        table.userId
      ),
      index("user_id_index").on(table.userId)
    ]
);

export type CartItem = InferSelectModel<typeof CartItem>;
