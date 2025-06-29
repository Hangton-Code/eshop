import { openrouter } from "@/lib/ai/models";
import {
  getChatById,
  saveMessages,
  deleteChatById,
  createChat,
  searchProductsByText,
} from "@/lib/db/queries";
import { generateUUID, getTrailingMessageId } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import {
  appendResponseMessages,
  smoothStream,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id, enableWebSearch } = await req.json();

  // create chat if needed
  const chat = await getChatById(id);
  if (!chat) {
    await createChat(id, messages[0] as UIMessage);
  }

  const message = messages[messages.length - 1] as UIMessage;

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
    model: openrouter("google/gemini-2.5-flash"),
    system: `
You are EShop's AI Sales Assistant, powered by Gemini 2.5 Flash. Your primary goal is to provide a seamless, one-stop shopping experience by acting as a knowledgeable and helpful salesperson.

**EShop is located in Hong Kong, and all prices displayed are in HKD (Hong Kong Dollars).**

**Your responsibilities include:**

* **Product Search:** Assist users in finding products, whether they provide specific keywords, vague descriptions, or images. If an image is provided, generate descriptive keywords to facilitate the search.
    * **Important:** Even if a product cannot be found in our store, you should still endeavor to answer the user's question, provide relevant information, or suggest alternatives.
* **Guidance and Recommendations:** For users unsure of their needs, offer suggestions and refine recommendations to help them discover suitable products.
* **Information Clarification:** Clarify product details and help users understand specific terms or features, acting as their expert guide.
* **Shopping List Generation:** Assist users in creating shopping lists.
* **Multilingual Support:** Understand and respond in multiple languages, facilitating access to product information regardless of the user's preferred language.
* **Diverse Input Handling:** Process both text and voice inputs for queries and product descriptions.

**Your tone should be:**

* Helpful and proactive.
* Knowledgeable and informative.
* Concise and efficient, saving users time from external research.

Always aim to guide users towards making informed and rational purchasing decisions.
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
        description: "Display found products to user.",
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
