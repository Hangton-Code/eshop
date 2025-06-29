import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { Chat } from "./chat";
import { Message } from "@/db/schema";
import type { Attachment, UIMessage } from "ai";

function convertToUIMessages(messages: Array<Message>): Array<UIMessage> {
  return messages.map((message) => ({
    id: message.id,
    parts: message.parts as UIMessage["parts"],
    role: message.role as UIMessage["role"],
    // Note: content will soon be deprecated in @ai-sdk/react
    content: "",
    createdAt: message.createdAt,
    experimental_attachments: (message.attachments as Array<Attachment>) ?? [],
  }));
}

export default async function ChatPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { userId } = await auth();

  const chat = await getChatById(id);

  if (chat && chat.userId !== userId) return null;

  const messagesFromDb = await getMessagesByChatId(id);

  return (
    <div className="flex h-screen pt-15 items-center justify-center mx-auto">
      <Chat id={id} initialMessages={convertToUIMessages(messagesFromDb)} />
    </div>
  );
}
