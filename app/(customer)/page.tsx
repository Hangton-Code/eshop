"use client";

import { ChatForm } from "@/components/chat-form";
import { generateUUID } from "@/lib/utils";
import { Attachment } from "ai";
import { ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [textInput, setTextInput] = useState("");
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const router = useRouter();
  const handleSubmit = async () => {
    const id = generateUUID();
    if (!id) return;
    router.push(
      `/chat/${id}?prompt=${textInput}&attachments=${JSON.stringify(
        attachments ?? []
      )}&enableWebSearch=${enableWebSearch}`
    );
  };

  return (
    <div className="flex h-[calc(100vh-60px)] items-center justify-center container mx-auto flex-col gap-14">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 select-none">
          <ScanLine className="w-9 h-9" />
          <h1 className="text-4xl font-medium underline underline-offset-4 decoration-dotted ">
            EShop
          </h1>
        </div>
        {/* <h1 className="text-lg">
          <span className="text-orange-500 font-semibold underline">
            Redefining
          </span>{" "}
          E-Commerce,{" "}
          <span className="text-purple-500 font-semibold underline decoration-wavy">
            Unlocking
          </span>{" "}
          Tomorrow
        </h1> */}
      </div>
      <div className="max-w-[700px] w-full">
        <ChatForm
          handleSubmit={handleSubmit}
          textInput={textInput}
          setTextInput={setTextInput}
          attachments={attachments}
          setAttachments={setAttachments}
          status="ready"
          enableWebSearch={enableWebSearch}
          setEnableWebSearch={setEnableWebSearch}
        />
      </div>
    </div>
  );
}
