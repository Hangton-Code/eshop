"use client";

import { ChatForm } from "@/components/chat-form";
import { cn, generateUUID } from "@/lib/utils";
import { Attachment } from "ai";
import { ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RecaptchaAttribution from "@/components/recaptcha-attribution";
import { ExploreSection } from "@/components/explore-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [textInput, setTextInput] = useState("");

  const [enableWebSearch, _setEnableWebSearch] = useState(true);
  const [model, _setModel] = useState("google/gemini-2.5-flash");
  const router = useRouter();
  const handleSubmit = async () => {
    const id = generateUUID();
    if (!id) return;
    router.push(
      `/chat/${id}?prompt=${textInput}&attachments=${JSON.stringify(
        attachments ?? []
      )}&enableWebSearch=${enableWebSearch}&model=${model}`
    );
  };
  const [tabValue, setTabValue] = useState("chat");

  // preference localstorage
  useEffect(() => {
    // web search
    const defaultEnableWebSearch =
      window.localStorage.getItem("enableWebSearch");
    if (defaultEnableWebSearch) {
      _setEnableWebSearch(Boolean(defaultEnableWebSearch));
    } else {
      window.localStorage.setItem("enableWebSearch", "true");
    }

    // model selection
    const defaultModel = window.localStorage.getItem("model");
    if (defaultModel) {
      _setModel(defaultModel);
    } else {
      window.localStorage.setItem("model", "google/gemini-2.5-flash");
    }
  }, []);

  const setEnableWebSearch = (v: boolean) => {
    _setEnableWebSearch(v);
    window.localStorage.setItem("enableWebSearch", String(v));
  };

  const setModel = (v: string) => {
    _setModel(v);
    window.localStorage.setItem("model", v);
  };

  return (
    <div
      className={cn(
        `h-full container mx-auto px-4 py-15 transition-all`,
        tabValue === "chat" ? `flex justify-center flex-col` : "py-30"
      )}
    >
      <div
        className={cn(
          tabValue === "chat"
            ? "flex flex-col items-center gap-8 mb-12"
            : "hidden"
        )}
      >
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
              model={model}
              setModel={setModel}
            />
            <div className="flex  justify-end">
              <p className="text-muted-foreground text-xs mt-2">
                LLMs Inferencing is Powered by{" "}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenRouter
                </a>
              </p>
            </div>
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
