import { openrouter } from "@/lib/ai/models";
import {
  getChatById,
  saveMessages,
  deleteChatById,
  createChat,
  searchProductsByText,
  getOrdersByCustomerId,
} from "@/lib/db/queries";
import { generateUUID, getTrailingMessageId, wordCount } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import {
  appendResponseMessages,
  smoothStream,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { z } from "zod";
import {
  verifyRecaptchaToken,
  validateRecaptchaResponse,
} from "@/lib/recaptcha";

// Allow streaming responses up to 200 seconds
export const maxDuration = 200;
export const dynamic = "force-dynamic";

const acceptedModelKeys = [
  "google/gemini-2.5-flash-preview-09-2025",
  "qwen/qwen3-vl-235b-a22b-instruct",
];

export async function POST(req: Request) {
  const {
    messages,
    id,
    enableWebSearch,
    enableOrderCheck,
    recaptchaToken,
    model,
  } = await req.json();

  if (!acceptedModelKeys.includes(model))
    return new Response("Server error", { status: 400 });

  if (recaptchaToken) {
    try {
      const recaptchaResponse = await verifyRecaptchaToken(recaptchaToken);
      if (!validateRecaptchaResponse(recaptchaResponse, 0.5)) {
        return new Response("reCAPTCHA verification failed", { status: 403 });
      }
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      return new Response("reCAPTCHA verification failed", { status: 403 });
    }
  }

  const chat = await getChatById(id);
  if (!chat) {
    await createChat(id, messages[0] as UIMessage);
  }

  const message = messages[messages.length - 1] as UIMessage;

  // data validation
  const part = message.parts[0] as any;
  if (typeof part.text !== "string") {
    return Response.json({ error: "Invalid message format" }, { status: 400 });
  }

  const messageWordCount = wordCount(part.text);
  if (messageWordCount > 5000) {
    return Response.json(
      {
        error: `Message is too long. Maximum 5000 words allowed. Your message has ${messageWordCount} words.`,
      },
      { status: 400 }
    );
  }

  await saveMessages([
    {
      id: message.id,
      attachments: message.experimental_attachments ?? [],
      chatId: id,
      createdAt: new Date(),
      parts: message.parts,
      role: message.role,
    },
  ]);

  const result = streamText({
    model: openrouter(model),
    system: `
You are EShop's AI Sales Assistant. Your primary goal is to provide a seamless, one-stop shopping experience by acting as a knowledgeable and helpful salesperson.

**About EShop:**
* EShop is a large-scale e-commerce marketplace similar to Amazon or Taobao, featuring a vast catalog of products across many categories.
* We connect customers with multiple merchants and offer a wide variety of products ranging from electronics, fashion, home goods, to everyday essentials.
* EShop is located in Hong Kong, and all prices displayed are in HKD (Hong Kong Dollars).

**Your responsibilities include:**

* **Product Search:** Assist users in finding products, whether they provide specific keywords, vague descriptions, or images. If an image is provided, generate descriptive keywords to facilitate the search.
    * **Important:** Even if a product cannot be found in our store, you should still endeavor to answer the user's question, provide relevant information, or suggest alternatives.
* **Order Tracking:** Help users check their order history and status when they ask about their orders. By default, only show onboarding orders (orders that haven't been delivered yet). Only show complete order history including delivered orders if they explicitly ask for "all orders", "order history", or "past orders". If they have no onboarding orders, inform them that they have no pending orders.
* **Guidance and Recommendations:** For users unsure of their needs, offer suggestions and refine recommendations to help them discover suitable products.
* **Information Clarification:** Clarify product details and help users understand specific terms or features, acting as their expert guide.
* **Shopping List Generation:** Assist users in creating shopping lists.
* **Multilingual Support:** Understand and respond in multiple languages, facilitating access to product information regardless of the user's preferred language.
* **Diverse Input Handling:** Process text inputs for queries and product descriptions.

**Your tone should be:**

* Helpful and proactive.
* Knowledgeable and informative.
* Concise and efficient, saving users time from external research.

Always aim to guide users towards making informed and rational purchasing decisions.

Focus on providing helpful, contextual responses to user queries. When appropriate, you may use available tools to enhance the user experience, but do not mention or reference any UI elements, buttons, or prompts in your text responses.

**Important:** After using web search, never include or display URLs or website links in your responses. Synthesize the information naturally without citing sources or showing where the information came from.
    `,
    messages,
    experimental_generateMessageId: generateUUID,
    experimental_transform: smoothStream({ chunking: "word" }),
    maxSteps: 10,
    providerOptions: {
      openrouter: {
        plugins: enableWebSearch === true ? [{ id: "web" }] : [],
      },
    },
    tools: {
      searchProducts: tool({
        description: "Search products by text using vector similarity.",
        parameters: z.object({
          text: z.string().describe("keywords related to products."),
        }),
        execute: async ({ text }) => {
          const products = await searchProductsByText(text);
          return products;
        },
      }),
      showFoundProducts: tool({
        description: "Display products found to user.",
        parameters: z.object({
          products: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              price: z.number(),
              covers: z.array(
                z.object({
                  url: z.string(),
                })
              ),
            })
          ),
        }),
        execute: async () => {
          return "Products are displayed to the user";
        },
      }),
      getUserOrders: tool({
        description:
          "Fetch the user's order history. By default, only fetch orders that are still onboarding (not delivered yet - status ORDERED or SHIPPED). Only include delivered or canceled orders if the user explicitly asks for their complete order history or past orders.",
        parameters: z.object({
          includeAllOrders: z
            .boolean()
            .optional()
            .describe(
              "Set to true only if user explicitly asks for all orders, complete order history, or past orders. Default is false to only show onboarding orders."
            ),
        }),
        execute: async ({ includeAllOrders = false }) => {
          if (!enableOrderCheck) {
            return { error: "Order checking is disabled by user" };
          }

          const { userId } = await auth();
          if (!userId) {
            return { error: "User not authenticated" };
          }

          const allOrders = await getOrdersByCustomerId(userId);

          // By default, only return orders that are still onboarding (not delivered yet)
          if (!includeAllOrders) {
            const onboardingOrders = allOrders.filter(
              (order) =>
                order.deliveryStatus === "ORDERED" ||
                order.deliveryStatus === "SHIPPED"
            );
            return onboardingOrders;
          }

          return allOrders;
        },
      }),
      showUserOrders: tool({
        description: "Display user's orders to the user.",
        parameters: z.object({
          orders: z.array(
            z.object({
              id: z.number(),
              productDetails: z.object({
                name: z.string(),
                pictureUrl: z.string().optional(),
                brand: z.string().optional(),
                description: z.string().optional(),
                merchantId: z.string().optional(),
                merchantName: z.string().optional(),
              }),
              quantity: z.number(),
              pricePerUnit: z.number(),
              grossTotal: z.number(),
              deliveryStatus: z.enum([
                "ORDERED",
                "SHIPPED",
                "DELIVERED",
                "CANCELED",
              ]),
              createdAt: z.string(),
            })
          ),
        }),
        execute: async () => {
          return "Orders are displayed to the user";
        },
      }),
    },
    onFinish: async ({ response }) => {
      const assistantId = getTrailingMessageId({
        messages: response.messages.filter(
          (message) => message.role === "assistant"
        ),
      });

      if (!assistantId) {
        throw new Error("No assistant message found!");
      }

      const [, assistantMessage] = appendResponseMessages({
        messages: [message],
        responseMessages: response.messages,
      });

      await saveMessages([
        {
          id: assistantMessage.id,
          chatId: id,
          role: assistantMessage.role,
          parts: assistantMessage.parts,
          attachments: assistantMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ]);
    },
  });

  return result.toDataStreamResponse();
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json(
      {},
      {
        status: 400,
      }
    );
  }

  const { userId } = await auth();

  if (!userId)
    return Response.json(
      {},
      {
        status: 401,
      }
    );

  const chat = await getChatById(id);
  if (!chat)
    return Response.json(
      {},
      {
        status: 400,
      }
    );

  if (chat.userId !== userId) {
    return Response.json(
      {},
      {
        status: 403,
      }
    );
  }

  const deletedChat = await deleteChatById(id);

  return Response.json(deletedChat, { status: 200 });
}
