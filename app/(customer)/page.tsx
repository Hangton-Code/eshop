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
import { Highlighter } from "@/components/ui/highlighter";
import { SparklesText } from "@/components/ui/sparkles-text";
import { HyperText } from "@/components/ui/hyper-text";
import { useLanguage } from "@/lib/i18n/language-context";

export default function Home() {
  const { t } = useLanguage();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [textInput, setTextInput] = useState("");

  const [enableWebSearch, _setEnableWebSearch] = useState(true);
  const [enableOrderCheck, _setEnableOrderCheck] = useState(true);
  const [model, _setModel] = useState(
    "google/gemini-2.5-flash-preview-09-2025"
  );
  const router = useRouter();
  const handleSubmit = async () => {
    const id = generateUUID();
    if (!id) return;
    router.push(
      `/chat/${id}?prompt=${textInput}&attachments=${JSON.stringify(
        attachments ?? []
      )}&enableWebSearch=${enableWebSearch}&enableOrderCheck=${enableOrderCheck}&model=${model}`
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

    // order check
    const defaultEnableOrderCheck =
      window.localStorage.getItem("enableOrderCheck");
    if (defaultEnableOrderCheck) {
      _setEnableOrderCheck(Boolean(defaultEnableOrderCheck));
    } else {
      window.localStorage.setItem("enableOrderCheck", "true");
    }

    // model selection
    const defaultModel = window.localStorage.getItem("model");
    if (defaultModel) {
      _setModel(defaultModel);
    } else {
      window.localStorage.setItem(
        "model",
        "google/gemini-2.5-flash-preview-09-2025"
      );
    }
  }, []);

  const setEnableWebSearch = (v: boolean) => {
    _setEnableWebSearch(v);
    window.localStorage.setItem("enableWebSearch", String(v));
  };

  const setEnableOrderCheck = (v: boolean) => {
    _setEnableOrderCheck(v);
    window.localStorage.setItem("enableOrderCheck", String(v));
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
            ? "flex flex-col items-center gap-4 mb-16"
            : "hidden"
        )}
      >
        <div className="flex items-center gap-3 select-none">
          <ScanLine className="w-11 h-11" />
          <HyperText className="text-5xl">EShop</HyperText>
        </div>
        <p className="text-lg text-primary text-center max-w-2xl">
          {t("homeTagline1")}{" "}
          <Highlighter action="underline" color="#FF9800">
            {t("homeTagline2")}
          </Highlighter>{" "}
          {t("homeTagline3")}{" "}
          <Highlighter action="highlight" color="#ffdf20">
            {t("homeTagline4")}
          </Highlighter>{" "}
          {t("homeTagline5")}
        </p>
      </div>

      <Tabs
        defaultValue="chat"
        value={tabValue}
        onValueChange={setTabValue}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="chat">{t("chatTab")}</TabsTrigger>
          <TabsTrigger value="explore">{t("exploreTab")}</TabsTrigger>
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
              enableOrderCheck={enableOrderCheck}
              setEnableOrderCheck={setEnableOrderCheck}
              model={model}
              setModel={setModel}
            />
            <div className="flex  justify-end">
              <p className="text-muted-foreground text-xs mt-2">
                {t("llmPoweredBy")}{" "}
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
