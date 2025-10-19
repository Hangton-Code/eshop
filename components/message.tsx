import { cn, sanitizeText } from "@/lib/utils";
import { UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import {
  SparklesIcon,
  SquareChartGantt,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { MessageReasoning } from "./message-reasoning";
import cx from "classnames";
import { z } from "zod";
import { InteractiveHoverButton } from "./magicui/interactive-hover-button";
import { useRouter } from "next/navigation";
import { Ripples } from "./icons/ripples";
import { Badge } from "./ui/badge";

const ProductDisplay = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  covers: z.array(
    z.object({
      url: z.string(),
    })
  ),
});

const OrderDisplay = z.object({
  id: z.number(),
  productDetails: z.object({
    name: z.string(),
    pictureUrl: z.string().optional(),
    brand: z.string().optional(),
    description: z.string().optional(),
    merchantId: z.string().optional(),
    merchantName: z.string().optional(),
  }),
  quantity: z.number(),
  pricePerUnit: z.number(),
  grossTotal: z.number(),
  deliveryStatus: z.enum(["ORDERED", "SHIPPED", "DELIVERED", "CANCELED"]),
  createdAt: z.string(),
});

export function Message({
  message,
  isLoading = false,
  requiresScrollPadding,
}: {
  message: UIMessage;
  isLoading: boolean;
  requiresScrollPadding: boolean;
}) {
  const router = useRouter();

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:w-fit"
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                      enableDelete={false}
                    />
                  ))}
                </div>
              )}

            {message.parts?.map((part, index) => {
              const { type } = part;

              const key = `message-${message.id}-part-${index}`;

              if (type === "reasoning") {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === "text") {
                return (
                  <div key={key} className="flex flex-row gap-2 items-start">
                    <div
                      data-testid="message-content"
                      className={cn("flex flex-col gap-4", {
                        "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                          message.role === "user",
                      })}
                    >
                      <Markdown>{sanitizeText(part.text)}</Markdown>
                    </div>
                  </div>
                );
              }

              if (type === "tool-invocation") {
                const tool = part.toolInvocation;

                if (tool.toolName === "searchProducts") {
                  const isSearching = message.parts.length - 1 === index;
                  if (!isSearching) return <div key={index}></div>;
                  return (
                    <motion.div
                      key={index}
                      className="relative w-fit border py-3 px-4  rounded-xl flex gap-3"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <Ripples className="w-5" /> Searching Products
                    </motion.div>
                  );
                }
                if (tool.toolName === "getUserOrders") {
                  const isSearching = message.parts.length - 1 === index;
                  if (!isSearching) return <div key={index}></div>;
                  return (
                    <motion.div
                      key={index}
                      className="relative w-fit border py-3 px-4  rounded-xl flex gap-3"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <Ripples className="w-5" /> Fetching Your Orders
                    </motion.div>
                  );
                }
                if (tool.toolName === "showFoundProducts") {
                  return (
                    <div key={index} className="space-y-2">
                      {(
                        tool.args.products as z.infer<typeof ProductDisplay>[]
                      ).map((product) => (
                        <motion.div
                          className="relative bg-gradient-to-br transition-colors group hover:to-neutral-200/60 w-fit from-neutral-50 to-neutral-100 border p-3 rounded-xl flex gap-3"
                          key={product.id}
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                        >
                          <div>
                            {product.covers[0] ? (
                              <img
                                src={product.covers[0].url ?? "/no-image.png"}
                                alt={product.name}
                                draggable="false"
                                className="w-32 h-32 object-contain bg-background rounded-sm select-none"
                              />
                            ) : (
                              <div className="w-32 h-32 bg-background rounded-sm select-none flex justify-center items-center">
                                <SquareChartGantt className="w-24 h-24" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 pt-1 w-[300px] flex flex-col">
                            <p className="w-full text-lg font-medium">
                              {product.name}
                            </p>
                            <h1 className="text-xl font-extrabold">
                              {product.price.toLocaleString("en-US", {
                                style: "currency",
                                currency: "HKD",
                              })}
                            </h1>
                            <InteractiveHoverButton
                              className="absolute bottom-4 right-4"
                              onClick={() => {
                                router.push(`/product/${product.id}`);
                              }}
                            >
                              Show in Shop
                            </InteractiveHoverButton>
                          </div>

                          <div></div>
                        </motion.div>
                      ))}
                    </div>
                  );
                }
                if (tool.toolName === "showUserOrders") {
                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case "ORDERED":
                        return <Package className="w-4 h-4" />;
                      case "SHIPPED":
                        return <Truck className="w-4 h-4" />;
                      case "DELIVERED":
                        return <CheckCircle className="w-4 h-4" />;
                      case "CANCELED":
                        return <XCircle className="w-4 h-4" />;
                      default:
                        return <Package className="w-4 h-4" />;
                    }
                  };

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case "ORDERED":
                        return "bg-blue-100 text-blue-800 border-blue-200";
                      case "SHIPPED":
                        return "bg-purple-100 text-purple-800 border-purple-200";
                      case "DELIVERED":
                        return "bg-green-100 text-green-800 border-green-200";
                      case "CANCELED":
                        return "bg-red-100 text-red-800 border-red-200";
                      default:
                        return "bg-gray-100 text-gray-800 border-gray-200";
                    }
                  };

                  const orders = tool.args.orders as z.infer<
                    typeof OrderDisplay
                  >[];

                  return (
                    <div key={index} className="space-y-2">
                      {orders.map((order) => (
                        <motion.div
                          className="relative bg-gradient-to-br transition-colors group hover:to-neutral-200/60 w-fit from-neutral-50 to-neutral-100 border p-3 rounded-xl flex gap-3"
                          key={order.id}
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                        >
                          <div>
                            {order.productDetails.pictureUrl ? (
                              <img
                                src={order.productDetails.pictureUrl}
                                alt={order.productDetails.name}
                                draggable="false"
                                className="w-32 h-32 object-contain bg-background rounded-sm select-none"
                              />
                            ) : (
                              <div className="w-32 h-32 bg-background rounded-sm select-none flex justify-center items-center">
                                <Package className="w-24 h-24" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 pt-1 w-[300px] flex flex-col">
                            <p className="w-full text-lg font-medium">
                              {order.productDetails.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "flex items-center gap-1",
                                  getStatusColor(order.deliveryStatus)
                                )}
                              >
                                {getStatusIcon(order.deliveryStatus)}
                                {order.deliveryStatus}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Qty: {order.quantity}
                              </span>
                            </div>
                            <h1 className="text-xl font-extrabold">
                              {order.grossTotal.toLocaleString("en-US", {
                                style: "currency",
                                currency: "HKD",
                              })}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                              Order #{order.id} •{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {orders.length > 0 && (
                        <motion.div
                          className="flex justify-center pt-2"
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                        >
                          <InteractiveHoverButton
                            onClick={() => {
                              router.push("/orders");
                            }}
                          >
                            View All Orders
                          </InteractiveHoverButton>
                        </motion.div>
                      )}
                    </div>
                  );
                }
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
