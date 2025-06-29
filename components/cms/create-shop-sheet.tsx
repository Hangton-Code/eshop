"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Attachment } from "ai";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { Trash } from "lucide-react";
import { createMerchant } from "@/actions/cms/merchants";
import { useRouter } from "next/navigation";

type CreateShopSheetProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  hasTrigger: boolean;
};

export function CreateShopSheet({
  open,
  setOpen,
  hasTrigger,
}: CreateShopSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const bannerPictureInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<Attachment>();
  const [bannerPicture, setBannerPicture] = useState<Attachment>();
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const handleFileChange = useCallback(
    async (
      event: ChangeEvent<HTMLInputElement>,
      type: "profile" | "banner"
    ) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      if (files.length > 1) {
        toast.error("You can only upload one file at a time");
        return;
      }

      if (profilePictureInputRef.current)
        profilePictureInputRef.current.value = "";
      if (bannerPictureInputRef.current)
        bannerPictureInputRef.current.value = "";

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        if (type === "profile") {
          setProfilePicture(successfullyUploadedAttachments[0]);
        } else {
          setBannerPicture(successfullyUploadedAttachments[0]);
        }
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setProfilePicture]
  );

  const handleRemovePicture = (type: "profile" | "banner") => {
    if (type === "profile") {
      setProfilePicture(undefined);
    } else {
      setBannerPicture(undefined);
    }
  };
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!name || !description) {
      toast.error("Please fill in all fields");
      return setIsLoading(false);
    }

    const merchant = await createMerchant({
      name,
      description,
      bannerUrl: bannerPicture?.url,
      profilePictureUrl: profilePicture?.url,
    });
    if (!merchant) {
      toast.error("Failed to create shop, please try again!");
      setIsLoading(false);
    }

    if (merchant) router.push(`/cms/${merchant.id}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {hasTrigger && (
        <SheetTrigger asChild>
          <Button className="w-full">Create New Shop</Button>
        </SheetTrigger>
      )}

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Shop</SheetTitle>
          <SheetDescription>
            Create a new shop to start selling products.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="shop-name">Name</Label>
            <Input
              id="shop-name"
              placeholder="ICT Limited"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="shop-description">Description</Label>
            <Textarea
              id="shop-description"
              placeholder="ICT Limited is a retail store dedicated to ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex gap-1 items-center ">
              <Label>Pictures</Label>
              <Badge variant={"secondary"}>Optional</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                ref={profilePictureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "profile")}
              />
              <Input
                ref={bannerPictureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "banner")}
              />
              <div
                onClick={() => {
                  if (!profilePicture) profilePictureInputRef.current?.click();
                }}
                className="relative flex justify-center items-center gap-2  flex-col border border-border w-full aspect-square bg-gradient-to-b from-neutral-50 hover:from-neutral-100 to-neutral-100 transition-colors rounded-md"
              >
                {profilePicture ? (
                  <>
                    <img
                      src={profilePicture.url}
                      alt={profilePicture.name}
                      className="w-full h-full object-contain rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => handleRemovePicture("profile")}
                    >
                      <Trash />
                    </Button>
                  </>
                ) : (
                  <p className="font-bold">Profile Picture</p>
                )}
              </div>

              <div
                onClick={() => {
                  if (!bannerPicture) bannerPictureInputRef.current?.click();
                }}
                className="relative flex justify-center items-center gap-2 flex-col border border-border w-full aspect-square bg-gradient-to-b from-neutral-50 hover:from-neutral-100 to-neutral-100 transition-colors rounded-md"
              >
                {bannerPicture ? (
                  <>
                    <img
                      src={bannerPicture.url}
                      alt={bannerPicture.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => handleRemovePicture("banner")}
                    >
                      <Trash />
                    </Button>
                  </>
                ) : (
                  <p className="font-bold">Banner Picture</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            Hit the road
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function CreateShopInHome() {
  const [createShopSheetOpen, setCreateShopSheetOpen] = useState(false);
  return (
    <CreateShopSheet
      open={createShopSheetOpen}
      setOpen={setCreateShopSheetOpen}
      hasTrigger={true}
    />
  );
}
