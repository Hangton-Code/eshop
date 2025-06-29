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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { Order } from "@/db/schema";
import { editOrderSchema } from "@/actions/cms/schemas";
import { useSWRConfig } from "swr";
import { editOrder } from "@/actions/cms/orders";
import { Switch } from "../ui/switch";

type EditOrderSheetProps = {
  merchantId: string;
  order: Order;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function EditOrderSheet({ order, open, setOpen }: EditOrderSheetProps) {
  const [deliveryStatus, setDeliveryStatus] = useState(order.deliveryStatus);

  // data
  const [settled, setSettled] = useState(order.settled);
  const [receiverPhoneNo, setReceiverPhoneNo] = useState(order.receiverPhoneNo);
  const [receiverName, setReceiverName] = useState(order.receiverName);
  const [deliveryCode, setDeliveryCode] = useState(order.deliveryCode || "");
  const [deliveryAddress, setDeliveryAddress] = useState(
    JSON.stringify(order.deliveryAddress)
  );

  const { mutate } = useSWRConfig();

  const handleSubmit = async () => {
    try {
      const body = {
        deliveryAddress: deliveryAddress,
        deliveryStatus,
        id: order.id,
        receiverName,
        receiverPhoneNo,
        settled,
        deliveryCode,
      };

      const data = editOrderSchema.safeParse(body);
      if (!data.success) {
        toast.error(
          data.error.errors[0].path + ": " + data.error.errors[0].message
        );
        return;
      }

      await editOrder(body as any);
      toast.success("Order edited successfully");

      setOpen(false);
      mutate("orders");
    } catch (error) {
      toast.error("Failed to edit order");
    }
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Order</SheetTitle>
          <SheetDescription>Edit order #1.</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 h-[calc(100vh-100px)] overflow-y-auto">
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="sheet-id">Order Id</Label>

            <p>#{order.id}</p>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sheet-settled">Payment Settled?</Label>
            <Switch checked={settled} onCheckedChange={setSettled} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sheet-delivery-status">Delivery Status</Label>
            <Select
              value={deliveryStatus}
              onValueChange={setDeliveryStatus as (value: string) => void}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Delivery Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ORDERED">ORDERED</SelectItem>
                  <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                  <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                  <SelectItem value="CANCELED">CANCELED</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-2.5" />
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="sheet-receiver-name">Receiver Name</Label>
              <Input
                id="sheet-receiver-name"
                placeholder="Receiver Name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-receiver-phone-no">Receiver Phone No</Label>
              <Input
                id="sheet-receiver-phone-no"
                placeholder="Receiver Phone No"
                value={receiverPhoneNo}
                onChange={(e) => setReceiverPhoneNo(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-delivery-address">Delivery Address</Label>
              <Textarea
                id="sheet-delivery-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-delivery-code">Delivery Code</Label>
              <Input
                id="sheet-delivery-code"
                placeholder="Delivery Code"
                value={deliveryCode}
                onChange={(e) => setDeliveryCode(e.target.value)}
              />
            </div>
          </div>
          <Separator className="my-2.5" />
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
    </Sheet>
  );
}
