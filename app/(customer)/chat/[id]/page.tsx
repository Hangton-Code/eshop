import { getChatById, getMessages } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { Chat } from "./chat";
import { Message } from "@/db/schema";
import type { Attachment, UIMessage } from "ai";

export const dynamic = "force-dynamic";

function convertToUIMessages(messages: Array<Message>): Array<UIMessage> {
  return messages.map((message) => ({
    id: message.id,
    parts: message.parts as UIMessage["parts"],
    role: message.role as UIMessage["role"],
    content: "",
    createdAt: message.createdAt,
    experimental_attachments: (message.attachments as Array<Attachment>) ?? [],
  }));
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();

  if (!userId) return null;

  const messagesFromDb = await getMessages(id, userId);

  return (
    <div className="flex h-screen pt-15 items-center justify-center mx-auto">
      <Chat
        id={id}
        initialMessages={convertToUIMessages(
          messagesFromDb.map((message) => message.Message)
        )}
      />
    </div>
  );
}
