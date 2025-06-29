"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { motion } from "motion/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Attachment } from "ai";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { Trash } from "lucide-react";
import { editMerchant } from "@/actions/cms/merchants";
import { Merchant } from "@/db/schema";

export default function ProfileManagementPageContent({
  id,
  merchant,
}: {
  id: string;
  merchant: Merchant;
}) {
  const [name, setName] = useState(merchant.name);
  const [description, setDescription] = useState(merchant.description);

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
  const [profilePicture, setProfilePicture] = useState<Attachment | null>(
    merchant.pictureUrl
      ? {
          url: merchant.pictureUrl,
        }
      : null
  );
  const [bannerPicture, setBannerPicture] = useState<Attachment | null>(
    merchant.bannerUrl
      ? {
          url: merchant.bannerUrl,
        }
      : null
  );
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
      setProfilePicture(null);
    } else {
      setBannerPicture(null);
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!name || !description) {
      toast.error("Please fill in all fields");
      return setIsLoading(false);
    }

    await editMerchant(id, {
      name,
      description,
      bannerUrl: bannerPicture?.url,
      profilePictureUrl: profilePicture?.url,
    });

    toast.success("Changes saved");
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col pt-4 gap-8"
    >
      <div className="px-4 lg:px-6 flex items-center">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mx-4 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/cms/${id}`}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="px-4 lg:px-6 space-y-1">
        <h1 className="text-2xl font-bold">Profile Management</h1>
        <p className="text-sm text-muted-foreground">
          Here you can manage your profile. You can update your profile
          information.
        </p>
      </div>

      <div className="space-y-4 px-4 w-full max-w-2xl lg:px-6">
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

        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} disabled={isLoading}>
            Save Changes
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
