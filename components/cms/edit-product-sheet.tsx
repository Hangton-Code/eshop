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
} from "@/components/ui/sheet";
import { Plus, X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { CategoryCombobox } from "./category-combobox";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Attachment } from "ai";
import { PreviewAttachment } from "../preview-attachment";
import { Product } from "@/db/schema";
import { editProductSchema } from "@/actions/cms/schemas";
import { editProduct } from "@/actions/cms/products";
import { useSWRConfig } from "swr";

type EditProductSheetProps = {
  merchantId: string;
  product: Product;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function EditProductSheet({
  merchantId,
  product,
  open,
  setOpen,
}: EditProductSheetProps) {
  const [category, setCategory] = useState(product.category);

  //   cover files
  const [covers, setCovers] = useState<Attachment[]>(
    product.covers as Attachment[]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  // data
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [inventory, setInventory] = useState(product.inventory);
  const [description, setDescription] = useState(product.description);
  const [code, setCode] = useState(product.code);
  const [brand, setBrand] = useState(product.brand);
  const [mfgCountry, setMfgCountry] = useState(product.mfgCountry);

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

  const { mutate } = useSWRConfig();

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
        id: product.id,
      };

      const data = editProductSchema.safeParse(body);
      if (!data.success) {
        toast.error(
          data.error.errors[0].path + ": " + data.error.errors[0].message
        );
        return;
      }

      await editProduct(body as any);
      toast.success("Product edited successfully");

      setOpen(false);
      mutate("products");
    } catch (error) {
      toast.error("Failed to edit product");
    }
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
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
                <div className="relative" key={attachment.url}>
                  <PreviewAttachment attachment={attachment} />
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
