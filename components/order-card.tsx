import { Order, ProductDetails } from "@/db/schema";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function OrderCard({ order }: { order: Order }) {
  const productDetails = order.productDetails as ProductDetails;
  const merchantId = productDetails.merchantId;
  const merchantName = productDetails.merchantName;

  return (
    <div
      key={order.id}
      className="w-full border p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex gap-3"
    >
      <img
        className="w-[20%] max-w-52 aspect-square object-contain bg-background rounded-md"
        src={productDetails.pictureUrl}
        alt={productDetails.name}
      />
      <div className="grow flex justify-between py-2">
        <div className="space-y-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Badge>Order Id: #{order.id}</Badge>

            <Badge variant={"outline"} className="max-md:hidden">
              STRIPE: {order.stripePaymentId}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <Link
              className="text-xl font-medium hover:underline"
              href={`/product/${order.productId}`}
            >
              <p className="w-full max-w-120 truncate">
                {productDetails.name}{" "}
              </p>
            </Link>
            {merchantId && merchantName && (
              <p className="text-sm group">
                From{" "}
                <Link
                  className="group-hover:underline"
                  href={`/merchant/${merchantId}`}
                >
                  {merchantName}
                </Link>
              </p>
            )}
          </div>
          <div>
            <p className="leading-snug">
              <span className="text-muted-foreground text-xs">
                Total Price:{" "}
              </span>
              <br></br>
              <span className="font-extrabold text-lg">
                {order.grossTotal.toLocaleString("en-US", {
                  style: "currency",
                  currency: "HKD",
                })}
              </span>
              <br></br>
              <span className="text-muted-foreground text-xs">
                ={" "}
                {order.pricePerUnit.toLocaleString("en-US", {
                  style: "currency",
                  currency: "HKD",
                })}{" "}
                x {order.quantity}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between">
          <p className="text-muted-foreground text-right">
            {order.settled ? "PAYMENT SETTLED" : "PAYMENT UNSUCCESSFULL"}
          </p>
          <p className="text-muted-foreground  text-right">
            {order.deliveryStatus}
            {order.deliveryCode ? `, #${order.deliveryCode}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
