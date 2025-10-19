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
import { Button } from "@/components/ui/button";
import { Store, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const { t } = useLanguage();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [textInput, setTextInput] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  const [enableWebSearch, _setEnableWebSearch] = useState(true);
  const [enableOrderCheck, _setEnableOrderCheck] = useState(true);
  const [model, _setModel] = useState(
    "google/gemini-2.5-flash-preview-09-2025"
  );
  const router = useRouter();
  const handleSubmit = async () => {
    if (!textInput.trim()) return;

    // Validate word count (max 5000 words)
    const wordCount = textInput.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 5000) {
      toast.error(
        `Message is too long. Maximum 5000 words allowed. Your message has ${wordCount} words.`
      );
      return;
    }

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
      console.log(defaultEnableWebSearch);
      _setEnableWebSearch(defaultEnableWebSearch === "false" ? false : true);
    } else {
      window.localStorage.setItem("enableWebSearch", "true");
    }

    // order check
    const defaultEnableOrderCheck =
      window.localStorage.getItem("enableOrderCheck");
    if (defaultEnableOrderCheck) {
      _setEnableOrderCheck(defaultEnableOrderCheck === "false" ? false : true);
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
    <div className="relative h-full">
      {showBanner && (
        <div className="absolute top-15 left-0 right-0 z-10 w-full border-b bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-orange-300/50 dark:border-orange-700/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/20">
                  <Store className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {t("becomeMerchant")}
                  </h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {t("becomeMerchantDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/cms">
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    {t("visitCMS")}
                    <ArrowRight className="ml-1.5 w-3 h-3" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowBanner(false)}
                  aria-label="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          `h-full container mx-auto px-4 transition-all`,
          tabValue === "chat"
            ? `pt-[108px] flex justify-center flex-col`
            : "pt-[108px] py-30"
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
    </div>
  );
}
