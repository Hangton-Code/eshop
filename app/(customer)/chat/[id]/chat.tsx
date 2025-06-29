"use client";

import { ChatForm } from "@/components/chat-form";
import { Message, ThinkingMessage } from "@/components/message";
import { useMessages } from "@/hooks/use-messages";
import { useChat } from "@ai-sdk/react";
import { Attachment, UIMessage } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn, sanitizeText } from "@/lib/utils";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { getChatHistoryPaginationKey } from "@/components/sidebar-history";

type ChatProps = {
  id: string;
  initialMessages: UIMessage[];
};

export function Chat({ id, initialMessages }: ChatProps) {
  const searchParams = useSearchParams();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [enableWebSearch, setEnableWebSearch] = useState<boolean>(
    searchParams.get("enableWebSearch") === "true"
  );

  const { messages, input, setInput, append, handleSubmit, status } = useChat({
    id,
    initialMessages,
  });

  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId: id,
    status,
  });

  const router = useRouter();

  // check for searchparams
  useEffect(() => {
    const initialPromptText = searchParams.get("prompt") as string;
    const attachments = searchParams.get("attachments")
      ? JSON.parse(searchParams.get("attachments") as string)
      : undefined;
    const enableWebSearch = searchParams.get("enableWebSearch") === "true";
    if (messages.length === 0 && initialPromptText) {
      append(
        {
          role: "user",
          content: initialPromptText,
          experimental_attachments: attachments,
        },
        {
          body: {
            enableWebSearch,
          },
        }
      );

      router.replace(window.location.pathname, { scroll: false });
    }
  }, []);

  const { isMobile } = useSidebar();

  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (status === "ready" && messages.length === 2) {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    }
  }, [messages, status]);

  return (
    <div className="w-full h-full">
      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 h-full overflow-y-scroll pt-4 relative pb-36"
      >
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            requiresScrollPadding={
              hasSentMessage && index === messages.length - 1
            }
            isLoading={status === "streaming" && messages.length - 1 === index}
          />
        ))}
        {status === "submitted" &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}

        <motion.div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
          onViewportLeave={onViewportLeave}
          onViewportEnter={onViewportEnter}
        />
      </div>

      <div
        className={cn(
          "fixed bottom-5 flex justify-center max-md:p-6",
          isMobile ? "w-screen" : "w-[calc(100vw-16rem)]"
        )}
      >
        <ChatForm
          handleSubmit={handleSubmit}
          textInput={input}
          setTextInput={setInput}
          attachments={attachments}
          setAttachments={setAttachments}
          status={status}
          enableWebSearch={enableWebSearch}
          setEnableWebSearch={setEnableWebSearch}
        />
      </div>
    </div>
  );
}
