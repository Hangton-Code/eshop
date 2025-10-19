import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CoreAssistantMessage, CoreToolMessage } from "ai";

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const convertToActualPathInCMS = ({
  merchantId,
  path,
}: {
  merchantId: string;
  path: string;
}) => {
  return `/cms/${merchantId}/${path}`;
};

export const wordCount = (v: string) => {
  return v.trim().split(/\s+/).filter(Boolean).length;
};
