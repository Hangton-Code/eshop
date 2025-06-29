"use client";

import { ArrowUp, Paperclip, Search } from "lucide-react";
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
import { cn } from "@/lib/utils";

type ChatFormProps = {
  handleSubmit: any;
  textInput: string;
  setTextInput: (input: string) => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  status: "submitted" | "streaming" | "ready" | "error";
  enableWebSearch: boolean;
  setEnableWebSearch: Dispatch<SetStateAction<boolean>>;
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
}: ChatFormProps) {
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

  const submitForm = useCallback(() => {
    {
      handleSubmit(
        undefined,
        {
          experimental_attachments: attachments,
        },
        {
          body: {
            enableWebSearch,
          },
        }
      );

      setAttachments([]);
    }
  }, [handleSubmit, attachments]);

  return (
    <Card className="relative p-4 pb-3 w-full max-w-3xl flex flex-col gap-4">
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
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <AutoResizeTextarea
        className="border-none outline-none bg-transparent w-full"
        placeholder="What are the products that you want?"
        onKeyDown={handleKeyDown}
        onChange={(v) => setTextInput(v)}
        value={textInput}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => fileInputRef.current?.click()}
            className="shadow-none"
          >
            <Paperclip />
          </Button>
          <Button
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
          </Button>
        </div>
        {/* // <Button className="rounded-full w-10 h-10 p-0">
          //   <div className="w-3.5 h-3.5 rounded-xs bg-primary-foreground"></div>
          // </Button> */}
        <Button
          className="rounded-full w-10 h-10 p-0 flex justify-center items-center"
          variant={"secondary"}
          onClick={handleSubmit}
          disabled={status === "streaming" || status === "submitted"}
        >
          <ArrowUp />
        </Button>
      </div>
    </Card>
  );
}
