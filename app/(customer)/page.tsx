"use client";

import { ChatForm } from "@/components/chat-form";
import { cn, generateUUID } from "@/lib/utils";
import { Attachment } from "ai";
import { ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RecaptchaAttribution from "@/components/recaptcha-attribution";
import { ExploreSection } from "@/components/explore-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [tabValue, setTabValue] = useState("chat");

  return (
    <div
      className={cn(
        `h-full container mx-auto px-4 py-15 transition-all`,
        tabValue === "chat" ? `flex justify-center flex-col` : "py-30"
      )}
    >
      <div className="flex flex-col items-center gap-8 mb-12">
        <div className="flex items-center gap-2 select-none">
          <ScanLine className="w-9 h-9" />
          <h1 className="text-4xl font-medium underline underline-offset-4 decoration-dotted">
            EShop
          </h1>
        </div>
        <p className="text-lg text-muted-foreground text-center max-w-2xl">
          Discover amazing products and get AI-powered shopping assistance
        </p>
      </div>

      <Tabs
        defaultValue="chat"
        value={tabValue}
        onValueChange={setTabValue}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex justify-center">
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
        </TabsContent>

        <TabsContent value="explore" className="mt-8">
          <ExploreSection />
        </TabsContent>
      </Tabs>

      <div className="mt-16">
        <RecaptchaAttribution />
      </div>
    </div>
  );
}
