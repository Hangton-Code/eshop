"use client";

import {
  ChevronDown,
  CircleCheckBig,
  Globe,
  Paperclip,
  ScanLine,
  Package,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AutoResizeTextarea } from "./autoresize-textarea";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Attachment } from "ai";
import { PreviewAttachment } from "./preview-attachment";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";

export const models = {
  "google/gemini-2.5-flash-preview-09-2025": {
    name: "Gemini 2.5 Flash",
    description: "Generally Recommended",
  },
  "qwen/qwen3-vl-235b-a22b-instruct": {
    name: "Qwen 3 VL",
    description: "Great model as well",
  },
};

type ChatFormProps = {
  handleSubmit: any;
  textInput: string;
  setTextInput: (input: string) => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  status: "submitted" | "streaming" | "ready" | "error";
  enableWebSearch: boolean;
  setEnableWebSearch: (v: boolean) => void;
  enableOrderCheck: boolean;
  setEnableOrderCheck: (v: boolean) => void;
  model: string;
  setModel: (v: string) => void;
};

export function ChatForm({
  handleSubmit,
  textInput,
  setTextInput,
  attachments,
  setAttachments,
  status,
  enableWebSearch,
  setEnableWebSearch,
  enableOrderCheck,
  setEnableOrderCheck,
  model,
  setModel,
}: ChatFormProps) {
  const { generateToken, isAvailable } = useRecaptcha();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitForm();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      let recaptchaToken = "";
      if (isAvailable) {
        recaptchaToken = await generateToken("file_upload");
      }

      if (recaptchaToken) {
        formData.append("recaptchaToken", recaptchaToken);
      }

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;
      if (fileInputRef.current) fileInputRef.current.value = "";

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  const removeAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((v) => v.url !== url));
  };

  const submitForm = useCallback(async () => {
    if (!textInput.trim()) return;

    try {
      let recaptchaToken = "";
      if (isAvailable) {
        recaptchaToken = await generateToken("chat_submit");
      }

      handleSubmit(
        undefined,
        {
          experimental_attachments: attachments,
        },
        {
          body: {
            enableWebSearch,
            enableOrderCheck,
            recaptchaToken,
          },
        }
      );

      setAttachments([]);
    } catch (error) {
      console.error("reCAPTCHA verification failed:", error);
      toast.error("Verification failed. Please try again.");
    }
  }, [
    handleSubmit,
    attachments,
    generateToken,
    isAvailable,
    enableWebSearch,
    enableOrderCheck,
  ]);

  return (
    <Card className="relative px-4 pt-5 pb-3 w-full max-w-3xl flex flex-col gap-4.5">
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment
              handleDelete={() => removeAttachment(attachment.url)}
              key={attachment.url}
              attachment={attachment}
              enableDelete
            />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              enableDelete={false}
            />
          ))}
        </div>
      )}

      <AutoResizeTextarea
        className="border-none outline-none bg-transparent w-full"
        placeholder="Ask me something"
        onKeyDown={handleKeyDown}
        onChange={(v) => setTextInput(v)}
        value={textInput}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => fileInputRef.current?.click()}
            className="shadow-none rounded-full"
          >
            <Paperclip />
          </Button>
          {/* {depricated web search button} */}
          {/* <Button
            variant={"outline"}
            onClick={() => setEnableWebSearch((prev) => !prev)}
            className={cn(
              enableWebSearch
                ? "bg-muted hover:bg-muted"
                : "hover:bg-background",
              "select-none shadow-none"
            )}
          >
            <Search />
            Web Search
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant={"ghost"} className="rounded-full">
                <Globe /> {enableWebSearch ? "All Sources" : "EShop Only"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="[--radius:1rem]"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                  <label htmlFor="web-search">
                    <Globe /> Web Search{" "}
                    <Switch
                      id="web-search"
                      className="ml-auto"
                      checked={enableWebSearch}
                      onCheckedChange={setEnableWebSearch}
                      defaultChecked
                    />
                  </label>
                </DropdownMenuItem>
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                  <label htmlFor="product-search">
                    <ScanLine /> Product Search
                    <Switch
                      id="product-search"
                      className="ml-auto"
                      defaultChecked
                      disabled
                    />
                  </label>
                </DropdownMenuItem>
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                  <label htmlFor="order-check">
                    <Package /> Order Check
                    <Switch
                      id="order-check"
                      className="ml-auto"
                      checked={enableOrderCheck}
                      onCheckedChange={setEnableOrderCheck}
                      defaultChecked
                    />
                  </label>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  We'll only search in the sources selected here.
                </DropdownMenuLabel>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* // <Button className="rounded-full w-10 h-10 p-0">
          //   <div className="w-3.5 h-3.5 rounded-xs bg-primary-foreground"></div>
          // </Button> */}
        {/* <Button
          className="rounded-full w-10 h-10 p-0 flex justify-center items-center"
          variant={"secondary"}
          onClick={submitForm}
          disabled={status === "streaming" || status === "submitted"}
        >
          <ArrowUp />
        </Button> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"secondary"} className="rounded-full">
              <ChevronDown />{" "}
              {models[model as keyof typeof models]?.name ?? model}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            className="[--radius:1.4rem] p-1.5"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-sm">
                Inference Model
              </DropdownMenuLabel>
              {Object.entries(models).map(([id, info]) => (
                <DropdownMenuItem
                  key={id}
                  onSelect={() => setModel(id as keyof typeof models)}
                >
                  <div className="flex justify-between w-full items-center">
                    <div className="p-1">
                      <p className="font-medium">{info.name}</p>
                      {info.description && (
                        <p className="text-muted-foreground text-xs">
                          {info.description}
                        </p>
                      )}
                    </div>
                    {model === id && (
                      <div className="pr-3">
                        <CircleCheckBig
                          className="text-blue-600"
                          strokeWidth={2.5}
                        />
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Inferences to any of the above models are free.
              </DropdownMenuLabel>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
