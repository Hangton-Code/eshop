import type { Attachment } from "ai";
import { LoaderIcon, X } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  handleDelete,
  enableDelete,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  handleDelete?: () => void;
  enableDelete: boolean;
}) => {
  const { name, url, contentType } = attachment;

  return (
    <div className="group w-20 h-20 rounded-xl bg-muted overflow-hidden relative flex flex-col items-center justify-center">
      {contentType ? (
        contentType.startsWith("image") ? (
          <Image
            key={url}
            src={url}
            alt={name ?? "an image attachment"}
            className="size-full object-cover"
            width={80}
            height={80}
          />
        ) : (
          <div className="" />
        )
      ) : (
        <div className="" />
      )}

      {isUploading && (
        <div className="animate-spin absolute text-primary">
          <LoaderIcon />
        </div>
      )}

      {/* delete button */}
      {enableDelete ? (
        <Button
          className="group-hover:flex hidden rounded-full absolute w-6 h-6 right-1 top-1"
          variant={"secondary"}
          size="sm"
          onClick={handleDelete}
        >
          <X />
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};
