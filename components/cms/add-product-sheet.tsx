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
import { Plus, PlusIcon, X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { CategoryCombobox } from "./category-combobox";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import { Attachment } from "ai";
import { PreviewAttachment } from "../preview-attachment";
import { addProduct } from "@/actions/cms/products";
import { addProductSchema } from "@/actions/cms/schemas";
import { Product } from "@/db/schema";

type AddProductSheetProps = {
  merchantId: string;
  initialData: {
    code: number;
  };
  refresh: () => void;
};

export function AddProductSheet({
  merchantId,
  refresh,
  initialData,
}: AddProductSheetProps) {
  const [open, setOpen] = useState(false);

  //   cover files
  const [covers, setCovers] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  // data
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [description, setDescription] = useState("");
  const [code, setCode] = useState(initialData.code);
  const [brand, setBrand] = useState("");
  const [mfgCountry, setMfgCountry] = useState("");

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

      setOpen(false);
    } catch (error) {
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

        setCovers((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setCovers]
  );

  const handleRemoveCover = (url: string) => {
    setCovers((currentCovers) =>
      currentCovers.filter((cover) => cover.url !== url)
    );
  };

  const handleSubmit = async () => {
    try {
      const body = {
        name,
        inventory,
        price,
        category,
        description,
        code,
        merchantId,
        brand,
        mfgCountry,
        covers,
      };

      const data = addProductSchema.safeParse(body);
      if (!data.success) {
        toast.error(
          data.error.errors[0].path + ": " + data.error.errors[0].message
        );
        return;
      }

      await addProduct(body as any);
      toast.success("Product added successfully");

      setName("");
      setPrice(0);
      setInventory(0);
      setDescription("");
      setCode((prev) => prev + 1);
      setBrand("");
      setMfgCountry("");
      setCovers([]);

      setOpen(false);
      refresh();
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon />
          <span className="hidden lg:inline">Add Product</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Product</SheetTitle>
          <SheetDescription>Add a new product to your store.</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 h-[calc(100vh-100px)] overflow-y-auto">
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="sheet-code">Product Code</Label>
              <Badge variant="secondary">Unique</Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <p>#</p>
              <Input
                id="sheet-code"
                className="w-18 [&::-webkit-inner-spin-button]:appearance-none text-center"
                value={code.toString()}
                onChange={(e) => setCode(Number(e.target.value))}
                type="number"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-name">Name</Label>
            <Input
              id="sheet-name"
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="sheet-description">Description</Label>
            <Textarea
              id="sheet-description"
              placeholder="The more detailed description of the product, the easier customers will find it."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sheet-description">Category</Label>
              <CategoryCombobox value={category} setValue={setCategory} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sheet-brand">Brand</Label>
              <Input
                id="sheet-brand"
                className="w-40"
                placeholder="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sheet-mfgCountry">Manufacturing Country</Label>
              <Input
                id="sheet-mfgCountry"
                className="w-40"
                placeholder="Country"
                value={mfgCountry}
                onChange={(e) => setMfgCountry(e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-2.5" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sheet-price">Price per unit (HKD)</Label>
              <div className="flex items-center gap-1.5">
                <p>$</p>
                <Input
                  id="sheet-price"
                  className="w-18 [&::-webkit-inner-spin-button]:appearance-none text-center"
                  type="number"
                  value={price.toString()}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sheet-inventory">Inventory (Units)</Label>
              <Input
                id="sheet-inventory"
                className="w-18 [&::-webkit-inner-spin-button]:appearance-none text-center"
                type="number"
                value={inventory.toString()}
                onChange={(e) => setInventory(Number(e.target.value))}
              />
            </div>
          </div>
          <Separator className="my-2.5" />
          {(covers.length > 0 || uploadQueue.length > 0) && (
            <div
              data-testid="attachments-preview"
              className="flex flex-row gap-2 items-end w-full overflow-x-auto"
            >
              {covers.map((attachment) => (
                <div className="relative">
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-0 right-0 w-6 h-6"
                    onClick={() => handleRemoveCover(attachment.url)}
                  >
                    <X />
                  </Button>
                </div>
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
          <Button
            variant={"secondary"}
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus />
            Add Cover Images
          </Button>
        </div>
        <SheetFooter>
          <Button type="submit" onClick={handleSubmit}>
            Save changes
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />
    </Sheet>
  );
}
